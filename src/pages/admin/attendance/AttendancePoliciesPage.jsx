// src/pages/admin/attendance/AttendancePoliciesPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import attendanceService from "../../../services/attendance.service";
import lookupsService from "../../../services/lookups.service";
import { getErrorMessage } from "../../../utils/errors";
import {
  fmtPercent,
  idOf,
  offeringId,
  offeringLabel,
  pick,
  policyMinPercent,
  policyWarnPercent,
  termId,
  termLabel,
} from "../../../utils/attendanceMappers";
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
  RawDebug,
  SimpleSelect,
  inputClass,
} from "../../../components/attendance/ui";

const FIELDS = {
  name: "name",
  minPercentage: "min_percentage",
  warningPercentage: "warning_percentage",
  countLeaveAsPresent: "count_leave_as_present",
  isActive: "is_active",
  term: "term",
  courseOffering: "course_offering",
  description: "description",
};

const blank = {
  name: "",
  minPercentage: 75,
  warningPercentage: 80,
  countLeaveAsPresent: true,
  isActive: true,
  term: "",
  courseOffering: "",
  description: "",
};

/** Turns our internal form state into the payload the backend wants. */
function toPayload(form) {
  const payload = {
    [FIELDS.name]: form.name,
    [FIELDS.minPercentage]: Number(form.minPercentage),
    [FIELDS.isActive]: Boolean(form.isActive),
  };
  if (form.warningPercentage !== "" && form.warningPercentage !== null) {
    payload[FIELDS.warningPercentage] = Number(form.warningPercentage);
  }
  payload[FIELDS.countLeaveAsPresent] = Boolean(form.countLeaveAsPresent);
  if (form.description) payload[FIELDS.description] = form.description;
  // Scope is optional: empty string must be sent as null, not "".
  payload[FIELDS.term] = form.term || null;
  payload[FIELDS.courseOffering] = form.courseOffering || null;
  return payload;
}

/** Turns a backend policy row back into our form state. */
function toForm(p) {
  return {
    name: pick(p, [FIELDS.name, "name", "title"], ""),
    minPercentage: policyMinPercent(p) ?? 75,
    warningPercentage: policyWarnPercent(p) ?? "",
    countLeaveAsPresent: Boolean(
      pick(p, [FIELDS.countLeaveAsPresent, "count_leave_as_present", "leave_counts_present"], true)
    ),
    isActive: Boolean(pick(p, [FIELDS.isActive, "is_active"], true)),
    term: idOf(pick(p, [FIELDS.term, "term", "term_id"])) ?? "",
    courseOffering:
      idOf(pick(p, [FIELDS.courseOffering, "course_offering", "course_offering_id"])) ?? "",
    description: pick(p, [FIELDS.description, "description"], ""),
  };
}

export default function AttendancePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [terms, setTerms] = useState([]);
  const [offerings, setOfferings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  /* ----------------------------- load list ---------------------------- */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPolicies(await attendanceService.listPolicies());
    } catch (err) {
      setError(getErrorMessage(err, "Could not load attendance policies."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* --------------------------- load dropdowns ------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setTerms(await lookupsService.listTerms());
      } catch {
        /* scope selectors are optional */
      }
      try {
        setOfferings(await lookupsService.listAllCourseOfferings());
      } catch {
        /* optional */
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

  /* ------------------------------ actions ----------------------------- */
  function startEdit(p) {
    setEditingId(pick(p, ["id"]));
    setForm(toForm(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(blank);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const min = Number(form.minPercentage);
    if (!Number.isFinite(min) || min < 0 || min > 100) {
      toast.error("Minimum percentage must be between 0 and 100.");
      return;
    }
    if (form.warningPercentage !== "" && Number(form.warningPercentage) < min) {
      toast.error("The warning threshold should be higher than the minimum percentage.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await attendanceService.updatePolicy(editingId, toPayload(form));
        toast.success("Policy updated.");
      } else {
        await attendanceService.createPolicy(toPayload(form));
        toast.success("Policy created.");
      }
      cancelEdit();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the policy."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this policy? Attendance percentages will be recalculated.")) {
      return;
    }
    try {
      await attendanceService.deletePolicy(id);
      toast.success("Policy deleted.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the policy."));
    }
  }

  /* ------------------------------ render ------------------------------ */
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHeader
        title="Attendance Policies"
        subtitle="These rules decide who is flagged as a defaulter."
      />

      <Notice tone="sky">
        Leave the <strong>Term</strong> and <strong>Course offering</strong> fields empty for a
        university-wide default policy. Fill one of them to override the default for a narrower
        scope.
      </Notice>

      <Card title={editingId ? "Edit policy" : "Create policy"} className="mb-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Policy name" required>
            <input
              required
              className={inputClass}
              value={form.name}
              placeholder="Default University Policy"
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>

          <Field label="Minimum attendance %" required hint="Below this = defaulter.">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              className={inputClass}
              value={form.minPercentage}
              onChange={(e) => set({ minPercentage: e.target.value })}
            />
          </Field>

          <Field label="Warning threshold %" hint="Students get an early warning below this.">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={inputClass}
              value={form.warningPercentage}
              onChange={(e) => set({ warningPercentage: e.target.value })}
            />
          </Field>

          <SimpleSelect
            label="Term (optional scope)"
            options={termOptions}
            value={form.term}
            onChange={(v) => set({ term: v })}
            placeholder="— All terms —"
            hint={termOptions.length === 0 ? "Term list unavailable — leave empty." : undefined}
          />

          <SimpleSelect
            label="Course offering (optional scope)"
            options={offeringOptions}
            value={form.courseOffering}
            onChange={(v) => set({ courseOffering: v })}
            placeholder="— All course offerings —"
          />

          <div className="flex flex-col justify-end gap-3">
            <Checkbox
              label="Count “Leave” as present"
              hint="Approved leave will not reduce the percentage."
              checked={form.countLeaveAsPresent}
              onChange={(v) => set({ countLeaveAsPresent: v })}
            />
            <Checkbox
              label="Active"
              hint="Inactive policies are ignored by all reports."
              checked={form.isActive}
              onChange={(v) => set({ isActive: v })}
            />
          </div>

          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                rows={2}
                className={inputClass}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update policy" : "Create policy"}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {loading && <Loading label="Loading policies…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && policies.length === 0 && (
        <EmptyState
          title="No policies yet"
          message="Create at least one university-wide policy above, otherwise the defaulters report has nothing to compare against."
        />
      )}

      {!loading && !error && policies.length > 0 && (
        <Card title={`${policies.length} policy(ies)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Scope</th>
                  <th className="px-3 py-2 text-center">Minimum</th>
                  <th className="px-3 py-2 text-center">Warning</th>
                  <th className="px-3 py-2 text-center">Leave = present</th>
                  <th className="px-3 py-2 text-center">Active</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => {
                  const id = pick(p, ["id"]);
                  const scopeOffering = pick(p, [
                    "course_offering_display",
                    "course_offering_name",
                  ]);
                  const scopeTerm = pick(p, ["term_display", "term_name"]);
                  const scope =
                    scopeOffering || scopeTerm
                      ? [scopeOffering, scopeTerm].filter(Boolean).join(" • ")
                      : idOf(pick(p, ["course_offering"]))
                      ? "Course offering"
                      : idOf(pick(p, ["term"]))
                      ? "Term"
                      : "University-wide";
                  return (
                    <tr key={id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-800">
                        {pick(p, ["name", "title"], "—")}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{scope}</td>
                      <td className="px-3 py-3 text-center font-semibold">
                        {fmtPercent(policyMinPercent(p))}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-600">
                        {fmtPercent(policyWarnPercent(p))}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {pick(p, ["count_leave_as_present"], false) ? "✅" : "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {pick(p, ["is_active"], false) ? (
                          <Badge tone="emerald">Active</Badge>
                        ) : (
                          <Badge tone="slate">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5"
                            onClick={() => startEdit(p)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            className="px-3 py-1.5"
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
          <RawDebug data={policies} label="Show raw policies JSON" />
        </Card>
      )}
    </div>
  );
}
