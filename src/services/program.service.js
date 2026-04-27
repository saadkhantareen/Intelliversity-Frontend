import { api } from './api';

const BASE = '/api/v1/academics/programs';

export const getPrograms    = ()          => api.get(`${BASE}/`);
export const getProgram     = (id)        => api.get(`${BASE}/${id}/`);
export const createProgram  = (data)      => api.post(`${BASE}/`, data);
export const updateProgram  = (id, data)  => api.patch(`${BASE}/${id}/`, data);
export const deleteProgram  = (id)        => api.delete(`${BASE}/${id}/`);
