import { useCallback, useEffect, useState } from 'react';
import EnrollmentService from '../api/enrollment.service';
import { getCollection } from '../utils/enrollmentRelations.utils';

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await EnrollmentService.getEnrollments();
      setEnrollments(getCollection(response));
    } catch (requestError) {
      setError(requestError.response?.data?.detail ?? 'Enrollments could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEnrollment = useCallback(
    async (id) => {
      setDeletingId(id);
      setError('');

      try {
        await EnrollmentService.deleteEnrollment(id);
        await loadEnrollments();
      } catch (requestError) {
        setError(requestError.response?.data?.detail ?? 'The enrollment could not be deleted.');
        throw requestError;
      } finally {
        setDeletingId('');
      }
    },
    [loadEnrollments]
  );

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  return {
    enrollments,
    isLoading,
    error,
    deletingId,
    deleteEnrollment,
  };
};
