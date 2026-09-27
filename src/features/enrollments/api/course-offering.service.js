import { api } from '@/shared/api/client';

const BASE = '/api/v1/enrollments/course-offerings';

const CourseOfferingService = {
  getCourseOfferings: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  getCourseOfferingById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  createCourseOffering: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  updateCourseOffering: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteCourseOffering: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },

  autoGenerateOfferings: async (data = {}) => {
    const response = await api.post(`${BASE}/generate-offerings/`, data);
    return response.data;
  },

  getFacultyAvailableCourseOfferings: async () => {
    const response = await api.get(`${BASE}/me/faculty/`);
    return response.data;
  },

  getStudentAvailableCourseOfferings: async () => {
    const response = await api.get(`${BASE}/me/student/`);
    return response.data;
  },
};

export default CourseOfferingService;
