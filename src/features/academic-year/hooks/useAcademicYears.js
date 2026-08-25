import { useCallback, useEffect, useState } from "react";
import AcademicYearService from "../api/academic-year.service";

export const useAcademicYears = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activatingId, setActivatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadAcademicYears = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await AcademicYearService.getYears();
      setAcademicYears(
        Array.isArray(response) ? response : (response.results ?? []),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ??
          "Academic years could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateAcademicYear = useCallback(
    async (id) => {
      setActivatingId(id);
      setError("");

      try {
        await AcademicYearService.activateYear(id);
        await loadAcademicYears();
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The academic year could not be activated.",
        );
        throw requestError;
      } finally {
        setActivatingId("");
      }
    },
    [loadAcademicYears],
  );

  const deleteAcademicYear = useCallback(
    async (id) => {
      setDeletingId(id);
      setError("");

      try {
        await AcademicYearService.deleteYear(id);
        await loadAcademicYears();
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The academic year could not be deleted.",
        );
        throw requestError;
      } finally {
        setDeletingId("");
      }
    },
    [loadAcademicYears],
  );

  useEffect(() => {
    loadAcademicYears();
  }, [loadAcademicYears]);

  return {
    academicYears,
    isLoading,
    error,
    activatingId,
    deletingId,
    loadAcademicYears,
    activateAcademicYear,
    deleteAcademicYear,
  };
};
