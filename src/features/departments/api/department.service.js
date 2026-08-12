import { api } from './api';

// This matches your backend: path("api/v1/academics/", include("apps.academics.urls"))
// Plus the 'departments' route inside those urls.
const BASE = '/api/v1/academics/departments';

const DepartmentService = {
  getDepartments: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  getDepartmentById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },

  getDepartmentCodes: async () => {
    const response = await api.get(`${BASE}/codes/`);
    return response.data;
  },
};

export default DepartmentService;
