import api from "@/shared/api/client";
import { toList } from "../utils/attendanceMappers";

const BASE = "/api/v1/attendance";

export const attendanceService = {
  /* ------------------------------ SESSIONS ------------------------------ */

  listSessions: async (params = {}) => {
    const res = await api.get(`${BASE}/sessions/`, { params });
    return toList(res.data);
  },

  listTodaySessions: async () => {
    const res = await api.get(`${BASE}/sessions/today/`);
    return toList(res.data);
  },

  getSession: async (id) => {
    const res = await api.get(`${BASE}/sessions/${id}/`);
    return res.data;
  },

  createSession: async (payload) => {
    const res = await api.post(`${BASE}/sessions/`, payload);
    return res.data;
  },

  updateSession: async (id, payload) => {
    const res = await api.put(`${BASE}/sessions/${id}/`, payload);
    return res.data;
  },

  patchSession: async (id, payload) => {
    const res = await api.patch(`${BASE}/sessions/${id}/`, payload);
    return res.data;
  },

  deleteSession: async (id) => {
    const res = await api.delete(`${BASE}/sessions/${id}/`);
    return res.data;
  },

  generateSessions: async (payload) => {
    const res = await api.post(`${BASE}/sessions/generate/`, payload);
    return res.data;
  },

  getSessionRoster: async (sessionId) => {
    const res = await api.get(`${BASE}/sessions/${sessionId}/roster/`);
    return res.data;
  },

  markSessionAttendance: async (sessionId, payload) => {
    const res = await api.post(`${BASE}/sessions/${sessionId}/mark/`, payload);
    return res.data;
  },

  lockSession: async (sessionId) => {
    const res = await api.post(`${BASE}/sessions/${sessionId}/lock/`);
    return res.data;
  },

  cancelSession: async (sessionId, reason = "") => {
    const res = await api.post(`${BASE}/sessions/${sessionId}/cancel/`, {
      reason,
    });
    return res.data;
  },

  /* ------------------------------ POLICIES ------------------------------ */

  listPolicies: async (params = {}) => {
    const res = await api.get(`${BASE}/policies/`, { params });
    return toList(res.data);
  },

  getPolicy: async (id) => {
    const res = await api.get(`${BASE}/policies/${id}/`);
    return res.data;
  },

  createPolicy: async (payload) => {
    const res = await api.post(`${BASE}/policies/`, payload);
    return res.data;
  },

  updatePolicy: async (id, payload) => {
    const res = await api.put(`${BASE}/policies/${id}/`, payload);
    return res.data;
  },

  patchPolicy: async (id, payload) => {
    const res = await api.patch(`${BASE}/policies/${id}/`, payload);
    return res.data;
  },

  deletePolicy: async (id) => {
    const res = await api.delete(`${BASE}/policies/${id}/`);
    return res.data;
  },

  /* ----------------         REPORTS & SUMMARIES         ---------------- */

  getDefaulters: async (params = {}) => {
    const res = await api.get(`${BASE}/reports/defaulters/`, { params });
    return res.data;
  },

  exportDefaulters: async (params = {}) => {
    const res = await api.get(`${BASE}/reports/defaulters/export/`, {
      params,
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `defaulters_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getComplianceReport: async (params = {}) => {
    const res = await api.get(`${BASE}/reports/compliance/`, { params });
    return res.data;
  },

  getMySummary: async () => {
    const res = await api.get(`${BASE}/summary/me/`);
    return res.data;
  },

  getMyCourseSummary: async (courseOfferingId) => {
    const res = await api.get(`${BASE}/summary/me/${courseOfferingId}/`);
    return res.data;
  },

  getCourseOfferingSummary: async (courseOfferingId) => {
    const res = await api.get(`${BASE}/summary/course-offering/${courseOfferingId}/`);
    return res.data;
  },
};

export default attendanceService;
