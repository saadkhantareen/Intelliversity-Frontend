import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import attendanceService from "../../api/attendance.service";
import lookupsService from "@/shared/api/lookups.service";
import { getErrorMessage } from "@/shared/utils/errors";
import {
  fmtDate,
  fmtTime,
  offeringId,
  offeringLabel,
  sessionDate,
  sessionEnd,
  sessionId,
  sessionIsCancelled,
  sessionIsLocked,
  sessionIsMarked,
  sessionOfferingLabel,
  sessionStart,
  sessionTopic,
  todayISO,
} from "../../utils/attendanceMappers";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Loading,
  PageHeader,
  RawDebug,
  SimpleSelect,
  inputClass,
} from "../../components/ui";

const blankForm = {
  session_date: todayISO(),
  start_time: "09:00",
  end_time: "10:00",
  topic: "",
};

export default function FacultySessionsPage() {
  const [tab, setTab] = useState("today");

  const [offerings, setOfferings] = useState([]);
  const [offeringsError, setOfferingsError] = useState("");
  const [selected, setSelected] = useState("");

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await lookupsService.listMyCourseOfferings();
        if (!alive) return;
        setOfferings(data);
        if (data.length === 1) setSelected(String(offeringId(data[0])));
      } catch (err) {
        if (alive) setOfferingsError(getErrorMessage(err, "Could not load your courses."));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const offeringOptions = useMemo(
    () =>
      offerings.map((o) => ({ value: String(offeringId(o)), label: offeringLabel(o) })),
    [offerings]
  );

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data =
        tab === "today"
          ? await attendanceService.listTodaySessions()
          : selected
          ? await attendanceService.listSessions({ course_offering: selected })
          : [];
      setSessions(data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load class sessions."));
    } finally {
      setLoading(false);
    }
  }, [tab, selected]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!selected) {
      toast.error("Choose a course offering first.");
      return;
    }
    setSaving(true);
    try {
      await attendanceService.createSession({
        course_offering: selected,
        session_date: form.session_date,
        start_time: form.start_time,
        end_time: form.end_time,
        topic: form.topic,
      });
      toast.success("Class session created.");
      setForm(blankForm);
      setShowForm(false);
      setTab("course");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create the session."));
    } finally {
      setSaving(false);
    }
  }

  async function runAction(id, fn, successText) {
    setBusyId(id);
    try {
      await fn();
      toast.success(successText);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Action failed."));
    } finally {
      setBusyId(null);
    }
  }

  const handleCancel = (id) => {
    const reason = window.prompt("Reason for cancelling this session? (optional)");
    if (reason === null) return;
    runAction(id, () => attendanceService.cancelSession(id, reason), "Session cancelled.");
  };

  const handleLock = (id) =>
    runAction(id, () => attendanceService.lockSession(id), "Attendance locked.");

  const handleDelete = (id) => {
    if (!window.confirm("Delete this session and its attendance records?")) return;
    runAction(id, () => attendanceService.deleteSession(id), "Session deleted.");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader
        title="Attendance — Class Sessions"
        subtitle="Open a session and mark the roster. Lock it when you're done."
        actions={
          <>
            <Link to="/attendance/course-summary">
              <Button variant="secondary">Course summary</Button>
            </Link>
            <Button
              onClick={() => {
                setTab("course");
                setShowForm((s) => !s);
              }}
            >
              {showForm ? "Cancel" : "+ New session"}
            </Button>
          </>
        }
      />

      <div className="mb-5 flex gap-2">
        {[
          { key: "today", label: "Today" },
          { key: "course", label: "By course" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "course" && (
        <div className="mb-6 max-w-xl">
          <SimpleSelect
            label="Course offering"
            options={offeringOptions}
            value={selected}
            onChange={setSelected}
            placeholder="— Select a course —"
          />
          {offeringsError && <p className="mt-2 text-sm text-rose-600">{offeringsError}</p>}
          {!offeringsError && offeringOptions.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              No course offerings are assigned to you yet. Ask an admin to assign you.
            </p>
          )}
        </div>
      )}

      {showForm && tab === "course" && (
        <Card title="New class session" className="mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.session_date}
                onChange={(e) => setForm({ ...form, session_date: e.target.value })}
              />
            </Field>
            <Field label="Topic">
              <input
                type="text"
                placeholder="e.g. Recursion basics"
                className={inputClass}
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </Field>
            <Field label="Start time" required>
              <input
                type="time"
                required
                className={inputClass}
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </Field>
            <Field label="End time" required>
              <input
                type="time"
                required
                className={inputClass}
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving || !selected}>
                {saving ? "Saving…" : "Create session"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && loading && <Loading label="Loading sessions…" />}

      {!error && !loading && sessions.length === 0 && (
        <EmptyState
          title={tab === "today" ? "Nothing scheduled for today" : "No class sessions yet"}
          message={
            tab === "today"
              ? "Switch to “By course” to see or create other sessions."
              : selected
              ? "Click “+ New session” to create the first one."
              : "Pick a course offering above."
          }
        />
      )}

      {!error && !loading && sessions.length > 0 && (
        <Card title={`${sessions.length} session(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  {tab === "today" && <th className="px-3 py-2">Course</th>}
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const id = sessionId(s);
                  const cancelled = sessionIsCancelled(s);
                  const locked = sessionIsLocked(s);
                  const marked = sessionIsMarked(s);
                  const busy = busyId === id;
                  return (
                    <tr key={id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-800">
                        {fmtDate(sessionDate(s))}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {fmtTime(sessionStart(s))}
                        {sessionEnd(s) ? ` – ${fmtTime(sessionEnd(s))}` : ""}
                      </td>
                      {tab === "today" && (
                        <td className="px-3 py-3 text-slate-600">
                          {sessionOfferingLabel(s) || "—"}
                        </td>
                      )}
                      <td className="px-3 py-3 text-slate-600">{sessionTopic(s) || "—"}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {cancelled && <Badge tone="slate">Cancelled</Badge>}
                          {!cancelled && marked && <Badge tone="emerald">Marked</Badge>}
                          {!cancelled && !marked && <Badge tone="amber">Pending</Badge>}
                          {locked && <Badge tone="sky">Locked</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link to={`/attendance/sessions/${id}/mark`}>
                            <Button variant="primary" className="px-3 py-1.5">
                              {locked ? "View" : marked ? "Edit" : "Mark"}
                            </Button>
                          </Link>
                          {!locked && marked && !cancelled && (
                            <Button
                              variant="secondary"
                              className="px-3 py-1.5"
                              disabled={busy}
                              onClick={() => handleLock(id)}
                            >
                              Lock
                            </Button>
                          )}
                          {!cancelled && (
                            <Button
                              variant="secondary"
                              className="px-3 py-1.5"
                              disabled={busy}
                              onClick={() => handleCancel(id)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            className="px-3 py-1.5"
                            disabled={busy}
                            onClick={() => handleDelete(id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <RawDebug data={sessions} label="Show raw sessions JSON" />
        </Card>
      )}
    </div>
  );
}
