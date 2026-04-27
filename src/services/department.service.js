import { api } from './api';

const BASE = '/api/v1/academics/departments';

export const getDepartments    = ()          => api.get(`${BASE}/`);
export const getDepartment     = (id)        => api.get(`${BASE}/${id}/`);
export const createDepartment  = (data)      => api.post(`${BASE}/`, data);
export const updateDepartment  = (id, data)  => api.patch(`${BASE}/${id}/`, data);
export const deleteDepartment  = (id)        => api.delete(`${BASE}/${id}/`);
