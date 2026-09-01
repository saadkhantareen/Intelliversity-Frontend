import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import attendanceService from "../../api/attendance.service";
import lookupsService from "@/shared/api/lookups.service";
import { getErrorMessage } from "@/shared/utils/errors";
import { offeringId, offeringLabel, todayISO } from "../../utils/attendanceMappers";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Notice,
  PageHeader,
  RawDebug,
  SimpleSelect,
  inputClass,
} from "../../components/ui";

const GEN_FIELDS = {
  courseOffering: "course_offering",
  startDate: "date_from",
  endDate: "date_to",
  weekdays: "weekdays",
  startTime: "start_time",
  endTime: "end_time",
  skipExisting: "skip_existing",
};

const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

export default function GenerateSessionsPage() {
  const navigate = useNavigate();

  const [offerings, setOfferings] = useState([]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    courseOffering: "",
    startDate: todayISO(),
    endDate: todayISO(),
    weekdays: [0, 2, 4],
    startTime: "09:00",
    endTime: "10:00",
    skipExisting: true,
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    (async () => {
      try {
        setOfferings(await lookupsService.listAllCourseOfferings());
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not load course offerings."));
      }
    })();
  }, []);

  const offeringOptions = useMemo(
    () => offerings.map((o) => ({ value: String(offeringId(o)), label: offeringLabel(o) })),
    [offerings]
  );

  function toggleWeekday(day) {
    set({
      weekdays: form.weekdays.includes(day)
        ? form.weekdays.filter((d) => d !== day)
        : [...form.weekdays, day].sort((a, b) => a - b),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.courseOffering) return toast.error("Select a course offering.");
    if (!form.weekdays.length) return toast.error("Select at least one weekday.");
    if (form.endDate < form.startDate) return toast.error("End date is before the start date.");

    setSaving(true);
    setResult(null);
    try {
      const payload = {
        [GEN_FIELDS.courseOffering]: form.courseOffering,
        [GEN_FIELDS.startDate]: form.startDate,
        [GEN_FIELDS.endDate]: form.endDate,
        [GEN_FIELDS.weekdays]: form.weekdays,
        [GEN_FIELDS.startTime]: form.startTime,
        [GEN_FIELDS.endTime]: form.endTime,
        [GEN_FIELDS.skipExisting]: form.skipExisting,
      };
      const data = await attendanceService.generateSessions(payload);
      setResult(data);
      const created = data?.created ?? data?.created_count ?? data?.count;
      toast.success(
        created !== undefined ? `${created} session(s) generated.` : "Sessions generated."
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not generate sessions."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <PageHeader
        title="Generate Class Sessions"
        subtitle="Bulk-create sessions for a date range instead of one by one."
        actions={
          <Button variant="secondary" onClick={() => navigate("/attendance")}>
            ← Back
          </Button>
        }
      />

      <Notice tone="amber">
        This creates <strong>one session per selected weekday</strong> between the two dates. Keep
        “skip existing” on so re-running never creates duplicates.
      </Notice>

      <Card title="Parameters">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SimpleSelect
              label="Course offering"
              options={offeringOptions}
              value={form.courseOffering}
              onChange={(v) => set({ courseOffering: v })}
              placeholder="— Select a course —"
              required
            />
          </div>

          <Field label="Start date" required>
            <input
              type="date"
              required
              className={inputClass}
              value={form.startDate}
              onChange={(e) => set({ startDate: e.target.value })}
            />
          </Field>
          <Field label="End date" required>
            <input
              type="date"
              required
              className={inputClass}
              value={form.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </Field>

          <Field label="Start time" required>
            <input
              type="time"
              required
              className={inputClass}
              value={form.startTime}
              onChange={(e) => set({ startTime: e.target.value })}
            />
          </Field>
          <Field label="End time" required>
            <input
              type="time"
              required
              className={inputClass}
              value={form.endTime}
              onChange={(e) => set({ endTime: e.target.value })}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Weekdays" required hint="Monday = 0 … Sunday = 6">
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => {
                  const active = form.weekdays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleWeekday(d.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "border-transparent bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Checkbox
              label="Skip dates that already have a session"
              checked={form.skipExisting}
              onChange={(v) => set({ skipExisting: v })}
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Generating…" : "Generate sessions"}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Done. <RawDebug data={result} label="Show server response" />
          </div>
        )}
      </Card>
    </div>
  );
}
