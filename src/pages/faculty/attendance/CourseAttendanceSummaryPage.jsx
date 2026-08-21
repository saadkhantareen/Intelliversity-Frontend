// src/pages/faculty/attendance/CourseAttendanceSummaryPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import attendanceService from "../../../services/attendance.service";
import lookupsService from "../../../services/lookups.service";
import usePortalRole from "../../../hooks/usePortalRole";
import { getErrorMessage } from "../../../utils/errors";
import {
  fmtPercent,
  offeringId,
  offeringLabel,
  rowName,
  rowRollNo,
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
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  ProgressBar,
  RawDebug,
  SimpleSelect,
  StatCard,
} from "../../../components/attendance/ui";

export default function CourseAttendanceSummaryPage() {
  const navigate = useNavigate();
  const role = usePortalRole();

  const [offerings, setOfferings] = useState([]);
  const [selected, setSelected] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data =
          role === "admin"
            ? await lookupsService.listAllCourseOfferings()
            : await lookupsService.listMyCourseOfferings();
        setOfferings(data);
        if (data.length === 1) setSelected(String(offeringId(data[0])));
      } catch (err) {
        setError(getErrorMessage(err, "Could not load course offerings."));
      }
    })();
  }, [role]);

  const load = useCallback(async (pk) => {
    if (!pk) {
      setSummary(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setSummary(await attendanceService.getCourseOfferingSummary(pk));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the summary."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selected);
  }, [selected, load]);

  const offeringOptions = useMemo(
    () => offerings.map((o) => ({ value: String(offeringId(o)), label: offeringLabel(o) })),
    [offerings]
  );

  /** Endpoint may return a list, or { course_offering, held_sessions, students: [...] } */
  const students = useMemo(() => {
    if (!summary) return [];
    if (Array.isArray(summary)) return summary;
    return toList(summary.students || summary.results || summary.rows || []);
  }, [summary]);

  const heldSessions = summary && !Array.isArray(summary) ? summaryTotal(summary) : 0;
  const required =
    (summary && !Array.isArray(summary) ? summaryRequiredPercent(summary) : null) ?? 75;

  const defaulters = students.filter(
    (s) => summaryIsDefaulter(s) || (summaryPercent(s) ?? 100) < Number(required)
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader
        title="Course Attendance Summary"
        subtitle="Attendance of every student in one course offering."
        actions={
          <Button variant="secondary" onClick={() => navigate("/attendance")}>
            ← Back
          </Button>
        }
      />

      <div className="mb-6 max-w-xl">
        <SimpleSelect
          label="Course offering"
          options={offeringOptions}
          value={selected}
          onChange={setSelected}
          placeholder="— Select a course —"
        />
      </div>

      {error && <ErrorState message={error} onRetry={() => load(selected)} />}
      {!error && loading && <Loading label="Building summary…" />}

      {!error && !loading && summary && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Students" value={students.length} />
            <StatCard label="Sessions held" value={heldSessions || "—"} />
            <StatCard label="Required" value={fmtPercent(required)} />
            <StatCard label="Defaulters" tone="rose" value={defaulters} />
          </div>

          {students.length === 0 ? (
            <EmptyState
              title="No student data"
              message="Nobody is enrolled yet, or no attendance has been marked."
            />
          ) : (
            <Card title="Students">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Roll no</th>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2 text-center">Present</th>
                      <th className="px-3 py-2 text-center">Absent</th>
                      <th className="px-3 py-2 text-center">Leave</th>
                      <th className="px-3 py-2 text-center">Held</th>
                      <th className="px-3 py-2 w-48">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const pct = summaryPercent(s);
                      const low = summaryIsDefaulter(s) || (pct ?? 100) < Number(required);
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3 font-mono text-xs">{rowRollNo(s)}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-800">{rowName(s)}</span>
                              {low && <Badge tone="rose">Defaulter</Badge>}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">{summaryPresent(s)}</td>
                          <td className="px-3 py-3 text-center">{summaryAbsent(s)}</td>
                          <td className="px-3 py-3 text-center">{summaryLeave(s)}</td>
                          <td className="px-3 py-3 text-center text-slate-500">
                            {summaryTotal(s) || heldSessions || "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <ProgressBar percent={pct} threshold={Number(required)} />
                              <span
                                className={`w-16 text-right text-xs font-semibold ${
                                  low ? "text-rose-600" : "text-slate-700"
                                }`}
                              >
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
              <RawDebug data={summary} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
