import { useCallback, useEffect, useState } from "react";
import CourseOfferingService from "../api/course-offering.service";
import StudentEnrollmentService from "../api/enrollment.service";
import { getCollection } from "../utils/enrollmentRelations.utils";

export const useStudentCoursePortal = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCourseData = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoading(true);
    setError("");

    try {
      const [availableResponse, registeredResponse] = await Promise.all([
        CourseOfferingService.getStudentAvailableCourseOfferings(),
        StudentEnrollmentService.getStudentRegisteredCourses(),
      ]);

      console.log("Available Courses Response:", availableResponse);
      console.log("Registered Courses Response:", registeredResponse);

      setAvailableCourses(getCollection(availableResponse));
      setRegisteredCourses(getCollection(registeredResponse));
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ??
          "Course registration data could not be loaded.",
      );
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const registerCourse = useCallback(
    async (courseOfferingId) => {
      setActionId(courseOfferingId);
      setError("");
      setNotice("");

      try {
        await StudentEnrollmentService.registerStudentCourse(courseOfferingId);
        setNotice("The course offering has been registered successfully.");
        await loadCourseData({ showLoading: false });
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The course offering could not be registered.",
        );
        throw requestError;
      } finally {
        setActionId("");
      }
    },
    [loadCourseData],
  );

  const dropRegisteredCourse = useCallback(
    async (enrollmentId) => {
      setActionId(enrollmentId);
      setError("");
      setNotice("");

      try {
        await StudentEnrollmentService.deleteStudentRegisteredCourse(
          enrollmentId,
        );
        setNotice("The course has been dropped.");
        await loadCourseData({ showLoading: false });
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The course could not be dropped.",
        );
        throw requestError;
      } finally {
        setActionId("");
      }
    },
    [loadCourseData],
  );

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  return {
    availableCourses,
    registeredCourses,
    isLoading,
    actionId,
    error,
    notice,
    registerCourse,
    dropRegisteredCourse,
  };
};
