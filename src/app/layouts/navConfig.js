import {
  IcGrid,
  IcBook,
  IcCalendar,
  IcChart,
  IcUsers,
  IcUser,
  IcArchive,
  IcSettings,
  IcClipboard,
} from '@/shared/components/icons';

export const ADMIN_NAV_CONFIG = {
  portal: 'admin',
  label: 'Admin Portal',
  badge: { bg: '#F59E0B', text: '#1E1B4B' },
  accent: 'var(--brand-primary, #1E3A8A)',

  // Primary navbar links (max 4-5)
  primary: [
    { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
    { label: 'Departments', to: '/academics/departments', Icon: IcArchive },
    { label: 'Courses', to: '/academics/courses', Icon: IcBook },
    { label: 'Attendance', to: '/attendance/sessions', Icon: IcCalendar },
    { label: 'Examination', to: '/examinations/assessment-types', Icon: IcChart },
  ],

  // Floating dock quick links (4-6)
  dock: [
    { title: 'Dashboard', href: '/dashboard', Icon: IcGrid },
    { title: 'Students', href: '/users/students', Icon: IcUsers },
    { title: 'Faculty', href: '/users/faculty', Icon: IcUsers },
    { title: 'Courses', href: '/academics/courses', Icon: IcBook },
    { title: 'Attendance', href: '/attendance/sessions', Icon: IcCalendar },
    { title: 'Profile', href: '/profile', Icon: IcUser },
  ],

  // Full grouped navigation for sidebar
  sections: [
    {
      title: 'Management',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
        { label: 'Policies', to: '/policies', Icon: IcSettings },
        { label: 'Profile', to: '/profile', Icon: IcUser },
      ],
    },
    {
      title: 'Academics',
      items: [
        { label: 'Departments', to: '/academics/departments', Icon: IcArchive },
        { label: 'Programs', to: '/academics/programs', Icon: IcArchive },
        { label: 'Courses', to: '/academics/courses', Icon: IcBook },
        { label: 'Curriculum', to: '/academics/curriculums', Icon: IcBook },
        { label: 'Academic Years', to: '/academics/academic-years', Icon: IcArchive },
        { label: 'Terms', to: '/academics/terms', Icon: IcArchive },
        { label: 'Batches', to: '/academics/batches', Icon: IcUsers },
        { label: 'Students', to: '/users/students', Icon: IcUsers },
        { label: 'Faculty', to: '/users/faculty', Icon: IcUsers },
      ],
    },
    {
      title: 'Enrollments',
      items: [
        { label: 'Course Offering', to: '/enrollments/course-offerings', Icon: IcBook },
        { label: 'Faculty Assignment', to: '/enrollments/faculty-assignments', Icon: IcUsers },
        { label: 'Student Enrollment', to: '/enrollments/student-enrollments', Icon: IcUsers },
      ],
    },
    {
      title: 'Attendance',
      items: [
        { label: 'Attendance Policies', to: '/attendance/policies', Icon: IcSettings },
        { label: 'Generate Sessions', to: '/attendance/generate', Icon: IcArchive },
        { label: 'Class Sessions', to: '/attendance/sessions', Icon: IcCalendar },
        { label: 'Defaulters Report', to: '/attendance/reports/defaulters', Icon: IcChart },
        { label: 'Compliance Report', to: '/attendance/reports/compliance', Icon: IcChart },
      ],
    },
    {
      title: 'Examination',
      items: [
        { label: 'Assessment Types', to: '/examinations/assessment-types', Icon: IcChart },
        { label: 'Assessment Policies', to: '/examinations/assessment-policies', Icon: IcChart },
        { label: 'Grade Policies', to: '/examinations/grade-policies', Icon: IcChart },
        { label: 'Grade Scales', to: '/examinations/grade-scales', Icon: IcChart },
      ],
    },
  ],
};

export const FACULTY_NAV_CONFIG = {
  portal: 'faculty',
  label: 'Faculty Portal',
  badge: { bg: '#10B981', text: '#FFFFFF' },
  accent: 'var(--brand-primary, #059669)',

  // Primary navbar links
  // NOTE: /grading does not exist in AppRouter. Faculty manages grading and students inside /courses.
  primary: [
    { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
    { label: 'Attendance', to: '/attendance', Icon: IcCalendar },
    { label: 'My Courses', to: '/courses', Icon: IcBook },
    { label: 'Profile', to: '/profile', Icon: IcUser },
  ],

  // Floating dock quick links
  dock: [
    { title: 'Dashboard', href: '/dashboard', Icon: IcGrid },
    { title: 'Attendance', href: '/attendance', Icon: IcCalendar },
    { title: 'My Courses', href: '/courses', Icon: IcBook },
    { title: 'Profile', href: '/profile', Icon: IcUser },
  ],

  // Full grouped navigation for sidebar
  // Removed nonexistent routes (/grading, /announcements, /messages, /reports) to prevent 404s
  sections: [
    {
      title: 'Teaching',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
        { label: 'Profile', to: '/profile', Icon: IcUser },
        { label: 'My Courses', to: '/courses', Icon: IcBook },
        { label: 'Attendance', to: '/attendance', Icon: IcCalendar },
      ],
    },
  ],
};

export const STUDENT_NAV_CONFIG = {
  portal: 'student',
  label: 'Student Portal',
  badge: { bg: '#EAB308', text: '#0F172A' },
  accent: 'var(--brand-primary, #4F46E5)',

  // Primary navbar links
  // NOTE: Results route in AppRouter is /student-marks (not /results)
  primary: [
    { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
    { label: 'My Attendance', to: '/attendance', Icon: IcCalendar },
    { label: 'Results', to: '/student-marks', Icon: IcChart },
    { label: 'Courses', to: '/view-courses', Icon: IcBook },
  ],

  // Floating dock quick links
  dock: [
    { title: 'Dashboard', href: '/dashboard', Icon: IcGrid },
    { title: 'Attendance', href: '/attendance', Icon: IcCalendar },
    { title: 'Results', href: '/student-marks', Icon: IcChart },
    { title: 'Courses', href: '/view-courses', Icon: IcBook },
    { title: 'Profile', href: '/profile', Icon: IcUser },
  ],

  // Full grouped navigation for sidebar
  // Nonexistent routes (/fees, /sos) omitted; results mapped to /student-marks
  sections: [
    {
      title: 'Main Menu',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
        { label: 'Profile', to: '/profile', Icon: IcUser },
        { label: 'View Courses', to: '/view-courses', Icon: IcBook },
        { label: 'Registration', to: '/registration', Icon: IcClipboard },
        { label: 'Result Card', to: '/student-marks', Icon: IcChart },
        { label: 'My Attendance', to: '/attendance', Icon: IcCalendar },
      ],
    },
  ],
};
