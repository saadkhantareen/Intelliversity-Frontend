import { useCallback, useEffect, useState } from 'react';
import FacultyAssignmentService from '../api/faculty-assignment.service';
import { getCollection } from '../utils/enrollmentRelations.utils';

export const useFacultyAssignments = () => {
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadFacultyAssignments = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await FacultyAssignmentService.getFacultyAssignments();
      setFacultyAssignments(getCollection(response));
    } catch (requestError) {
      setError(requestError.response?.data?.detail ?? 'Faculty assignments could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFacultyAssignment = useCallback(
    async (id) => {
      setDeletingId(id);
      setError('');

      try {
        await FacultyAssignmentService.deleteFacultyAssignment(id);
        await loadFacultyAssignments();
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ?? 'The faculty assignment could not be deleted.'
        );
        throw requestError;
      } finally {
        setDeletingId('');
      }
    },
    [loadFacultyAssignments]
  );

  useEffect(() => {
    loadFacultyAssignments();
  }, [loadFacultyAssignments]);

  return {
    facultyAssignments,
    isLoading,
    error,
    deletingId,
    deleteFacultyAssignment,
  };
};
