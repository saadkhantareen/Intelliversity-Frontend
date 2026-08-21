// src/pages/student/attendance/MyAttendancePage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";

import attendanceService from "../../../services/attendance.service";
import { getErrorMessage } from "../../../utils/errors";
import {
  fmtDate,
  fmtPercent,
  idOf,
  offeringLabel,
  pick,
  recordRemarks,
  recordSessionDate,
  recordStatus,
  recordTopic,
  summaryAbsent,
  summaryIsDefaulter,
  summaryLeave,
  summaryPercent,
  summaryPresent,
  summaryRequiredPercent,
  summaryTotal,
  toList,
} from "../../../utils/attendanceMappers";
import {
  Badge,
  EmptyState,
  ErrorState,
  Loading,
  Notice,
  PageHeader,
  ProgressBar,
  RawDebug,
  StatCard,
  StatusPill,
} from "../../../components/attendance/ui";

export default function MyAttendancePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await attendanceService.getMySummary());
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your attendance."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** /summary/me/ may be a list, or { courses: [...] } / { course_offerings: [...] } */
  const courses = useMemo(() => {
    if (!summary) return [];
    if (Array.isArray(summary)) return summary;
    return toList(
      summary.courses ||
        summary.course_offerings ||
        summary.course_summaries ||
        summary.results ||
        []
    );
  }, [summary]);

  const required = useMemo(() => {
    const fromRoot = summary && !Array.isArray(summary) ? summaryRequiredPercent(summary) : null;
    if (fromRoot !== null && fromRoot !== undefined) return Number(fromRoot);
    for (const c of courses) {
      const v = summaryRequiredPercent(c);
      if (v !== null && v !== undefined) return Number(v);
    }
    return 75;
  }, [summary, courses]);

  const overall = useMemo(() => {
    if (summary && !Array.isArray(summary)) {
      const root = summaryPercent(summary);
      if (root !== null) return root;
    }
    const held = courses.reduce((a, c) => a + summaryTotal(c), 0);
    if (!held) return null;
    const present = courses.reduce((a, c) => a + summaryPresent(c) + summaryLeave(c), 0);
    return (present / held) * 100;
  }, [summary, courses]);

  const offeringKey = (c) =>
    idOf(pick(c, ["course_offering", "course_offering_id", "offering_id", "id"]));

  async function toggleCourse(course) {
    const id = offeringKey(course);
    if (!id) return;
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await attendanceService.getMyCourseSummary(id));
    } catch (err) {
      setDetail({ __error: getErrorMessage(err, "Could not load session details.") });
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) return <Loading label="Loading your attendance…" />;

  const atRisk = courses.filter(
    (c) => summaryIsDefaulter(c) || (summaryPercent(c) ?? 100) < required
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHeader
        title="My Attendance"
        subtitle="Tap a course to see each class session."
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <StatCard
              label="Overall"
              value={fmtPercent(overall)}
              hint={`Required: ${fmtPercent(required)}`}
              tone={(overall ?? 100) < required ? "rose" : "emerald"}
            />
            <StatCard label="Courses" value={courses.length} />
            <StatCard
              label="Present"
              tone="emerald"
              value={courses.reduce((a, c) => a + summaryPresent(c), 0)}
            />
            <StatCard
              label="Absent"
              tone="rose"
              value={courses.reduce((a, c) => a + summaryAbsent(c), 0)}
            />
          </div>

          {atRisk.length > 0 && (
            <Notice tone="amber">
              ⚠️ You are below the required {fmtPercent(required)} in{" "}
              <strong>{atRisk.length}</strong> course
              {atRisk.length > 1 ? "s" : ""}. Contact your instructor as soon as possible.
            </Notice>
          )}

          {courses.length === 0 ? (
            <EmptyState
              title="No attendance data yet"
              message="Once your teachers start marking attendance it will appear here."
            />
          ) : (
            <div className="space-y-3">
              {courses.map((c, i) => {
                const id = offeringKey(c) ?? i;
                const pct = summaryPercent(c);
                const low = summaryIsDefaulter(c) || (pct ?? 100) < required;
                const isOpen = openId === id;
                return (
                  <div
                    key={id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCourse(c)}
                      className="flex w-full flex-col gap-3 px-5 py-4 text-left hover:bg-slate-50 sm:flex-row sm:items-center"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">{offeringLabel(c)}</p>
                          {low && <Badge tone="rose">At risk</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {summaryPresent(c)} present · {summaryAbsent(c)} absent ·{" "}
                          {summaryLeave(c)} leave · {summaryTotal(c)} held
                        </p>
                      </div>
                      <div className="flex w-full items-center gap-3 sm:w-56">
                        <ProgressBar percent={pct} threshold={required} />
                        <span
                          className={`w-16 text-right text-sm font-semibold ${
                            low ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {fmtPercent(pct)}
                        </span>
                      </div>
                      <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                        {detailLoading && <Loading label="Loading sessions…" />}
                        {!detailLoading && detail?.__error && (
                          <p className="text-sm text-rose-600">{detail.__error}</p>
                        )}
                        {!detailLoading && detail && !detail.__error && (
                          <SessionList detail={detail} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <RawDebug data={summary} />
        </>
      )}
    </div>
  );
}

function SessionList({ detail }) {
  const records = Array.isArray(detail)
    ? detail
    : toList(
        detail.records || detail.sessions || detail.attendance || detail.results || []
      );

  if (!records.length) {
    return (
      <>
        <p className="text-sm text-slate-500">No individual session records found.</p>
        <RawDebug data={detail} label="Show raw course detail JSON" />
      </>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Topic</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i} className="border-t border-slate-200">
              <td className="px-3 py-2">{fmtDate(recordSessionDate(r))}</td>
              <td className="px-3 py-2 text-slate-600">{recordTopic(r) || "—"}</td>
              <td className="px-3 py-2">
                <StatusPill status={recordStatus(r)} />
              </td>
              <td className="px-3 py-2 text-slate-500">{recordRemarks(r) || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <RawDebug data={detail} label="Show raw course detail JSON" />
    </div>
  );
}
