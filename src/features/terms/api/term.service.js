import { api } from '@/shared/services/client';


const BASE = '/api/v1/academics/terms';

const TermService = {
  getTerms: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },
  getTermById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },
  // Note: Terms are usually created/updated via Academic Year,
  // but these endpoints are here if your API supports standalone term management.
  updateTerm: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },
};

export default TermService;
