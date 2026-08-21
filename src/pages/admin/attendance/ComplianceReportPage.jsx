// src/pages/admin/attendance/ComplianceReportPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";

import attendanceService from "../../../services/attendance.service";
import lookupsService from "../../../services/lookups.service";
import { getErrorMessage } from "../../../utils/errors";
import { fmtPercent, pick, termId, termLabel, toList } from "../../../utils/attendanceMappers";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  Notice,
  PageHeader,
  ProgressBar,
  RawDebug,
  SimpleSelect,
  StatCard,
} from "../../../components/attendance/ui";

/* ------- readers that work for faculty-level OR offering-level rows ------- */
const totalSessions = (r) =>
  Number(pick(r, ["held_sessions", "total_sessions", "sessions_held", "total"], 0)) || 0;

const markedSessions = (r) =>
  Number(pick(r, ["marked_sessions", "sessions_marked", "marked", "completed_sessions"], 0)) || 0;

const pendingSessions = (r) => {
  const explicit = pick(r, ["pending_sessions", "unmarked_sessions", "pending"]);
  if (explicit !== undefined) return Number(explicit) || 0;
  return Math.max(0, totalSessions(r) - markedSessions(r));
};

const compliancePct = (r) => {
  const explicit = pick(r, [
    "compliance_percentage",
    "compliance_percent",
    "marked_percentage",
    "percentage",
  ]);
  if (explicit !== undefined) {
    const n = Number(explicit);
    if (Number.isFinite(n)) return n;
  }
  const t = totalSessions(r);
  return t ? (markedSessions(r) / t) * 100 : null;
};

const rowLabel = (r) =>
  pick(
    r,
    [
      "course_offering_display",
      "course_offering_name",
      "course_name",
      "course_code",
      "faculty_name",
      "teacher_name",
      "instructor_name",
      "name",
    ],
    "—"
  );

const rowTeacher = (r) =>
  pick(r, ["faculty_name", "teacher_name", "instructor_name", "faculty", "teacher"], "");

export default function ComplianceReportPage() {
  const [terms, setTerms] = useState([]);
  const [termsError, setTermsError] = useState("");
  const [term, setTerm] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ------------------------------- terms ------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const list = await lookupsService.listTerms();
        setTerms(list);
        if (list.length === 1) setTerm(String(termId(list[0])));
      } catch (err) {
        setTermsError(getErrorMessage(err, "Could not load the list of terms."));
      }
    })();
  }, []);

  const termOptions = useMemo(
    () => terms.map((t) => ({ value: String(termId(t)), label: termLabel(t) })),
    [terms]
  );

  /* -------------------------------- load ------------------------------ */
  const load = useCallback(async () => {
    if (!term) {
      setData(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setData(await attendanceService.getComplianceReport({ term }));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the compliance report."));
    } finally {
      setLoading(false);
    }
  }, [term]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return toList(
      data.compliance ||
        data.course_offerings ||
        data.faculty ||
        data.rows ||
        data.results ||
        []
    );
  }, [data]);

  const overall = useMemo(() => {
    const explicit = pick(data, ["overall_compliance_percentage", "overall_percentage"]);
    const t = rows.reduce((a, r) => a + totalSessions(r), 0);
    const m = rows.reduce((a, r) => a + markedSessions(r), 0);
    const n = Number(explicit);
    return {
      total: t,
      marked: m,
      pending: Math.max(0, t - m),
      pct: Number.isFinite(n) ? n : t ? (m / t) * 100 : null,
    };
  }, [data, rows]);

  /* ------------------------------- render ----------------------------- */
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader
        title="Attendance Compliance Report"
        subtitle="Are class sessions actually being marked?"
        actions={
          <Button variant="secondary" onClick={load} disabled={!term || loading}>
            Refresh
          </Button>
        }
      />

      {termsError && (
        <Notice tone="rose">
          {termsError} Add the correct terms URL to <code>TERM_URLS</code> in{" "}
          <code>src/services/lookups.service.js</code>.
        </Notice>
      )}

      <Card title="Term (required)" className="mb-6">
        <div className="max-w-xl">
          <SimpleSelect
            label="Academic term"
            options={termOptions}
            value={term}
            onChange={setTerm}
            placeholder="— Select a term —"
            required
            hint="The backend requires a term for this report."
          />
        </div>
      </Card>

      {!term && (
        <EmptyState
          title="Select a term"
          message="Choose an academic term above to generate the compliance report."
        />
      )}

      {term && error && <ErrorState message={error} onRetry={load} />}
      {term && !error && loading && <Loading label="Generating report…" />}

      {term && !error && !loading && data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Sessions held" value={overall.total || "—"} />
            <StatCard label="Marked" tone="emerald" value={overall.marked} />
            <StatCard label="Not marked" tone="rose" value={overall.pending} />
            <StatCard
              label="Overall compliance"
              tone={(overall.pct ?? 100) < 90 ? "amber" : "emerald"}
              value={fmtPercent(overall.pct)}
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="No data for this term"
              message="No class sessions exist for the selected term yet."
            />
          ) : (
            <Card title={`${rows.length} row(s)`}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Course / Faculty</th>
                      <th className="px-3 py-2 text-center">Held</th>
                      <th className="px-3 py-2 text-center">Marked</th>
                      <th className="px-3 py-2 text-center">Pending</th>
                      <th className="px-3 py-2 w-48">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const pct = compliancePct(r);
                      const teacher = rowTeacher(r);
                      const label = rowLabel(r);
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3">
                            <p className="font-medium text-slate-800">{label}</p>
                            {teacher && teacher !== label && (
                              <p className="text-xs text-slate-500">
                                {typeof teacher === "object"
                                  ? pick(teacher, ["name", "full_name"], "")
                                  : teacher}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">{totalSessions(r)}</td>
                          <td className="px-3 py-3 text-center text-emerald-600">
                            {markedSessions(r)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {pendingSessions(r) > 0 ? (
                              <Badge tone="rose">{pendingSessions(r)}</Badge>
                            ) : (
                              <Badge tone="emerald">0</Badge>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <ProgressBar percent={pct} threshold={90} />
                              <span className="w-16 text-right text-xs font-semibold text-slate-700">
                                {fmtPercent(pct)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <RawDebug data={data} label="Show raw compliance JSON" />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
