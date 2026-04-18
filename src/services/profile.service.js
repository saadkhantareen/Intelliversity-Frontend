import api from './api'
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dlhjyk6qu/image/upload";
const UPLOAD_PRESET = "ym0spaxu"; // From your screenshot

export const profileService = {
  // own profile
  getMyProfile:    ()           => api.get('/api/v1/profiles/me/'),
  updateMyProfile: (data)       => api.put('/api/v1/profiles/me/', data),

  // own documents
  getMyDocuments:    ()         => api.get('/api/v1/profiles/documents/'),
  uploadDocument:    (data)     => api.post('/api/v1/profiles/documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument:    (docId)    => api.delete(`/api/v1/profiles/documents/${docId}/`),

  // admin — manage any user
  getAllUsers:        ()         => api.get('/api/v1/profiles/users/'),
  getUserProfile:    (userId)   => api.get(`/api/v1/profiles/users/${userId}/`),
  updateUserProfile: (userId, data) => api.put(`/api/v1/profiles/users/${userId}/`, data),

  // admin — manage any user documents
  getUserDocuments:  (userId)   => api.get(`/api/v1/profiles/documents/admin/${userId}/`),
  uploadUserDocument: (userId, data) => api.post(`/api/v1/profiles/documents/admin/${userId}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  
}