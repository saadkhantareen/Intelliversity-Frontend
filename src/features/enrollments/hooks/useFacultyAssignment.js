import { useCallback, useEffect, useState } from 'react';
import FacultyAssignmentService from '../api/faculty-assignment.service';
import {
  getFacultyAssignmentPayload,
  getFacultyAssignmentValues,
  INITIAL_FACULTY_ASSIGNMENT_VALUES,
} from '../utils/enrollmentRelations.utils';

export const useFacultyAssignment = (facultyAssignmentId) => {
  const [values, setValues] = useState(INITIAL_FACULTY_ASSIGNMENT_VALUES);
  const [isLoading, setIsLoading] = useState(Boolean(facultyAssignmentId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!facultyAssignmentId) return;

    let isMounted = true;

    const loadFacultyAssignment = async () => {
      setIsLoading(true);
      setError('');

      try {
        const facultyAssignment =
          await FacultyAssignmentService.getFacultyAssignmentById(facultyAssignmentId);

        if (isMounted) {
          setValues(getFacultyAssignmentValues(facultyAssignment));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ?? 'The faculty assignment could not be loaded.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFacultyAssignment();

    return () => {
      isMounted = false;
    };
  }, [facultyAssignmentId]);

  const saveFacultyAssignment = useCallback(
    async (formValues) => {
      setIsSaving(true);
      setError('');

      const payload = getFacultyAssignmentPayload(formValues);

      try {
        if (facultyAssignmentId) {
          return await FacultyAssignmentService.updateFacultyAssignment(
            facultyAssignmentId,
            payload
          );
        }

        return await FacultyAssignmentService.createFacultyAssignment(payload);
      } catch (requestError) {
        const message =
          requestError.response?.data?.detail ?? 'The faculty assignment could not be saved.';
        setError(message);
        throw requestError;
      } finally {
        setIsSaving(false);
      }
    },
    [facultyAssignmentId]
  );

  return {
    values,
    setValues,
    isLoading,
    isSaving,
    error,
    saveFacultyAssignment,
  };
};
