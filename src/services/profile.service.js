import api from './api'

export const profileService = {
  // ── Own profile ────────────────────────────────────────────────
  getMyProfile:    ()               => api.get('/api/v1/profiles/me/'),

  // Sends JSON — works for both regular fields and profile_picture_public_id
  updateMyProfile: (data)           => api.put('/api/v1/profiles/me/', data),

  // ── Own documents ──────────────────────────────────────────────
  getMyDocuments:  ()               => api.get('/api/v1/profiles/documents/'),

  // Sends JSON: { public_id, resource_type, document_type, title, description }
  // Do NOT send multipart/form-data — backend expects plain JSON fields, not a file
  uploadDocument:  (data)           => api.post('/api/v1/profiles/documents/', data),

  deleteDocument:  (docId)          => api.delete(`/api/v1/profiles/documents/${docId}/`),

  // ── Admin — manage any user ────────────────────────────────────
  getAllUsers:        ()             => api.get('/api/v1/profiles/users/'),
  getUserProfile:    (userId)       => api.get(`/api/v1/profiles/users/${userId}/`),
  updateUserProfile: (userId, data) => api.put(`/api/v1/profiles/users/${userId}/`, data),

  // ── Admin — manage any user's documents ───────────────────────
  getUserDocuments:   (userId)       => api.get(`/api/v1/profiles/documents/admin/${userId}/`),

  // Also JSON — same pattern as uploadDocument
  uploadUserDocument: (userId, data) => api.post(`/api/v1/profiles/documents/admin/${userId}/`, data),
}