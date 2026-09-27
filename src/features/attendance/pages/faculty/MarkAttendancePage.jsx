import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import attendanceService from "../../api/attendance.service";
import { getErrorMessage } from "@/shared/utils/errors";
import {
  ATTENDANCE_STATUSES,
  fmtDate,
  fmtPercent,
  fmtTime,
  policyMinPercent,
  rosterHeldSessions,
  rosterPolicy,
  rosterSession,
  rosterStudents,
  rowCurrentStatus,
  rowEnrollmentId,
  rowIsDefaulter,
  rowName,
  rowPercent,
  rowRemarks,
  rowRollNo,
  sessionDate,
  sessionEnd,
  sessionIsCancelled,
  sessionIsLocked,
  sessionOfferingLabel,
  sessionStart,
  sessionTopic,
} from "../../utils/attendanceMappers";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  ErrorState,
  Field,
  Loading,
  Notice,
  PageHeader,
  ProgressBar,
  RawDebug,
  inputClass,
} from "../../components/ui";

export default function MarkAttendancePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [raw, setRaw] = useState(null);
  const [session, setSession] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [heldSoFar, setHeldSoFar] = useState(0);
  const [rows, setRows] = useState([]);
  const [topic, setTopic] = useState("");
  const [fillMissing, setFillMissing] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const roster = await attendanceService.getSessionRoster(sessionId);
      setRaw(roster);

      let sessionData = rosterSession(roster);
      if (!sessionData) sessionData = await attendanceService.getSession(sessionId);

      setSession(sessionData);
      setTopic(sessionTopic(sessionData) || "");
      setPolicy(rosterPolicy(roster));
      setHeldSoFar(rosterHeldSessions(roster));

      const students = rosterStudents(roster).map((s, index) => ({
        key: String(rowEnrollmentId(s) ?? index),
        enrollment: rowEnrollmentId(s),
        name: rowName(s),
        rollNo: rowRollNo(s),
        status: rowCurrentStatus(s),
        remarks: rowRemarks(s),
        percent: rowPercent(s),
        isDefaulter: rowIsDefaulter(s),
      }));

      students.sort((a, b) =>
        String(a.rollNo).localeCompare(String(b.rollNo), undefined, { numeric: true })
      );
      setRows(students);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the roster for this session."));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const readOnly = Boolean(session && (sessionIsLocked(session) || sessionIsCancelled(session)));

  const setRow = (key, patch) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const markAll = (status) => setRows((prev) => prev.map((r) => ({ ...r, status })));

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || String(r.rollNo).toLowerCase().includes(q)
    );
  }, [rows, search]);

  const counts = useMemo(() => {
    const base = ATTENDANCE_STATUSES.map((s) => ({
      ...s,
      n: rows.filter((r) => r.status === s.value).length,
    }));
    return [...base, { value: "", label: "Not marked", n: rows.filter((r) => !r.status).length }];
  }, [rows]);

  const minPercent = policyMinPercent(policy);

  async function handleSave() {
    const marked = rows.filter((r) => r.status);
    if (!marked.length) {
      toast.error("Mark at least one student first.");
      return;
    }
    const missingId = rows.find((r) => !r.enrollment);
    if (missingId) {
      toast.error(
        "A roster row has no enrollment id. Open “Show raw API response” and check rowEnrollmentId() in attendanceMappers.js"
      );
      return;
    }
    const unmarked = rows.length - marked.length;
    if (unmarked > 0 && !fillMissing) {
      const ok = window.confirm(
        `${unmarked} student(s) have no status and "fill missing as absent" is OFF. They will be left unmarked. Continue?`
      );
      if (!ok) return;
    }

    setSaving(true);
    try {
      const result = await attendanceService.markSessionAttendance(sessionId, {
        records: marked.map((r) => ({
          enrollment: r.enrollment,
          status: r.status,
          remarks: r.remarks,
        })),
        topic,
        fill_missing_as_absent: fillMissing,
      });

      const created = result?.created ?? result?.created_count;
      const updated = result?.updated ?? result?.updated_count;
      toast.success(
        created !== undefined || updated !== undefined
          ? `Saved — ${created ?? 0} created, ${updated ?? 0} updated.`
          : "Attendance saved."
      );
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save attendance."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading label="Loading roster…" />;
  if (error)
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <ErrorState message={error} onRetry={load} />
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHeader
        title="Mark Attendance"
        subtitle={
          session
            ? [
                sessionOfferingLabel(session),
                fmtDate(sessionDate(session)),
                `${fmtTime(sessionStart(session))}${
                  sessionEnd(session) ? ` – ${fmtTime(sessionEnd(session))}` : ""
                }`,
              ]
                .filter(Boolean)
                .join(" · ")
            : ""
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/attendance")}>
            ← Back to sessions
          </Button>
        }
      />

      {session && sessionIsCancelled(session) && (
        <Notice tone="slate">This session is <strong>cancelled</strong>. Attendance cannot be marked.</Notice>
      )}
      {session && !sessionIsCancelled(session) && sessionIsLocked(session) && (
        <Notice tone="sky">
          Attendance for this session is <strong>locked</strong>. Ask an admin to unlock it if a
          correction is needed.
        </Notice>
      )}

      <Card title="Session details" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Topic" hint="Saved together with the attendance.">
            <input
              type="text"
              className={inputClass}
              value={topic}
              disabled={readOnly}
              placeholder="e.g. Normalisation, 3NF"
              onChange={(e) => setTopic(e.target.value)}
            />
          </Field>
          <div className="flex flex-col justify-end gap-2 text-sm text-slate-600">
            <p>
              Sessions held in this course so far: <strong>{heldSoFar || "—"}</strong>
            </p>
            {minPercent !== null && (
              <p>
                Policy minimum: <strong>{fmtPercent(minPercent)}</strong>
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Quick actions:</span>
        <Button
          variant="success"
          className="px-3 py-1.5"
          disabled={readOnly}
          onClick={() => markAll("present")}
        >
          All present
        </Button>
        <Button
          variant="danger"
          className="px-3 py-1.5"
          disabled={readOnly}
          onClick={() => markAll("absent")}
        >
          All absent
        </Button>
        <Button
          variant="secondary"
          className="px-3 py-1.5"
          disabled={readOnly}
          onClick={() => markAll("")}
        >
          Clear
        </Button>

        <div className="ml-auto flex flex-wrap gap-3 text-xs text-slate-600">
          {counts.map((c) => (
            <span key={c.value || "unmarked"}>
              <strong>{c.n}</strong> {c.label.toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No students on this roster"
          message="Nobody is actively enrolled in this course offering."
        />
      ) : (
        <Card
          title={`${rows.length} student(s)`}
          actions={
            <input
              type="search"
              placeholder="Search name or roll no…"
              className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Roll no</th>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2 w-40">Cumulative</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r, index) => (
                  <tr key={r.key} className="border-b border-slate-100">
                    <td className="px-3 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">{r.rollNo}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-800">{r.name}</span>
                        {r.isDefaulter && <Badge tone="rose">Defaulter</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          percent={r.percent}
                          threshold={minPercent !== null ? Number(minPercent) : 75}
                        />
                        <span className="w-14 text-right text-xs font-semibold text-slate-600">
                          {fmtPercent(r.percent)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {ATTENDANCE_STATUSES.map((s) => {
                          const active = r.status === s.value;
                          return (
                            <button
                              key={s.value}
                              type="button"
                              title={s.label}
                              disabled={readOnly}
                              onClick={() =>
                                setRow(r.key, { status: active ? "" : s.value })
                              }
                              className={`h-8 w-8 rounded-md border text-xs font-bold transition disabled:opacity-40 ${
                                active
                                  ? "border-transparent bg-slate-900 text-white"
                                  : "border-slate-300 bg-white text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              {s.short}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        placeholder="Optional"
                        disabled={readOnly}
                        className={`${inputClass} min-w-[10rem]`}
                        value={r.remarks}
                        onChange={(e) => setRow(r.key, { remarks: e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Checkbox
                label="Fill missing students as absent"
                hint="Students you left blank will be saved as absent."
                checked={fillMissing}
                disabled={readOnly}
                onChange={setFillMissing}
              />
              <p className="mt-2 text-xs text-slate-400">P = Present · A = Absent · L = Leave</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={load} disabled={saving}>
                Reload
              </Button>
              <Button onClick={handleSave} disabled={saving || readOnly}>
                {saving ? "Saving…" : "Save attendance"}
              </Button>
            </div>
          </div>

          <RawDebug data={raw} label="Show raw roster JSON" />
        </Card>
      )}
    </div>
  );
}
