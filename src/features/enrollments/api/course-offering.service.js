import { api } from '@/shared/api/client';

const BASE = '/api/v1/enrollments/course-offerings';

const CourseOfferingService = {
  getOfferings: async (params = {}) => {
    const response = await api.get(`${BASE}/`, { params });
    return response.data;
  },

  getOfferingById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  createOffering: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  updateOffering: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteOffering: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },

  autoGenerateOfferings: async (data = {}) => {
    const response = await api.post(`${BASE}/generate-offerings/`, data);
    return response.data;
  },
};

export default CourseOfferingService;