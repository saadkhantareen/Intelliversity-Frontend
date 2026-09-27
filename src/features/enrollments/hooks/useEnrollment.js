import { useCallback, useEffect, useState } from 'react';
import EnrollmentService from '../api/enrollment.service';
import {
  getEnrollmentPayload,
  getEnrollmentValues,
  INITIAL_ENROLLMENT_VALUES,
} from '../utils/enrollmentRelations.utils';

export const useEnrollment = (enrollmentId) => {
  const [values, setValues] = useState(INITIAL_ENROLLMENT_VALUES);
  const [isLoading, setIsLoading] = useState(Boolean(enrollmentId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enrollmentId) return;

    let isMounted = true;

    const loadEnrollment = async () => {
      setIsLoading(true);
      setError('');

      try {
        const enrollment = await EnrollmentService.getEnrollmentById(enrollmentId);

        if (isMounted) {
          setValues(getEnrollmentValues(enrollment));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.detail ?? 'The enrollment could not be loaded.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadEnrollment();

    return () => {
      isMounted = false;
    };
  }, [enrollmentId]);

  const saveEnrollment = useCallback(
    async (formValues) => {
      setIsSaving(true);
      setError('');

      const payload = getEnrollmentPayload(formValues);

      try {
        if (enrollmentId) {
          return await EnrollmentService.updateEnrollment(enrollmentId, payload);
        }

        return await EnrollmentService.createEnrollment(payload);
      } catch (requestError) {
        const message = requestError.response?.data?.detail ?? 'The enrollment could not be saved.';
        setError(message);
        throw requestError;
      } finally {
        setIsSaving(false);
      }
    },
    [enrollmentId]
  );

  return {
    values,
    setValues,
    isLoading,
    isSaving,
    error,
    saveEnrollment,
  };
};
