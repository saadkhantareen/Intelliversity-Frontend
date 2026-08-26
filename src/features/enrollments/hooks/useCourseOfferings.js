import { useCallback, useEffect, useState } from 'react';
import CourseOfferingService from '../api/course-offering.service';
import { getCollection } from '../utils/courseOffering.utils';

export const useCourseOfferings = () => {
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadCourseOfferings = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await CourseOfferingService.getCourseOfferings();
      setCourseOfferings(getCollection(response));
    } catch (requestError) {
      setError(requestError.response?.data?.detail ?? 'Course offerings could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCourseOffering = useCallback(
    async (id) => {
      setDeletingId(id);
      setError('');

      try {
        await CourseOfferingService.deleteCourseOffering(id);
        await loadCourseOfferings();
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ?? 'The course offering could not be deleted.'
        );
        throw requestError;
      } finally {
        setDeletingId('');
      }
    },
    [loadCourseOfferings]
  );

  useEffect(() => {
    loadCourseOfferings();
  }, [loadCourseOfferings]);

  return {
    courseOfferings,
    isLoading,
    error,
    deletingId,
    loadCourseOfferings,
    deleteCourseOffering,
  };
};
