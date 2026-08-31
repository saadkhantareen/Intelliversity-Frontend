import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ExaminationService from "../../api/examination.service";

const FacultyStudentMarksPage = () => {
  const { courseOfferingId, studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;
  const courseRecord = location.state?.courseRecord;

  const [assessments, setAssessments] = useState([]);
  const [isAssessmentsLoading, setIsAssessmentsLoading] = useState(true);
  const [marksRows, setMarksRows] = useState({});
  const [isMarksLoading, setIsMarksLoading] = useState(false);
  const [marksError, setMarksError] = useState(null);
  const [savingAssessmentId, setSavingAssessmentId] = useState(null);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState(null);

  const [showNewAssessmentForm, setShowNewAssessmentForm] = useState(false);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [isAssessmentTypesLoading, setIsAssessmentTypesLoading] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    assessment_type: "",
    sequence_number: 1,
    total_marks: "",
    assessment_date: "",
  });
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);

  const loadAssessments = async () => {
    setIsAssessmentsLoading(true);
    try {
      const data = await ExaminationService.getAssessmentsByCourseOffering(courseOfferingId);
      setAssessments(data.results || data);
    } catch {
      setAssessments([]);
      setMarksError("Failed to load assessments for this course.");
    } finally {
      setIsAssessmentsLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseOfferingId]);

  useEffect(() => {
    if (assessments.length === 0) {
      setMarksRows({});
      return;
    }

    const loadMarksForStudent = async () => {
      setIsMarksLoading(true);
      try {
        const rows = {};
        assessments.forEach((a) => {
          rows[a.id] = { id: null, obtained_marks: "", remarks: "" };
        });

        const results = await Promise.all(
          assessments.map((a) =>
            ExaminationService.getStudentAssessments({
              assessment: a.id,
              student: studentId,
            }),
          ),
        );

        results.forEach((res, index) => {
          const list = res.results || res;
          if (list.length > 0) {
            const rec = list[0];
            rows[assessments[index].id] = {
              id: rec.id,
              obtained_marks: rec.obtained_marks ?? "",
              remarks: rec.remarks ?? "",
            };
          }
        });

        setMarksRows(rows);
      } catch {
        setMarksError("Failed to load this student's marks.");
      } finally {
        setIsMarksLoading(false);
      }
    };

    loadMarksForStudent();
  }, [assessments, studentId]);

  const handleRowFieldChange = (assessmentId, field, value) => {
    setMarksRows((prev) => ({
      ...prev,
      [assessmentId]: { ...prev[assessmentId], [field]: value },
    }));
  };

  const handleSaveRow = async (assessment) => {
    const row = marksRows[assessment.id] || { id: null, obtained_marks: "", remarks: "" };
    const obtainedValue = row.obtained_marks === "" ? null : Number(row.obtained_marks);

    setSavingAssessmentId(assessment.id);
    setMarksError(null);

    try {
      let saved;
      if (row.id) {
        saved = await ExaminationService.updateStudentAssessment(row.id, {
          obtained_marks: obtainedValue,
          remarks: row.remarks || "",
        });
      } else {
        saved = await ExaminationService.createStudentAssessment({
          assessment: assessment.id,
          student: studentId,
          obtained_marks: obtainedValue,
          remarks: row.remarks || "",
        });
      }
      setMarksRows((prev) => ({
        ...prev,
        [assessment.id]: {
          id: saved.id,
          obtained_marks: saved.obtained_marks ?? "",
          remarks: saved.remarks ?? "",
        },
      }));
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.obtained_marks?.[0] ||
        err?.response?.data?.student?.[0] ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to save marks.";
      setMarksError(backendMessage);
    } finally {
      setSavingAssessmentId(null);
    }
  };

  const handleDeleteRow = async (assessment) => {
    const row = marksRows[assessment.id];
    if (!row?.id) return;

    const shouldDelete = window.confirm("Delete this student's marks for this assessment?");
    if (!shouldDelete) return;

    setDeletingAssessmentId(assessment.id);
    setMarksError(null);

    try {
      await ExaminationService.deleteStudentAssessment(row.id);
      setMarksRows((prev) => ({
        ...prev,
        [assessment.id]: { id: null, obtained_marks: "", remarks: "" },
      }));
    } catch {
      setMarksError("Failed to delete marks for this assessment.");
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  const openNewAssessmentForm = async () => {
    setShowNewAssessmentForm(true);
    setMarksError(null);
    if (assessmentTypes.length === 0) {
      setIsAssessmentTypesLoading(true);
      try {
        const data = await ExaminationService.getAssessmentTypes({ is_active: true });
        setAssessmentTypes(data.results || data);
      } catch {
        setMarksError("Failed to load assessment types.");
      } finally {
        setIsAssessmentTypesLoading(false);
      }
    }
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.assessment_type) {
      setMarksError("Select an assessment type before creating an assessment.");
      return;
    }

    setIsCreatingAssessment(true);
    setMarksError(null);

    try {
      await ExaminationService.createAssessment({
        course_offering: courseOfferingId,
        assessment_type: newAssessment.assessment_type,
        sequence_number: Number(newAssessment.sequence_number) || 1,
        total_marks: newAssessment.total_marks ? Number(newAssessment.total_marks) : null,
        assessment_date: newAssessment.assessment_date || null,
      });

      await loadAssessments();
      setShowNewAssessmentForm(false);
      setNewAssessment({ assessment_type: "", sequence_number: 1, total_marks: "", assessment_date: "" });
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to create the assessment.";
      setMarksError(backendMessage);
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <header className="mb-6 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back to roster
        </button>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Marks</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {student?.name || "Student"}
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          {student?.registration_id} · {courseRecord?.course_name} ({courseRecord?.section_name})
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {assessments.length === 0 ? "No assessments yet" : `${assessments.length} assessment(s)`}
        </span>
        <button
          onClick={openNewAssessmentForm}
          className="ml-auto text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg px-3 py-1.5 transition-colors"
        >
          + New assessment
        </button>
      </div>

      {showNewAssessmentForm && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Type</label>
            {isAssessmentTypesLoading ? (
              <span className="text-xs text-slate-400">Loading…</span>
            ) : (
              <select
                value={newAssessment.assessment_type}
                onChange={(e) =>
                  setNewAssessment((prev) => ({ ...prev, assessment_type: e.target.value }))
                }
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
              >
                <option value="">Select type</option>
                {assessmentTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Sequence #</label>
            <input
              type="number"
              min="1"
              value={newAssessment.sequence_number}
              onChange={(e) =>
                setNewAssessment((prev) => ({ ...prev, sequence_number: e.target.value }))
              }
              className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Total marks</label>
            <input
              type="number"
              min="1"
              value={newAssessment.total_marks}
              onChange={(e) =>
                setNewAssessment((prev) => ({ ...prev, total_marks: e.target.value }))
              }
              className="w-24 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={newAssessment.assessment_date}
              onChange={(e) =>
                setNewAssessment((prev) => ({ ...prev, assessment_date: e.target.value }))
              }
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
            />
          </div>
          <button
            onClick={handleCreateAssessment}
            disabled={isCreatingAssessment}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {isCreatingAssessment ? "Creating…" : "Create"}
          </button>
          <button
            onClick={() => setShowNewAssessmentForm(false)}
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5"
          >
            Cancel
          </button>
        </div>
      )}

      {marksError && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {marksError}
        </p>
      )}

      {isAssessmentsLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-sm font-bold text-slate-800">No assessments have been created for this course yet.</h3>
          <p className="mt-1 text-xs text-slate-500">Use "+ New assessment" above to create one.</p>
        </div>
      ) : isMarksLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading marks...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Assessment</th>
                <th className="py-3.5 px-4">Marks</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {assessments.map((assessment) => {
                const row = marksRows[assessment.id] || { id: null, obtained_marks: "", remarks: "" };
                const isLocked = assessment.marks_submitted;
                const isSaving = savingAssessmentId === assessment.id;
                const isDeleting = deletingAssessmentId === assessment.id;

                return (
                  <tr key={assessment.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {assessment.title}
                      <div className="text-xs font-normal text-slate-400">
                        Out of {assessment.total_marks ?? "—"}
                        {isLocked && " · finalized"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min="0"
                        max={assessment.total_marks || undefined}
                        value={row.obtained_marks}
                        disabled={isLocked}
                        onChange={(e) => handleRowFieldChange(assessment.id, "obtained_marks", e.target.value)}
                        className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        value={row.remarks}
                        disabled={isLocked}
                        onChange={(e) => handleRowFieldChange(assessment.id, "remarks", e.target.value)}
                        placeholder="Optional"
                        className="w-36 text-sm border border-slate-200 rounded-lg px-2 py-1 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleSaveRow(assessment)}
                        disabled={isLocked || isSaving}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSaving ? "Saving…" : row.id ? "Update" : "Save"}
                      </button>
                      {row.id && (
                        <button
                          onClick={() => handleDeleteRow(assessment)}
                          disabled={isLocked || isDeleting}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default FacultyStudentMarksPage;