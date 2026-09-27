import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ExaminationService from "../../api/examination.service";

const FacultyCourseAssessmentsPage = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseRecord = location.state?.courseRecord;

  const [assessments, setAssessments] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState(null);

  const loadAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [assessmentsData, typesData] = await Promise.all([
        ExaminationService.getAssessmentsByCourseOffering(courseOfferingId),
        ExaminationService.getAssessmentTypes(),
      ]);
      setAssessments(assessmentsData.results || assessmentsData);
      setAssessmentTypes(typesData.results || typesData);
    } catch {
      setError("Failed to load assessments for this course.");
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssessment = async (assessment) => {
    const shouldDelete = window.confirm(
      `Delete "${assessment.title}"? This will permanently remove it and any marks entered so far.`,
    );
    if (!shouldDelete) return;

    setDeletingAssessmentId(assessment.id);
    setError(null);

    try {
      await ExaminationService.deleteAssessment(assessment.id);
      setAssessments((prev) => prev.filter((a) => a.id !== assessment.id));
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail || "Failed to delete the assessment.";
      setError(backendMessage);
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  useEffect(() => {
    loadAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseOfferingId]);

  // Build id -> name map for assessment types
  const typeNameById = useMemo(() => {
    const map = {};
    assessmentTypes.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [assessmentTypes]);

  // Group assessments by their assessment_type, preserving a stable, sensible order:
  // known types in the order admin created them, sorted by sequence_number within each group.
  const groupedAssessments = useMemo(() => {
    const groups = {};

    assessments.forEach((assessment) => {
      const typeId = assessment.assessment_type;
      if (!groups[typeId]) {
        groups[typeId] = {
          typeId,
          typeName: typeNameById[typeId] || "Other",
          items: [],
        };
      }
      groups[typeId].items.push(assessment);
    });

    // Sort items within each group by sequence_number
    Object.values(groups).forEach((group) => {
      group.items.sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
    });

    // Sort groups alphabetically by type name for a stable display order
    return Object.values(groups).sort((a, b) => a.typeName.localeCompare(b.typeName));
  }, [assessments, typeNameById]);

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <button
          onClick={() => navigate(`/courses/${courseOfferingId}/students`, { state: { courseRecord } })}
          className="mb-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back to roster
        </button>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Assessments
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {courseRecord?.course_name || "Course"} ({courseRecord?.section_name || "—"})
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Create quizzes, midterms and finals, then enter marks for all students at once.
        </p>
      </header>

      <div className="mb-5 flex justify-end">
        <button
          onClick={() =>
            navigate(`/courses/${courseOfferingId}/assessments/new`, { state: { courseRecord } })
          }
          className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          + New Assessment
        </button>
      </div>

      {error && (
        <p className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-sm font-bold text-slate-800">No assessments yet.</h3>
          <p className="mt-1 text-xs text-slate-500">
            Use "+ New Assessment" to create your first quiz, midterm or final for this course.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {groupedAssessments.map((group) => (
            <div key={group.typeId}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                {group.typeName}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({group.items.length})
                </span>
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Assessment</th>
                      <th className="py-3.5 px-4">Total Marks</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {group.items.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">{assessment.title}</td>
                        <td className="py-4 px-4 text-slate-600">{assessment.total_marks ?? "—"}</td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/courses/${courseOfferingId}/assessments/${assessment.id}/grades`, {
                                state: { courseRecord, assessment },
                              })
                            }
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg transition-colors"
                          >
                            Enter Marks
                          </button>
                          <button
                            onClick={() => handleDeleteAssessment(assessment)}
                            disabled={deletingAssessmentId === assessment.id}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingAssessmentId === assessment.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FacultyCourseAssessmentsPage;