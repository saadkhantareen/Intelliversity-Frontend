export const getCollection = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  return payload?.results ?? [];
};

export const getProfileLabel = (profile) => {
  if (profile?.name) return profile.name;

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  return fullName || profile?.full_name || profile?.email || 'Unnamed profile';
};

export const getCourseOfferingLabel = (courseOffering) => {
  const course = [courseOffering?.course?.code, courseOffering?.course?.name]
    .filter(Boolean)
    .join(' — ');
  const context = [
    courseOffering?.term?.name,
    courseOffering?.batch?.name,
    courseOffering?.section?.name,
  ]
    .filter(Boolean)
    .join(' · ');

  return [course, context].filter(Boolean).join(' · ') || 'Unnamed course offering';
};

export const getEntityNameById = (items, id, getLabel) => {
  return getLabel(items.find((item) => item.id === id)) || '—';
};

export const FACULTY_ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'completed', label: 'Completed' },
];

export const getStatusLabel = (status, options) => {
  return options.find((option) => option.value === status)?.label ?? status;
};

export const getStatusClassName = (status) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-800',
    approved: 'bg-emerald-50 text-emerald-700',
    enrolled: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    dropped: 'bg-red-50 text-red-700',
    withdrawn: 'bg-orange-50 text-orange-700',
    completed: 'bg-blue-50 text-blue-700',
    cancelled: 'bg-slate-100 text-slate-600',
  };

  return classes[status] ?? 'bg-slate-100 text-slate-600';
};

export const INITIAL_FACULTY_ASSIGNMENT_VALUES = {
  course_offering: '',
  faculty: '',
  status: 'pending',
};

export const INITIAL_ENROLLMENT_VALUES = {
  course_offering: '',
  student: '',
  status: 'enrolled',
};

export const getFacultyAssignmentValues = (facultyAssignment) => ({
  course_offering: facultyAssignment?.course_offering ?? '',
  faculty: facultyAssignment?.faculty ?? '',
  status: facultyAssignment?.status ?? 'pending',
});

export const getEnrollmentValues = (enrollment) => ({
  course_offering: enrollment?.course_offering ?? '',
  student: enrollment?.student ?? '',
  status: enrollment?.status ?? 'enrolled',
});

export const getFacultyAssignmentPayload = ({ course_offering, faculty, status }) => ({
  course_offering,
  faculty,
  status,
});

export const getEnrollmentPayload = ({ course_offering, student, status }) => ({
  course_offering,
  student,
  status,
});

export const validateFacultyAssignment = (values) => {
  if (!values.course_offering) return 'Select a course offering.';
  if (!values.faculty) return 'Select a faculty member.';
  if (!values.status) return 'Select an assignment status.';

  return '';
};

export const validateEnrollment = (values) => {
  if (!values.course_offering) return 'Select a course offering.';
  if (!values.student) return 'Select a student.';
  if (!values.status) return 'Select an enrollment status.';

  return '';
};
