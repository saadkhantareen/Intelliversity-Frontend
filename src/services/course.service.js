import { api } from './api';

const BASE = '/api/v1/academics/courses';

const CourseService = {
  getCourses: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  createCourse: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  updateCourse: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },
  getRegisteredCourses: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },
};

export const courseService = CourseService;
export default CourseService;
