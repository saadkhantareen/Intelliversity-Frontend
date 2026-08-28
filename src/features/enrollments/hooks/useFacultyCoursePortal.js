import { useCallback, useEffect, useState } from "react";
import FacultyAssignmentService from "../api/faculty-assignment.service";
import CourseOfferingService from "../api/course-offering.service";
import { getCollection } from "../utils/enrollmentRelations.utils";

export const useFacultyCoursePortal = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCourseData = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoading(true);
    setError("");

    try {
      const [availableResponse, assignedResponse] = await Promise.all([
        CourseOfferingService.getFacultyAvailableCourseOfferings(),
        FacultyAssignmentService.getFacultyAssignedCourses(),
      ]);

      setAvailableCourses(getCollection(availableResponse));
      setAssignedCourses(getCollection(assignedResponse));
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ??
          "Course assignment data could not be loaded.",
      );
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const assignCourse = useCallback(
    async (courseOfferingId) => {
      setActionId(courseOfferingId);
      setError("");
      setNotice("");

      try {
        await FacultyAssignmentService.assignFacultyCourse(courseOfferingId);
        setNotice("The course offering has been submitted for assignment.");
        await loadCourseData({ showLoading: false });
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The course offering could not be assigned.",
        );
        throw requestError;
      } finally {
        setActionId("");
      }
    },
    [loadCourseData],
  );

  const removeAssignedCourse = useCallback(
    async (assignmentId) => {
      setActionId(assignmentId);
      setError("");
      setNotice("");

      try {
        await FacultyAssignmentService.deleteFacultyAssignedCourse(assignmentId);
        setNotice("The assigned course has been removed.");
        await loadCourseData({ showLoading: false });
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The assigned course could not be removed.",
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
    assignedCourses,
    isLoading,
    actionId,
    error,
    notice,
    assignCourse,
    removeAssignedCourse,
  };
};
