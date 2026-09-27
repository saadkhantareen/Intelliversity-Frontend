import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import attendanceService from "../../api/attendance.service";
import lookupsService from "@/shared/api/lookups.service";
import { getErrorMessage } from "@/shared/utils/errors";
import {
  fmtPercent,
  offeringId,
  offeringLabel,
  pick,
  rowName,
  rowRollNo,
  summaryAbsent,
  summaryLeave,
  summaryPercent,
  summaryPresent,
  summaryTotal,
  termId,
  termLabel,
  toList,
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
  ProgressBar,
  RawDebug,
  SimpleSelect,
  StatCard,
  inputClass,
} from "../../components/ui";

export default function DefaultersReportPage() {
  const [terms, setTerms] = useState([]);
  const [offerings, setOfferings] = useState([]);

  const [filters, setFilters] = useState({
    term: "",
    course_offering: "",
    threshold: "",
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setTerms(await lookupsService.listTerms());
      } catch {
        /* optional filter */
      }
      try {
        setOfferings(await lookupsService.listAllCourseOfferings());
      } catch {
        /* optional filter */
      }
    })();
  }, []);

  const termOptions = useMemo(
    () => terms.map((t) => ({ value: String(termId(t)), label: termLabel(t) })),
    [terms]
  );
  const offeringOptions = useMemo(
    () => offerings.map((o) => ({ value: String(offeringId(o)), label: offeringLabel(o) })),
    [offerings]
  );

  const buildParams = useCallback(() => {
    const params = {};
    if (filters.term) params.term = filters.term;
    if (filters.course_offering) params.course_offering = filters.course_offering;
    if (filters.threshold !== "" && filters.threshold !== null) {
      params.threshold = filters.threshold;
    }
    return params;
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await attendanceService.getDefaulters(buildParams()));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the defaulters report."));
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return toList(data.defaulters || data.students || data.results || data.rows || []);
  }, [data]);

  const effectiveThreshold = useMemo(() => {
    if (filters.threshold !== "") return Number(filters.threshold);
    const fromApi = pick(data, ["threshold", "min_percentage", "required_percentage"]);
    const n = Number(fromApi);
    return Number.isFinite(n) ? n : 75;
  }, [filters.threshold, data]);

  const lowest = rows.length
    ? Math.min(...rows.map((r) => summaryPercent(r) ?? 100))
    : null;

  async function handleExport() {
    setExporting(true);
    try {
      await attendanceService.exportDefaulters(buildParams());
      toast.success("Download started.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Export failed."));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader
        title="Defaulters Report"
        subtitle="Students whose attendance is below the required percentage."
        actions={
          <Button variant="success" onClick={handleExport} disabled={exporting || loading}>
            {exporting ? "Exporting…" : "⬇ Export CSV"}
          </Button>
        }
      />

      <Card title="Filters" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <SimpleSelect
            label="Term"
            options={termOptions}
            value={filters.term}
            onChange={(v) => setFilters({ ...filters, term: v })}
            placeholder="— All terms —"
          />
          <SimpleSelect
            label="Course offering"
            options={offeringOptions}
            value={filters.course_offering}
            onChange={(v) => setFilters({ ...filters, course_offering: v })}
            placeholder="— All courses —"
          />
          <Field label="Threshold %" hint="Empty = use the policy value.">
            <input
              type="number"
              min="0"
              max="100"
              className={inputClass}
              placeholder="From policy"
              value={filters.threshold}
              onChange={(e) => setFilters({ ...filters, threshold: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2">
            <Button onClick={load} disabled={loading} className="w-full">
              {loading ? "Loading…" : "Apply filters"}
            </Button>
          </div>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && loading && <Loading label="Generating report…" />}

      {!error && !loading && data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Defaulters found" tone="rose" value={rows.length} />
            <StatCard
              label="Threshold used"
              value={fmtPercent(effectiveThreshold)}
              hint="Below this = defaulter"
            />
            <StatCard label="Lowest attendance" tone="rose" value={fmtPercent(lowest)} />
            <StatCard
              label="Total absences"
              value={rows.reduce((a, r) => a + summaryAbsent(r), 0)}
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="🎉 No defaulters"
              message="Every student is above the threshold for the selected filters."
            />
          ) : (
            <Card title={`${rows.length} defaulter(s)`}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Roll no</th>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2 text-center">Held</th>
                      <th className="px-3 py-2 text-center">Present</th>
                      <th className="px-3 py-2 text-center">Absent</th>
                      <th className="px-3 py-2 text-center">Leave</th>
                      <th className="px-3 py-2 w-44">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const pct = summaryPercent(r);
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-3 font-mono text-xs">{rowRollNo(r)}</td>
                          <td className="px-3 py-3 font-medium text-slate-800">{rowName(r)}</td>
                          <td className="px-3 py-3 text-slate-600">
                            {pick(
                              r,
                              [
                                "course_offering_display",
                                "course_offering_name",
                                "course_name",
                                "course_code",
                                "course",
                              ],
                              offeringLabel(r)
                            )}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-500">
                            {summaryTotal(r) || "—"}
                          </td>
                          <td className="px-3 py-3 text-center">{summaryPresent(r)}</td>
                          <td className="px-3 py-3 text-center text-rose-600">
                            {summaryAbsent(r)}
                          </td>
                          <td className="px-3 py-3 text-center">{summaryLeave(r)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <ProgressBar percent={pct} threshold={effectiveThreshold} />
                              <span className="w-16 text-right text-xs font-semibold text-rose-600">
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
              <div className="mt-4">
                <Badge tone="slate">
                  Tip: set threshold to 100 to list every student and confirm the endpoint works.
                </Badge>
              </div>
              <RawDebug data={data} label="Show raw defaulters JSON" />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
