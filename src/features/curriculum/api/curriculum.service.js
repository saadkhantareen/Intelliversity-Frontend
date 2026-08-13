import { api } from '@/shared/services/client';


const BASE = '/api/v1/academics/curriculums';

const CurriculumService = {
  getCurriculums: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  getCurriculumById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  createCurriculum: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  updateCurriculum: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteCurriculum: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },
};

export default CurriculumService;
