import { api } from './api';

const BASE = '/api/v1/academics/academic-years';

const AcademicYearService = {
  getYears: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },
  getYearById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },
  createYear: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },
  updateYear: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteYear: async (id) => {
  const response = await api.delete(`${BASE}/${id}/`);
  return response.data;
},
};

export default AcademicYearService;