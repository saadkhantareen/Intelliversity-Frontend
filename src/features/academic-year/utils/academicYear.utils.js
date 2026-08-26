export const formatDate = (dateString) => {
  if (!dateString) return '—';

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
};

export const validateAcademicYearDates = ({ start_date, end_date }) => {
  if (start_date && end_date && start_date > end_date) {
    return 'The end date must be on or after the start date.';
  }

  return '';
};

export const getAcademicYearLabel = ({ name, start_date, end_date }) => {
  if (name) return name;

  return `${formatDate(start_date)} – ${formatDate(end_date)}`;
};
