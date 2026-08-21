// src/utils/attendanceMappers.js

/** First key that actually has a usable value. */
export function pick(obj, keys, fallback = undefined) {
  if (!obj) return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}

/** DRF returns either a plain array or { count, results: [...] }. */
export function toList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/** A FK can arrive as an id or as a nested object. Always get the id. */
export function idOf(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object") return pick(value, ["id", "pk", "uuid"]);
  return value;
}

/* ===================== STATUS (matches AttendanceStatus) ============== */
export const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present", short: "P", color: "emerald" },
  { value: "absent", label: "Absent", short: "A", color: "rose" },
  { value: "leave", label: "Leave", short: "L", color: "sky" },
];

export const STATUS_VALUES = ATTENDANCE_STATUSES.map((s) => s.value);

export function statusMeta(status) {
  const s = String(status || "").toLowerCase();
  return (
    ATTENDANCE_STATUSES.find((x) => x.value === s) || {
      value: s,
      label: status ? String(status) : "Not marked",
      short: "–",
      color: "slate",
    }
  );
}

/* ===================== SESSION STATE (ClassSession) ================== */
export function sessionStatus(s) {
  return String(pick(s, ["status", "session_status", "state"], "")).toLowerCase();
}
export function sessionIsCancelled(s) {
  if (pick(s, ["is_cancelled"]) === true) return true;
  return sessionStatus(s) === "cancelled" || sessionStatus(s) === "canceled";
}
export function sessionIsLocked(s) {
  return Boolean(pick(s, ["is_locked", "locked", "attendance_locked"], false));
}
export function sessionIsMarked(s) {
  const flag = pick(s, ["is_attendance_marked", "is_marked", "attendance_marked", "marked"]);
  if (flag !== undefined) return Boolean(flag);
  return Boolean(pick(s, ["marked_at", "attendance_marked_at"]));
}

/* ===================== SESSION FIELDS =============================== */
export function sessionId(s) {
  return pick(s, ["id", "session_id", "class_session_id"]);
}
export function sessionDate(s) {
  return pick(s, ["session_date", "date", "scheduled_date"], "");
}
export function sessionStart(s) {
  return pick(s, ["start_time", "starts_at", "from_time"], "");
}
export function sessionEnd(s) {
  return pick(s, ["end_time", "ends_at", "to_time"], "");
}
export function sessionTopic(s) {
  return pick(s, ["topic", "title"], "");
}
export function sessionOfferingId(s) {
  return idOf(pick(s, ["course_offering", "course_offering_id", "offering"]));
}
export function sessionOfferingLabel(s) {
  const nested = pick(s, ["course_offering"]);
  if (nested && typeof nested === "object") return offeringLabel(nested);
  return pick(
    s,
    ["course_offering_label", "course_offering_display", "course_offering_name", "course_name", "course_code"],
    ""
  );
}

/* ===================== COURSE OFFERING ============================== */
export function offeringId(o) {
  return pick(o, ["id", "course_offering_id", "offering_id"]);
}
export function offeringLabel(o) {
  if (!o) return "—";
  const direct = pick(o, ["display_name", "label", "course_offering_display"]);
  if (direct) return direct;

  const code = pick(o, ["course_code", "code"], "");
  const name = pick(o, ["course_name", "course_title", "name", "title"], "");
  const section = pick(o, ["section", "section_name", "section_code"], "");
  const term = pick(o, ["term_name", "term_display", "term", "semester_name"], "");

  const main = [code, name].filter(Boolean).join(" - ") || `Offering ${offeringId(o)}`;
  const extra = [
    section && `Sec ${typeof section === "object" ? pick(section, ["name", "code"], "") : section}`,
    typeof term === "object" ? pick(term, ["name", "code"], "") : term,
  ]
    .filter(Boolean)
    .join(" • ");
  return extra ? `${main} (${extra})` : main;
}

/* ===================== TERM ========================================= */
export function termId(t) {
  return pick(t, ["id", "term_id"]);
}
export function termLabel(t) {
  const name = pick(t, ["name", "title", "term_name", "code"], `Term ${termId(t)}`);
  const year = pick(t, ["academic_year", "year", "session"], "");
  const yearText = typeof year === "object" ? pick(year, ["name", "year"], "") : year;
  return yearText ? `${name} — ${yearText}` : String(name);
}

/* ===================== ROSTER ROW =================================== */
export function rosterStudents(roster) {
  if (Array.isArray(roster)) return roster;
  return toList(roster?.students || roster?.roster || roster?.results || []);
}
export function rosterSession(roster) {
  if (Array.isArray(roster)) return null;
  return pick(roster, ["session", "class_session"], null);
}
export function rosterPolicy(roster) {
  if (Array.isArray(roster)) return null;
  return pick(roster, ["policy", "attendance_policy"], null);
}
export function rosterHeldSessions(roster) {
  const v = pick(roster, ["held_sessions_so_far", "held_sessions", "total_sessions"], 0);
  return Number(v) || 0;
}

export function rowEnrollmentId(row) {
  return pick(row, ["enrollment_id", "enrollment", "id"]);
}
export function rowName(row) {
  const direct = pick(row, ["name", "student_name", "full_name"]);
  if (direct) return direct;
  const first = pick(row, ["first_name"], "");
  const last = pick(row, ["last_name"], "");
  return [first, last].filter(Boolean).join(" ") || "Unnamed student";
}
export function rowRollNo(row) {
  return pick(row, ["roll_no", "registration_id", "reg_no", "roll_number"], "—");
}
export function rowCurrentStatus(row) {
  const v = pick(row, ["current_status", "status", "attendance_status"], "");
  return v ? String(v).toLowerCase() : "";
}
export function rowRemarks(row) {
  return pick(row, ["remarks", "remark", "note", "comment"], "");
}
export function rowPercent(row) {
  const v = pick(row, [
    "cumulative_percentage",
    "attendance_percentage",
    "percentage",
    "percent",
  ]);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
export function rowIsDefaulter(row) {
  return Boolean(pick(row, ["is_defaulter", "defaulter"], false));
}

/* ===================== ATTENDANCE RECORD ============================ */
export function recordStatus(r) {
  return String(pick(r, ["status", "attendance_status"], "")).toLowerCase();
}
export function recordRemarks(r) {
  return pick(r, ["remarks", "remark", "note"], "");
}
export function recordSessionDate(r) {
  return pick(r, ["session_date", "date", "class_session_date", "session__session_date"], "");
}
export function recordTopic(r) {
  return pick(r, ["topic", "session_topic", "class_session_topic"], "");
}

/* ===================== SUMMARIES =================================== */
export function summaryPercent(s) {
  const v = pick(s, [
    "attendance_percentage",
    "percentage",
    "cumulative_percentage",
    "percent",
  ]);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
export function summaryPresent(s) {
  return Number(pick(s, ["present_count", "present", "total_present"], 0)) || 0;
}
export function summaryAbsent(s) {
  return Number(pick(s, ["absent_count", "absent", "total_absent"], 0)) || 0;
}
export function summaryLeave(s) {
  return Number(pick(s, ["leave_count", "leave", "total_leave"], 0)) || 0;
}
export function summaryTotal(s) {
  return (
    Number(
      pick(s, ["held_sessions", "total_sessions", "sessions_held", "total_classes", "total"], 0)
    ) || 0
  );
}
export function summaryIsDefaulter(s) {
  return Boolean(pick(s, ["is_defaulter", "defaulter"], false));
}
export function summaryRequiredPercent(s) {
  const v = pick(s, [
    "min_percentage",
    "minimum_percentage",
    "required_percentage",
    "min_attendance_percentage",
  ]);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ===================== POLICY ====================================== */
export function policyMinPercent(p) {
  return pick(p, ["min_percentage", "minimum_percentage", "min_attendance_percentage"], null);
}
export function policyWarnPercent(p) {
  return pick(p, ["warning_percentage", "warn_percentage", "warning_threshold"], null);
}

/* ===================== FORMATTERS ================================== */
export function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function fmtTime(value) {
  if (!value) return "";
  const parts = String(value).split(":");
  if (parts.length >= 2 && parts[0].length <= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1]}`;
  }
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return String(value);
}

export function fmtPercent(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
