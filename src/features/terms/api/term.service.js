import { api } from '@/shared/api/client';

const BASE = '/api/v1/academics/terms';

const TermService = {
  getTerms: async (academicYearId) => {
    const params = {};

    if (academicYearId) {
      params.academic_year = academicYearId;
    }

    const response = await api.get(`${BASE}/`, { params });

    return response.data;
  },

  getTermById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  createTerm: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  updateTerm: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteTerm: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },

  activateTerm: async (id) => {
    const response = await api.post(`${BASE}/${id}/activate/`);
    return response.data;
  },
};

export default TermService;
