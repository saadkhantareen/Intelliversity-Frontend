import { useCallback, useEffect, useState } from "react";
import TermService from "../api/term.service";
import { useSearchParams } from "react-router-dom";

export const useTerms = () => {
  const [searchParams] = useSearchParams();
  const academicYearId = searchParams.get("academicYear");
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activatingId, setActivatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadTerms = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await TermService.getTerms(academicYearId);
      setTerms(Array.isArray(response) ? response : (response.results ?? []));
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ?? "Terms could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [academicYearId]);

  const activateTerm = useCallback(
    async (id) => {
      setActivatingId(id);
      setError("");

      try {
        await TermService.activateTerm(id);
        await loadTerms();
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The term could not be activated.",
        );
        throw requestError;
      } finally {
        setActivatingId("");
      }
    },
    [loadTerms],
  );

  const deleteTerm = useCallback(
    async (id) => {
      setDeletingId(id);
      setError("");

      try {
        await TermService.deleteTerm(id);
        await loadTerms();
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ??
            "The term could not be deleted.",
        );
        throw requestError;
      } finally {
        setDeletingId("");
      }
    },
    [loadTerms],
  );

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  return {
    terms,
    isLoading,
    error,
    activatingId,
    deletingId,
    loadTerms,
    activateTerm,
    deleteTerm,
  };
};
