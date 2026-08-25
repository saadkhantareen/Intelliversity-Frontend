import { useCallback, useEffect, useState } from "react";
import AcademicYearService from "../api/academic-year.service";

const INITIAL_VALUES = {
  name: "",
  start_date: "",
  end_date: "",
};

export const useAcademicYear = (academicYearId) => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [isLoading, setIsLoading] = useState(Boolean(academicYearId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!academicYearId) return;

    let isMounted = true;

    const loadAcademicYear = async () => {
      setIsLoading(true);
      setError("");

      try {
        const academicYear =
          await AcademicYearService.getYearById(academicYearId);

        if (isMounted) {
          setValues({
            name: academicYear.name ?? "",
            start_date: academicYear.start_date ?? "",
            end_date: academicYear.end_date ?? "",
          });
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ??
              "The academic year could not be loaded.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAcademicYear();

    return () => {
      isMounted = false;
    };
  }, [academicYearId]);

  const saveAcademicYear = useCallback(
    async (data) => {
      setIsSaving(true);
      setError("");

      try {
        if (academicYearId) {
          return await AcademicYearService.updateYear(academicYearId, data);
        }

        return await AcademicYearService.createYear(data);
      } catch (requestError) {
        const message =
          requestError.response?.data?.detail ??
          "The academic year could not be saved.";
        setError(message);
        throw requestError;
      } finally {
        setIsSaving(false);
      }
    },
    [academicYearId],
  );

  return {
    values,
    setValues,
    isLoading,
    isSaving,
    error,
    setError,
    saveAcademicYear,
  };
};
