import { useEffect, useState } from 'react';
import { CourseService } from '@/features/courses';
import { TermService } from '@/features/terms';
import { ProfileService } from '@/features/profile';
import { BatchService } from '@/features/batches';
import { getCollection } from '../utils/courseOffering.utils';

export const useCourseOfferingLookups = (batchId) => {
  const [courses, setCourses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadLookups = async () => {
      setIsLoadingLookups(true);
      setError('');

      try {
        const [coursesResponse, termsResponse, facultiesResponse, batchesResponse] =
          await Promise.all([
            CourseService.getCourses(),
            TermService.getTerms(),
            ProfileService.getFaculty(),
            BatchService.getBatches(),
          ]);

        if (isMounted) {
          setCourses(getCollection(coursesResponse));
          setTerms(getCollection(termsResponse));
          setFaculties(getCollection(facultiesResponse));
          setBatches(getCollection(batchesResponse));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ??
              'Course offering selection data could not be loaded.'
          );
        }
      } finally {
        if (isMounted) setIsLoadingLookups(false);
      }
    };

    loadLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!batchId) {
      setSections([]);
      setIsLoadingSections(false);
      return;
    }

    let isMounted = true;

    const loadSections = async () => {
      setIsLoadingSections(true);
      setError('');

      try {
        const response = await BatchService.getSectionsByBatch(batchId);

        if (isMounted) {
          setSections(getCollection(response));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ??
              'Sections for the selected batch could not be loaded.'
          );
        }
      } finally {
        if (isMounted) setIsLoadingSections(false);
      }
    };

    loadSections();

    return () => {
      isMounted = false;
    };
  }, [batchId]);

  return {
    courses,
    terms,
    faculties,
    batches,
    sections,
    isLoadingLookups,
    isLoadingSections,
    error,
  };
};
