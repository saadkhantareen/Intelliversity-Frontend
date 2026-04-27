import { api } from './api';

const BASE = '/api/v1/academics/curriculum';

export const getCurriculums    = ()          => api.get(`${BASE}/`);
export const getCurriculum     = (id)        => api.get(`${BASE}/${id}/`);
export const createCurriculum  = (data)      => api.post(`${BASE}/`, data);
export const updateCurriculum  = (id, data)  => api.patch(`${BASE}/${id}/`, data);
export const deleteCurriculum  = (id)        => api.delete(`${BASE}/${id}/`);
