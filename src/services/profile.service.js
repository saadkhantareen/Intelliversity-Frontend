import api from "./api"; // adjust path to your api.js

export const ProfileService  = {
  // ── Admin: Create profiles ─────────────────────────────────────────────

  createStudent: async (studentData) => {
    const response = await api.post("/api/v1/profiles/students/", studentData);
    return response.data;
  },

  createFaculty: async (facultyData) => {
    const response = await api.post("/api/v1/profiles/faculty/", facultyData);
    return response.data;
  },

  createAdmin: async (adminData) => {
    const response = await api.post("/api/v1/profiles/admin/", adminData);
    return response.data;
  },

  // ── My Profile ─────────────────────────────────────────────────────────

  // Returns { role: "student"|"faculty"|"admin", profile: {...} }
  getMyProfile: async () => {
    const response = await api.get("/api/v1/profiles/me/");
    return response.data;
  },

  // ── Update profiles (PATCH — send only changed fields) ─────────────────

  updateStudent: async (id, data) => {
    const response = await api.patch(`/api/v1/profiles/students/${id}/`, data);
    return response.data;
  },

  updateFaculty: async (id, data) => {
    const response = await api.patch(`/api/v1/profiles/faculty/${id}/`, data);
    return response.data;
  },

  updateAdmin: async (id, data) => {
    const response = await api.patch(`/api/v1/profiles/admin/${id}/`, data);
    return response.data;
  },

  // ── List (Admin Dashboard) ─────────────────────────────────────────────

  getStudents: async (params) => {
    const response = await api.get("/api/v1/profiles/students/", { params });
    return response.data;
  },

  getFaculty: async (params) => {
    const response = await api.get("/api/v1/profiles/faculty/", { params });
    return response.data;
  },

  // ── Documents (own user) ───────────────────────────────────────────────

  getMyDocuments: async () => {
    const response = await api.get("/api/v1/profiles/documents/");
    return response.data;
  },

  saveDocument: async (data) => {
    const response = await api.post("/api/v1/profiles/documents/", data);
    return response.data;
  },

  deleteDocument: async (docId) => {
    const response = await api.delete("/api/v1/profiles/documents/", {
      params: { doc_id: docId },
    });
    return response.data;
  },

  // ── Documents (admin — any user) ───────────────────────────────────────

  getUserDocuments: async (userId) => {
    const response = await api.get(
      `/api/v1/profiles/documents/admin/${userId}/`,
    );
    return response.data;
  },

  saveUserDocument: async (userId, data) => {
    const response = await api.post(
      `/api/v1/profiles/documents/admin/${userId}/`,
      data,
    );
    return response.data;
  },

  verifyDocument: async (userId, documentId, isVerified) => {
    const response = await api.patch(
      `/api/v1/profiles/documents/admin/${userId}/`,
      {
        id: documentId,
        is_verified: isVerified,
      },
    );
    return response.data;
  },
};

// export default ProfileService;
