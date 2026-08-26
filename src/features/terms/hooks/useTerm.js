import { useCallback, useEffect, useState } from 'react';
import TermService from '../api/term.service';

const INITIAL_VALUES = {
  academic_year: '',
  name: '',
  start_date: '',
  end_date: '',
  term_type: 'FALL',
  fee_issue_date: '',
  fee_deadline: '',
  faculty_course_assignment_start_date: '',
  faculty_course_assignment_end_date: '',
  course_registration_start_date: '',
  course_registration_end_date: '',
  course_drop_deadline: '',
  course_withdraw_deadline: '',
};

export const useTerm = (termId, defaultAcademicYearId = '') => {
  const [values, setValues] = useState({
    ...INITIAL_VALUES,
    academic_year: defaultAcademicYearId,
  });
  const [isLoading, setIsLoading] = useState(Boolean(termId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!termId) {
      setValues((currentValues) => ({
        ...currentValues,
        academic_year: defaultAcademicYearId || currentValues.academic_year,
      }));
      return;
    }

    let isMounted = true;

    const loadTerm = async () => {
      setIsLoading(true);
      setError('');

      try {
        const term = await TermService.getTermById(termId);

        if (isMounted) {
          setValues({
            academic_year: term.academic_year ?? '',
            name: term.name ?? '',
            start_date: term.start_date ?? '',
            end_date: term.end_date ?? '',
            term_type: term.term_type ?? 'FALL',
            fee_issue_date: term.fee_issue_date ?? '',
            fee_deadline: term.fee_deadline ?? '',
            faculty_course_assignment_start_date: term.faculty_course_assignment_start_date ?? '',
            faculty_course_assignment_end_date: term.faculty_course_assignment_end_date ?? '',
            course_registration_start_date: term.course_registration_start_date ?? '',
            course_registration_end_date: term.course_registration_end_date ?? '',
            course_drop_deadline: term.course_drop_deadline ?? '',
            course_withdraw_deadline: term.course_withdraw_deadline ?? '',
          });
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.detail ?? 'The term could not be loaded.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTerm();

    return () => {
      isMounted = false;
    };
  }, [defaultAcademicYearId, termId]);

  const saveTerm = useCallback(
    async (data) => {
      setIsSaving(true);
      setError('');

      try {
        if (termId) {
          return await TermService.updateTerm(termId, data);
        }

        return await TermService.createTerm(data);
      } catch (requestError) {
        const message = requestError.response?.data?.detail ?? 'The term could not be saved.';
        setError(message);
        throw requestError;
      } finally {
        setIsSaving(false);
      }
    },
    [termId]
  );

  return {
    values,
    setValues,
    isLoading,
    isSaving,
    error,
    setError,
    saveTerm,
  };
};
