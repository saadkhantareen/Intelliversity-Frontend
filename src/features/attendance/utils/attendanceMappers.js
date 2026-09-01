export const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present", short: "P" },
  { value: "absent", label: "Absent", short: "A" },
  { value: "leave", label: "Leave", short: "L" },
];

export function pick(obj, keys, fallback = undefined) {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
}

export function idOf(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return pick(val, ["id", "pk", "uuid"]) ?? null;
  return val;
}

export function toList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const [y, m, d] = String(iso).split("T")[0].split("-");
    if (!y || !m || !d) return String(iso);
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(iso);
  }
}

export function fmtTime(timeStr) {
  if (!timeStr) return "";
  try {
    const [h, m] = String(timeStr).split(":");
    if (h === undefined || m === undefined) return String(timeStr);
    const date = new Date();
    date.setHours(Number(h), Number(m), 0, 0);
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return String(timeStr);
  }
}

export function fmtPercent(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return `${Number(val).toFixed(1)}%`;
}

export function sessionId(s) {
  return pick(s, ["id", "session_id", "pk"]);
}

export function sessionDate(s) {
  return pick(s, ["session_date", "date"]);
}

export function sessionStart(s) {
  return pick(s, ["start_time", "time_start", "start"]);
}

export function sessionEnd(s) {
  return pick(s, ["end_time", "time_end", "end"]);
}

export function sessionTopic(s) {
  return pick(s, ["topic", "title", "subject"], "");
}

export function sessionIsCancelled(s) {
  const status = String(pick(s, ["status", "session_status"], "")).toLowerCase();
  return status === "cancelled" || status === "canceled" || Boolean(pick(s, ["is_cancelled"], false));
}

export function sessionIsLocked(s) {
  return Boolean(pick(s, ["is_locked", "locked"], false));
}

export function sessionIsMarked(s) {
  return Boolean(
    pick(s, ["is_attendance_marked", "is_marked", "marked", "attendance_marked"], false)
  );
}

export function sessionOfferingLabel(s) {
  const explicit = pick(s, [
    "course_offering_display",
    "course_offering_name",
    "offering_title",
    "course_name",
    "course_code",
  ]);
  if (explicit) return explicit;
  const o = pick(s, ["course_offering", "offering"]);
  return offeringLabel(o);
}

export function offeringId(o) {
  return idOf(pick(o, ["id", "course_offering", "course_offering_id", "offering_id"], o));
}

export function offeringLabel(o) {
  if (!o) return "—";
  if (typeof o === "string") return o;
  const explicit = pick(o, [
    "display_name",
    "title",
    "course_offering_display",
    "course_offering_name",
    "name",
  ]);
  if (explicit) return explicit;
  const code = pick(o, ["course_code", "code"]) || (typeof o.course === "object" ? o.course?.code : undefined);
  const cName = pick(o, ["course_name", "name"]) || (typeof o.course === "object" ? o.course?.name : undefined);
  const sec = pick(o, ["section_name", "section_code"]) || (typeof o.section === "object" ? o.section?.name : (typeof o.section === "string" ? o.section : undefined));
  const termName = pick(o, ["term_name"]) || (typeof o.term === "object" ? o.term?.name : (typeof o.term === "string" ? o.term : undefined));

  if (code || cName) {
    const base = [code, cName].filter(Boolean).join(" — ");
    const meta = [termName, sec ? `Sec ${sec}` : null].filter(Boolean).join(" · ");
    return meta ? `${base} (${meta})` : base;
  }
  if (typeof o.course === "string" && o.course) return o.course;
  return `Offering #${offeringId(o) ?? "?"}`;
}

export function termId(t) {
  return idOf(t);
}

export function termLabel(t) {
  if (!t) return "—";
  if (typeof t === "string") return t;
  return pick(t, ["name", "title", "term_name", "display_name"], `Term #${termId(t)}`);
}

export function rosterSession(r) {
  return pick(r, ["session", "class_session", "session_details"]);
}

export function rosterPolicy(r) {
  return pick(r, ["policy", "effective_policy", "attendance_policy"]);
}

export function rosterHeldSessions(r) {
  return Number(pick(r, ["sessions_held", "held_sessions", "total_sessions"], 0)) || 0;
}

export function rosterStudents(r) {
  return toList(
    pick(r, ["students", "roster", "records", "enrollments", "items", "results"], r)
  );
}

export function rowEnrollmentId(row) {
  return (
    idOf(pick(row, ["enrollment_id", "enrollment", "student_enrollment_id"])) ??
    idOf(pick(row, ["student_id", "student"]))
  );
}

export function rowName(row) {
  const explicit = pick(row, [
    "student_name",
    "full_name",
    "name",
    "user_full_name",
    "student_full_name",
  ]);
  if (explicit) return explicit;
  const st = pick(row, ["student", "user"]);
  if (st && typeof st === "object") {
    return pick(st, ["full_name", "name", "username"], "—");
  }
  return "—";
}

export function rowRollNo(row) {
  const explicit = pick(row, [
    "roll_number",
    "roll_no",
    "registration_number",
    "reg_no",
    "student_id_number",
  ]);
  if (explicit) return explicit;
  const st = pick(row, ["student", "user"]);
  if (st && typeof st === "object") {
    return pick(st, ["roll_number", "roll_no", "registration_number"], "—");
  }
  return "—";
}

export function rowCurrentStatus(row) {
  const val = pick(row, ["status", "current_status", "attendance_status"], "");
  return String(val).toLowerCase();
}

export function rowRemarks(row) {
  return pick(row, ["remarks", "notes", "comment"], "");
}

export function rowPercent(row) {
  const val = pick(row, [
    "percentage",
    "attendance_percentage",
    "attendance_percent",
    "percent",
    "cumulative_percentage",
  ]);
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function rowIsDefaulter(row) {
  return Boolean(pick(row, ["is_defaulter", "defaulter", "below_threshold"], false));
}

export function summaryTotal(s) {
  return Number(pick(s, ["total_sessions", "sessions_held", "held_sessions", "total"], 0)) || 0;
}

export function summaryPresent(s) {
  return Number(pick(s, ["present_count", "presents", "present"], 0)) || 0;
}

export function summaryAbsent(s) {
  return Number(pick(s, ["absent_count", "absents", "absent"], 0)) || 0;
}

export function summaryLeave(s) {
  return Number(pick(s, ["leave_count", "leaves", "leave"], 0)) || 0;
}

export function summaryPercent(s) {
  const val = pick(s, [
    "percentage",
    "attendance_percentage",
    "attendance_percent",
    "percent",
    "overall_percentage",
  ]);
  if (val !== null && val !== undefined) {
    const n = Number(val);
    if (Number.isFinite(n)) return n;
  }
  const total = summaryTotal(s);
  if (!total) return null;
  const presentEquivalent = summaryPresent(s) + summaryLeave(s);
  return (presentEquivalent / total) * 100;
}

export function summaryRequiredPercent(s) {
  const val = pick(s, ["min_percentage", "required_percentage", "threshold_percentage"]);
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function summaryIsDefaulter(s) {
  return Boolean(pick(s, ["is_defaulter", "defaulter"], false));
}

export function policyMinPercent(p) {
  const val = pick(p, ["min_percentage", "minimum_percentage", "min_percent"]);
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function policyWarnPercent(p) {
  const val = pick(p, ["warning_percentage", "warn_percentage", "warning_percent"]);
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function recordSessionDate(r) {
  const explicit = pick(r, ["session_date", "date"]);
  if (explicit) return explicit;
  const sess = pick(r, ["session", "class_session"]);
  return sessionDate(sess);
}

export function recordTopic(r) {
  const explicit = pick(r, ["topic", "session_topic"]);
  if (explicit) return explicit;
  const sess = pick(r, ["session", "class_session"]);
  return sessionTopic(sess);
}

export function recordStatus(r) {
  return pick(r, ["status", "attendance_status"], "");
}

export function recordRemarks(r) {
  return pick(r, ["remarks", "notes"], "");
}
