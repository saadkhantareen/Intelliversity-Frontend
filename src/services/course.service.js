import { api } from './api';

const BASE = '/api/v1/academics/courses';

export const getCourses        = ()          => api.get(`${BASE}/`);
export const getCourse         = (id)        => api.get(`${BASE}/${id}/`);
export const createCourse      = (data)      => api.post(`${BASE}/`, data);
export const updateCourse      = (id, data)  => api.patch(`${BASE}/${id}/`, data);
export const deleteCourse      = (id)        => api.delete(`${BASE}/${id}/`);
export const getCoursePrereqs  = (id)        => api.get(`${BASE}/${id}/prerequisites/`);
