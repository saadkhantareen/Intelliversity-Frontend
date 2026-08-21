// src/services/attendance.service.js
import api from "./api";
import { toList } from "../utils/attendanceMappers";

const BASE = "/api/v1/attendance";

/* ==================================================================== */
/* CLASS SESSIONS                                                       */
/* ==================================================================== */

/** GET /sessions/ — filters: { course_offering, session_date, status, ... } */
export async function listSessions(params = {}) {
  const res = await api.get(`${BASE}/sessions/`, { params });
  return toList(res.data);
}

/** GET /sessions/today/ — sessions the logged-in teacher must mark today. */
export async function listTodaySessions(params = {}) {
  const res = await api.get(`${BASE}/sessions/today/`, { params });
  return toList(res.data);
}

/** GET /sessions/{id}/ */
export async function getSession(id) {
  const res = await api.get(`${BASE}/sessions/${id}/`);
  return res.data;
}

/** POST /sessions/ { course_offering, session_date, start_time, end_time, topic } */
export async function createSession(payload) {
  const res = await api.post(`${BASE}/sessions/`, payload);
  return res.data;
}

/** PATCH /sessions/{id}/ */
export async function updateSession(id, payload) {
  const res = await api.patch(`${BASE}/sessions/${id}/`, payload);
  return res.data;
}

/** DELETE /sessions/{id}/ */
export async function deleteSession(id) {
  await api.delete(`${BASE}/sessions/${id}/`);
}

/** POST /sessions/{id}/cancel/ { reason? } */
export async function cancelSession(id, reason = "") {
  const res = await api.post(`${BASE}/sessions/${id}/cancel/`, reason ? { reason } : {});
  return res.data;
}

/** POST /sessions/{id}/lock/ — freezes attendance edits. */
export async function lockSession(id) {
  const res = await api.post(`${BASE}/sessions/${id}/lock/`, {});
  return res.data;
}

/** POST /sessions/{id}/unlock/ — admin only. */
export async function unlockSession(id) {
  const res = await api.post(`${BASE}/sessions/${id}/unlock/`, {});
  return res.data;
}

/** POST /sessions/generate/ — admin only, bulk-creates sessions from a timetable. */
export async function generateSessions(payload) {
  const res = await api.post(`${BASE}/sessions/generate/`, payload);
  return res.data;
}

/* ==================================================================== */
/* ROSTER + MARKING                                                     */
/* ==================================================================== */

/** GET /sessions/{id}/roster/ */
export async function getSessionRoster(sessionId) {
  const res = await api.get(`${BASE}/sessions/${sessionId}/roster/`);
  return res.data;
}

/** POST /sessions/{id}/mark/ */
export async function markSessionAttendance(
  sessionId,
  { records = [], topic = "", fillMissingAsAbsent = true } = {}
) {
  const payload = {
    records: records.map((r) => ({
      enrollment: r.enrollment,
      status: r.status,
      remarks: r.remarks || "",
    })),
    fill_missing_as_absent: Boolean(fillMissingAsAbsent),
  };
  if (topic) payload.topic = topic;

  const res = await api.post(`${BASE}/sessions/${sessionId}/mark/`, payload);
  return res.data;
}

/* ==================================================================== */
/* ATTENDANCE RECORDS                                                   */
/* ==================================================================== */

/** GET /records/ */
export async function listRecords(params = {}) {
  const res = await api.get(`${BASE}/records/`, { params });
  return toList(res.data);
}

/** GET /records/{id}/ */
export async function getRecord(id) {
  const res = await api.get(`${BASE}/records/${id}/`);
  return res.data;
}

/** PATCH /records/{id}/ */
export async function updateRecord(id, payload) {
  const res = await api.patch(`${BASE}/records/${id}/`, payload);
  return res.data;
}

/* ==================================================================== */
/* POLICIES                                                             */
/* ==================================================================== */

export async function listPolicies(params = {}) {
  const res = await api.get(`${BASE}/policies/`, { params });
  return toList(res.data);
}
export async function createPolicy(payload) {
  const res = await api.post(`${BASE}/policies/`, payload);
  return res.data;
}
export async function updatePolicy(id, payload) {
  const res = await api.patch(`${BASE}/policies/${id}/`, payload);
  return res.data;
}
export async function deletePolicy(id) {
  await api.delete(`${BASE}/policies/${id}/`);
}

/* ==================================================================== */
/* SUMMARIES                                                            */
/* ==================================================================== */

/** GET /summary/me/ — logged-in student, all courses. */
export async function getMySummary(params = {}) {
  const res = await api.get(`${BASE}/summary/me/`, { params });
  return res.data;
}

/** GET /summary/me/{courseOfferingId}/ — one course, session by session. */
export async function getMyCourseSummary(courseOfferingId) {
  const res = await api.get(`${BASE}/summary/me/${courseOfferingId}/`);
  return res.data;
}

/** GET /summary/course-offering/{id}/ — faculty/admin, every student. */
export async function getCourseOfferingSummary(courseOfferingId) {
  const res = await api.get(`${BASE}/summary/course-offering/${courseOfferingId}/`);
  return res.data;
}

/* ==================================================================== */
/* REPORTS                                                              */
/* ==================================================================== */

/** GET /reports/defaulters/ */
export async function getDefaulters(params = {}) {
  const res = await api.get(`${BASE}/reports/defaulters/`, { params });
  return res.data;
}

/** GET /reports/compliance/?term=REQUIRED */
export async function getComplianceReport(params = {}) {
  if (!params.term) {
    const err = new Error("A term must be selected for the compliance report.");
    err.response = { data: { term: ["This query parameter is required."] } };
    throw err;
  }
  const res = await api.get(`${BASE}/reports/compliance/`, { params });
  return res.data;
}

/** GET /reports/defaulters/export/ -> triggers a file download. */
export async function exportDefaulters(params = {}) {
  const res = await api.get(`${BASE}/reports/defaulters/export/`, {
    params,
    responseType: "blob",
  });

  const type = res.headers?.["content-type"] || "";
  if (type.includes("application/json")) {
    const text = await res.data.text();
    const err = new Error("Export failed.");
    try {
      err.response = { data: JSON.parse(text) };
    } catch {
      err.response = { data: text };
    }
    throw err;
  }

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `defaulters-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

const attendanceService = {
  listSessions,
  listTodaySessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  cancelSession,
  lockSession,
  unlockSession,
  generateSessions,
  getSessionRoster,
  markSessionAttendance,
  listRecords,
  getRecord,
  updateRecord,
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getMySummary,
  getMyCourseSummary,
  getCourseOfferingSummary,
  getDefaulters,
  getComplianceReport,
  exportDefaulters,
};

export default attendanceService;
