import { api } from '@/shared/services/client';


const BASE = '/api/v1/academics/programs';

const ProgramService = {
  getPrograms: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  createProgram: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  getProgramById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  updateProgram: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteProgram: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },
};

export default ProgramService;
