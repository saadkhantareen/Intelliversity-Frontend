import { useCallback, useEffect, useState } from 'react';
import CourseOfferingService from '../api/course-offering.service';
import {
  getCourseOfferingFormValues,
  getCourseOfferingPayload,
  INITIAL_COURSE_OFFERING_VALUES,
} from '../utils/courseOffering.utils';

export const useCourseOffering = (courseOfferingId) => {
  const [values, setValues] = useState(INITIAL_COURSE_OFFERING_VALUES);
  const [isLoading, setIsLoading] = useState(Boolean(courseOfferingId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseOfferingId) return;

    let isMounted = true;

    const loadCourseOffering = async () => {
      setIsLoading(true);
      setError('');

      try {
        const courseOffering = await CourseOfferingService.getCourseOfferingById(courseOfferingId);

        if (isMounted) {
          setValues(getCourseOfferingFormValues(courseOffering));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ?? 'The course offering could not be loaded.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCourseOffering();

    return () => {
      isMounted = false;
    };
  }, [courseOfferingId]);

  const saveCourseOffering = useCallback(
    async (formValues) => {
      setIsSaving(true);
      setError('');

      const payload = getCourseOfferingPayload(formValues);

      try {
        if (courseOfferingId) {
          return await CourseOfferingService.updateCourseOffering(courseOfferingId, payload);
        }

        return await CourseOfferingService.createCourseOffering(payload);
      } catch (requestError) {
        const message =
          requestError.response?.data?.detail ?? 'The course offering could not be saved.';
        setError(message);
        throw requestError;
      } finally {
        setIsSaving(false);
      }
    },
    [courseOfferingId]
  );

  return {
    values,
    setValues,
    isLoading,
    isSaving,
    error,
    saveCourseOffering,
  };
};
