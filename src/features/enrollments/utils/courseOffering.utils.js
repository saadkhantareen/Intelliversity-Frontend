export const getCollection = (response) => {
  if (Array.isArray(response)) return response;
  return response?.results ?? [];
};

export const getCourseLabel = (course) => {
  const parts = [course?.code, course?.name].filter(Boolean);
  return parts.join(' — ') || 'Unnamed course';
};

export const getFacultyLabel = (faculty) => {
  const user = faculty?.base_profile?.user ?? faculty;
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const name = fullName || faculty?.name || faculty?.full_name || user?.email;
  const registrationId = faculty?.registration_id;

  if (name && registrationId) return `${name} (${registrationId})`;
  return name || registrationId || 'Unnamed faculty member';
};

export const getBatchLabel = (batch) => {
  const semester = batch?.current_semester ? `Semester ${batch.current_semester}` : '';
  return [batch?.name, semester].filter(Boolean).join(' · ') || 'Unnamed batch';
};

export const INITIAL_COURSE_OFFERING_VALUES = {
  course_id: '',
  term_id: '',
  batch_id: '',
  section_id: '',
  faculty_id: '',
  capacity: '',
};

export const getCourseOfferingFormValues = (courseOffering) => ({
  course_id: courseOffering?.course_id ?? courseOffering?.course?.id ?? '',
  term_id: courseOffering?.term_id ?? courseOffering?.term?.id ?? '',
  batch_id: courseOffering?.batch_id ?? courseOffering?.batch?.id ?? '',
  section_id: courseOffering?.section_id ?? courseOffering?.section?.id ?? '',
  faculty_id: courseOffering?.faculty_id ?? courseOffering?.faculty?.id ?? '',
  capacity: courseOffering?.capacity ?? '',
});

export const getCourseOfferingPayload = ({
  course_id,
  term_id,
  section_id,
  faculty_id,
  capacity,
}) => ({
  course_id,
  term_id,
  section_id,
  capacity: Number(capacity),
  ...(faculty_id ? { faculty_id } : {}),
});

export const validateCourseOffering = (values) => {
  if (!values.course_id) return 'Select a course.';
  if (!values.term_id) return 'Select a term.';
  if (!values.batch_id) return 'Select a batch before selecting a section.';
  if (!values.section_id) return 'Select a section.';
  if (!values.capacity || Number(values.capacity) < 1) return 'Enter a capacity of at least 1.';

  return '';
};
