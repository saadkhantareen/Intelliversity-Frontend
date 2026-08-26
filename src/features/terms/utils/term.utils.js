export const TERM_TYPE_OPTIONS = [
  { value: 'FALL', label: 'Fall' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'WINTER', label: 'Winter' },
];

export const formatDate = (dateString) => {
  if (!dateString) return '—';

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
};

export const getTermTypeLabel = (termType) => {
  return TERM_TYPE_OPTIONS.find((option) => option.value === termType)?.label ?? termType;
};

export const validateTermDates = (values) => {
  const ranges = [
    ['start_date', 'end_date', 'The term end date must be on or after the start date.'],
    ['fee_issue_date', 'fee_deadline', 'The fee deadline must be on or after the fee issue date.'],
    [
      'faculty_course_assignment_start_date',
      'faculty_course_assignment_end_date',
      'The faculty assignment end date must be on or after its start date.',
    ],
    [
      'course_registration_start_date',
      'course_registration_end_date',
      'The course registration end date must be on or after its start date.',
    ],
  ];

  const invalidRange = ranges.find(([startKey, endKey]) => {
    return values[startKey] && values[endKey] && values[startKey] > values[endKey];
  });

  return invalidRange?.[2] ?? '';
};
