import { api } from '@/shared/api/client';

const BASE = '/api/v1/examinations';

const ExaminationService = {
  // Assessment Types CRUD
  getAssessmentTypes: async (params = {}) => {
    const response = await api.get(`${BASE}/assessment-types/`, { params });
    return response.data;
  },

  createAssessmentType: async (data) => {
    const response = await api.post(`${BASE}/assessment-types/`, data);
    return response.data;
  },

  updateAssessmentType: async (id, data) => {
    const response = await api.patch(`${BASE}/assessment-types/${id}/`, data);
    return response.data;
  },

  deleteAssessmentType: async (id) => {
    const response = await api.delete(`${BASE}/assessment-types/${id}/`);
    return response.data;
  },

  // Assessment Policies CRUD
  getAssessmentPolicies: async (params = {}) => {
    const response = await api.get(`${BASE}/assessment-policies/`, { params });
    return response.data;
  },

  createAssessmentPolicy: async (data) => {
    const response = await api.post(`${BASE}/assessment-policies/`, data);
    return response.data;
  },

  updateAssessmentPolicy: async (id, data) => {
    const response = await api.patch(`${BASE}/assessment-policies/${id}/`, data);
    return response.data;
  },

  deleteAssessmentPolicy: async (id) => {
    const response = await api.delete(`${BASE}/assessment-policies/${id}/`);
    return response.data;
  },

  // Grade Policies CRUD
  getGradePolicies: async (params = {}) => {
    const response = await api.get(`${BASE}/grade-policies/`, { params });
    return response.data;
  },

  createGradePolicy: async (data) => {
    const response = await api.post(`${BASE}/grade-policies/`, data);
    return response.data;
  },

  updateGradePolicy: async (id, data) => {
    const response = await api.patch(`${BASE}/grade-policies/${id}/`, data);
    return response.data;
  },

  deleteGradePolicy: async (id) => {
    const response = await api.delete(`${BASE}/grade-policies/${id}/`);
    return response.data;
  },

  // Grade Scales CRUD
  getGradeScales: async (params = {}) => {
    const response = await api.get(`${BASE}/grade-scales/`, { params });
    return response.data;
  },

  createGradeScale: async (data) => {
    const response = await api.post(`${BASE}/grade-scales/`, data);
    return response.data;
  },

  updateGradeScale: async (id, data) => {
    const response = await api.patch(`${BASE}/grade-scales/${id}/`, data);
    return response.data;
  },

  deleteGradeScale: async (id) => {
    const response = await api.delete(`${BASE}/grade-scales/${id}/`);
    return response.data;
  },

  // ── Faculty: Assessments (Quiz 1, Midterm 1...) tied to a course offering ──
  getAssessmentsByCourseOffering: async (courseOfferingId) => {
    const response = await api.get(`${BASE}/faculty/assessments/`, {
      params: { course_offering: courseOfferingId },
    });
    return response.data;
  },

  createAssessment: async (data) => {
    const response = await api.post(`${BASE}/faculty/assessments/`, data);
    return response.data;
  },

  updateAssessment: async (id, data) => {
    const response = await api.patch(`${BASE}/faculty/assessments/${id}/`, data);
    return response.data;
  },

  deleteAssessment: async (id) => {
    const response = await api.delete(`${BASE}/faculty/assessments/${id}/`);
    return response.data;
  },

  // Bulk gradebook helpers (map to @action routes on FacultyAssessmentViewSet)
  getGradebook: async (assessmentId) => {
    const response = await api.get(`${BASE}/faculty/assessments/${assessmentId}/gradebook/`);
    return response.data;
  },

  bulkGrade: async (assessmentId, data) => {
    const response = await api.post(`${BASE}/faculty/assessments/${assessmentId}/bulk-grade/`, data);
    return response.data;
  },

  // ── Faculty: individual student marks ──
  getStudentAssessmentsByAssessment: async (assessmentId) => {
    const response = await api.get(`${BASE}/faculty/student-assessments/`, {
      params: { assessment: assessmentId },
    });
    return response.data;
  },

  createStudentAssessment: async (data) => {
    const response = await api.post(`${BASE}/faculty/student-assessments/`, data);
    return response.data;
  },

  updateStudentAssessment: async (id, data) => {
    const response = await api.patch(`${BASE}/faculty/student-assessments/${id}/`, data);
    return response.data;
  },

  // ── Student: view published course marks/assessments ──
  getStudentAssessments: async (params = {}) => {
    const response = await api.get(`${BASE}/student-assessments/`, { params });
    return response.data;
  },
};

export default ExaminationService;