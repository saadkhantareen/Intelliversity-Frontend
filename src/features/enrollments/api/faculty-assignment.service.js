import { api } from '@/shared/api/client';

const BASE = '/api/v1/enrollments/faculty-assignments';

const FacultyAssignmentService = {
  getFacultyAssignments: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  getFacultyAssignmentById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  createFacultyAssignment: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  updateFacultyAssignment: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteFacultyAssignment: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },

  // for faculty portal

  getFacultyAssignedCourses: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  assignFacultyCourse: async (courseOfferingId) => {
    const response = await api.post(`${BASE}/`, {
      course_offering: courseOfferingId,
      status: 'pending',
    });
    return response.data;
  },

  deleteFacultyAssignedCourse: async (assignmentId) => {
    const response = await api.delete(`${BASE}/${assignmentId}/`);
    return response.data;
  },
};

export default FacultyAssignmentService;
