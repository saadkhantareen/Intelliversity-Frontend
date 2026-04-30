// src/services/courseService.js

const DUMMY_COURSES = [
  {
    id: "CSE357",
    course_no: "CSE357",
    course_name: "Business Process Engineering",
    credits: 3,
    teacher: "Dr. Abid Sohail Bhutta",
    class_name: "BSE 7 SP23-BSE-A A",
    attendance: [88] // Array to support multiple components (Theory/Lab)
  },
  {
    id: "CSC495",
    course_no: "CSC495",
    course_name: "Game Development",
    credits: 4,
    teacher: "Muhammad Mohsin Mehdi",
    class_name: "BSE 7 SP23-BSE-A Elective A",
    attendance: [95, 100] 
  }
];

export const courseService = {
  getRegisteredCourses: async () => {
    // Simulating API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(DUMMY_COURSES), 500);
    });
  }
};