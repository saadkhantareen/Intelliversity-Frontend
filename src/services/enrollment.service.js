import api from "./api";

const EnrollmentService = {
  // --- Admin / Faculty Assignment ---
  getFacultyEnrollmentCourses: async () => {
    // Hits path: faculty/courses-for-enrollment/
    const response = await api.get("/api/v1/enrollments/faculty/courses-for-enrollment/");
    return response.data;
  },

  assignCourseToFaculty: async (data) => {
    // Hits router: faculty/courses/
    const response = await api.post("/api/v1/enrollments/faculty/courses/", data);
    return response.data;
  },

  getFacultyAssignments: async () => {
    const response = await api.get("/api/v1/enrollments/faculty/courses/");
    return response.data;
  },

  // --- Student Enrollment ---
  getStudentOfferedCourses: async () => {
    // Hits path: student/courses-for-enrollment/
    const response = await api.get("/api/v1/enrollments/student/courses-for-enrollment/");
    return response.data;
  },

  enrollInCourse: async (courseCode) => {
    // Serializer uses SlugRelatedField for "course" using "code"
    const response = await api.post("/api/v1/enrollments/student/enrollments/", {
      course: courseCode
    });
    return response.data;
  },

  getMyEnrollments: async () => {
    const response = await api.get("/api/v1/enrollments/student/enrollments/");
    return response.data;
  },

  dropCourse: async (enrollmentId) => {
    const response = await api.delete(`/api/v1/enrollments/student/enrollments/${enrollmentId}/`);
    return response.data;
  }
};

export default EnrollmentService;