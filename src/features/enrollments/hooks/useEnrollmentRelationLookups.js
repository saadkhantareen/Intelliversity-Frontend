import { useEffect, useState } from 'react';
import { ProfileService } from '@/features/profile';
import CourseOfferingService from '../api/course-offering.service';
import { getCollection } from '../utils/enrollmentRelations.utils';

const profileLoaders = {
  faculty: () => ProfileService.getFaculty(),
  student: () => ProfileService.getStudents(),
};

export const useEnrollmentRelationLookups = (profileType) => {
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadLookups = async () => {
      setIsLoading(true);
      setError('');

      try {
        const profileLoader = profileLoaders[profileType];
        const [courseOfferingsResponse, profilesResponse] = await Promise.all([
          CourseOfferingService.getCourseOfferings(),
          profileLoader(),
        ]);

        if (isMounted) {
          setCourseOfferings(getCollection(courseOfferingsResponse));
          setProfiles(getCollection(profilesResponse));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ??
              requestError.message ??
              'Selection data could not be loaded.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadLookups();

    return () => {
      isMounted = false;
    };
  }, [profileType]);

  return {
    courseOfferings,
    profiles,
    isLoading,
    error,
  };
};
