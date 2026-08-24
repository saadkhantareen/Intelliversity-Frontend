import { api } from '@/shared/api/client';

const BASE = '/api/v1/academics/batches';

const BatchService = {
  getBatches: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },
  getBatchById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },
  createBatch: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },
  updateBatch: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },
  deleteBatch: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },
};

export default BatchService;
