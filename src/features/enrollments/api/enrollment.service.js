import { api } from '@/shared/api/client';

const BASE = '/api/v1/enrollments/student-enrollments';

const EnrollmentService = {
  getEnrollments: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  getEnrollmentById: async (id) => {
    const response = await api.get(`${BASE}/${id}/`);
    return response.data;
  },

  createEnrollment: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  updateEnrollment: async (id, data) => {
    const response = await api.patch(`${BASE}/${id}/`, data);
    return response.data;
  },

  deleteEnrollment: async (id) => {
    const response = await api.delete(`${BASE}/${id}/`);
    return response.data;
  },

  // for student portal
  getStudentRegisteredCourses: async () => {
    const response = await api.get(`${BASE}/`);
    return response.data;
  },

  registerStudentCourse: async (courseOfferingId) => {
    const response = await api.post(`${BASE}/`, {
      course_offering: courseOfferingId,
      status: 'enrolled',
    });
    return response.data;
  },

  deleteStudentRegisteredCourse: async (enrollmentId) => {
    const response = await api.delete(`${BASE}/${enrollmentId}/`);
    return response.data;
  },

  // Get students for a specific course offering using course_offering_id
  getStudentsByCourseOffering: async (courseOfferingId) => {
    const response = await api.get('/api/v1/enrollments/students/', {
      params: { course_offering_id: courseOfferingId },
    });
    return response.data;
  },
};

export default EnrollmentService;