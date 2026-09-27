import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ExaminationService from "../../api/examination.service";
import EnrollmentService from "@/features/enrollments/api/enrollment.service";

const extractErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    for (const item of data) {
      const msg = extractErrorMessage(item, null);
      if (msg) return msg;
    }
    return fallback;
  }

  if (typeof data === "object") {
    if (data.detail) return extractErrorMessage(data.detail, fallback);

    for (const key of Object.keys(data)) {
      const msg = extractErrorMessage(data[key], null);
      if (msg) return `${key}: ${msg}`;
    }
    return fallback;
  }

  return fallback;
};

const FacultyBulkGradeEntryPage = () => {
  const { courseOfferingId, assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseRecord = location.state?.courseRecord;
  const passedAssessment = location.state?.assessment;

  const [assessment, setAssessment] = useState(passedAssessment || null);
  const [totalMarks, setTotalMarks] = useState(passedAssessment?.total_marks ?? "");
  const [rows, setRows] = useState([]); // { studentAssessmentId, student_id, registration_id, name, obtained_marks, remarks }
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studentsData, gradebookData] = await Promise.all([
        EnrollmentService.getStudentsByCourseOffering(courseOfferingId),
        ExaminationService.getGradebook(assessmentId),
      ]);

      const students = studentsData.results || studentsData;
      const existingByStudentId = {};
      (gradebookData.students || []).forEach((rec) => {
        existingByStudentId[rec.student] = rec;
      });

      const builtRows = students.map((s) => {
        const existing = existingByStudentId[s.id];
        return {
          studentAssessmentId: existing?.id ?? null,
          student_id: s.id,
          registration_id: s.registration_id,
          name: s.name,
          obtained_marks: existing?.obtained_marks ?? "",
          remarks: existing?.remarks ?? "",
        };
      });

      setRows(builtRows);
      setAssessment((prev) => prev || {
        id: gradebookData.assessment_id,
        title: gradebookData.assessment_title,
        total_marks: gradebookData.total_marks,
      });
      setTotalMarks((prev) => (prev !== "" ? prev : gradebookData.total_marks ?? ""));
    } catch {
      setError("Failed to load students or existing marks for this assessment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseOfferingId, assessmentId]);

  const handleRowChange = (studentId, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.student_id === studentId ? { ...row, [field]: value } : row)),
    );
  };

  // Save marks for a single student only
  const handleSaveSingleRow = async (row) => {
    if (!totalMarks || Number(totalMarks) <= 0) {
      setError("Please set the assessment's total marks before saving individual marks.");
      return;
    }

    const obtainedValue = row.obtained_marks === "" ? null : Number(row.obtained_marks);

    if (obtainedValue !== null && obtainedValue > Number(totalMarks)) {
      setError(`${row.name}'s marks exceed the total marks (${totalMarks}).`);
      return;
    }

    setSavingStudentId(row.student_id);
    setError(null);
    setSuccessMessage(null);

    try {
      let saved;
      if (row.studentAssessmentId) {
        saved = await ExaminationService.updateStudentAssessment(row.studentAssessmentId, {
          obtained_marks: obtainedValue,
          remarks: row.remarks || "",
        });
      } else {
        saved = await ExaminationService.createStudentAssessment({
          assessment: assessmentId,
          student: row.student_id,
          obtained_marks: obtainedValue,
          remarks: row.remarks || "",
        });
      }

      setRows((prev) =>
        prev.map((r) =>
          r.student_id === row.student_id
            ? {
                ...r,
                studentAssessmentId: saved.id,
                obtained_marks: saved.obtained_marks ?? "",
                remarks: saved.remarks ?? "",
              }
            : r,
        ),
      );
      setSuccessMessage(`Marks saved for ${row.name}.`);
    } catch (err) {
      const backendMessage = extractErrorMessage(err?.response?.data, "Failed to save marks for this student.");
      setError(backendMessage);
    } finally {
      setSavingStudentId(null);
    }
  };

  // Save marks for every student at once (bulk)
  const handleSaveAll = async () => {
    if (!totalMarks || Number(totalMarks) <= 0) {
      setError("Please enter a valid total marks value before saving.");
      return;
    }

    const overLimit = rows.find(
      (r) => r.obtained_marks !== "" && Number(r.obtained_marks) > Number(totalMarks),
    );
    if (overLimit) {
      setError(`${overLimit.name}'s marks exceed the total marks (${totalMarks}).`);
      return;
    }

    setIsSavingAll(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        total_marks: Number(totalMarks),
        marks_submitted: false,
        students_marks: rows.map((r) => ({
          student_id: r.student_id,
          obtained_marks: r.obtained_marks === "" ? null : Number(r.obtained_marks),
          remarks: r.remarks || "",
        })),
      };

      await ExaminationService.bulkGrade(assessmentId, payload);
      setAssessment((prev) => ({ ...prev, total_marks: Number(totalMarks) }));
      setSuccessMessage("Marks saved for all students.");
      // Refresh so studentAssessmentId values are correct for any newly-created rows
      await loadData();
    } catch (err) {
      const backendMessage = extractErrorMessage(err?.response?.data, "Failed to save marks.");
      setError(backendMessage);
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <header className="mb-6 max-w-2xl">
        <button
          onClick={() => navigate(`/courses/${courseOfferingId}/assessments`, { state: { courseRecord } })}
          className="mb-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back to assessments
        </button>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Enter Marks
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {assessment?.title || "Assessment"}
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          {courseRecord?.course_name} ({courseRecord?.section_name})
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Marks</label>
        <input
          type="number"
          min="1"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
          className="w-24 text-sm border border-slate-200 rounded-lg px-3 py-1.5"
        />
        <span className="text-xs text-slate-400">
          Applies to every student below. Save an individual row, or use "Save All" to update everyone at once.
        </span>
      </div>

      {error && (
        <p className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800" role="alert">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mb-5 border-l-[3px] border-emerald-700 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-800" role="status">
          {successMessage}
        </p>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading students...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-sm font-bold text-slate-800">No students found.</h3>
          <p className="mt-1 text-xs text-slate-500">No students are enrolled in this course offering.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Registration ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Marks {totalMarks ? `(out of ${totalMarks})` : ""}</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.map((row) => (
                <tr key={row.student_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.registration_id}</td>
                  <td className="py-3 px-4 text-slate-700">{row.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      max={totalMarks || undefined}
                      value={row.obtained_marks}
                      onChange={(e) => handleRowChange(row.student_id, "obtained_marks", e.target.value)}
                      className="w-24 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => handleRowChange(row.student_id, "remarks", e.target.value)}
                      placeholder="Optional"
                      className="w-48 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSaveSingleRow(row)}
                      disabled={savingStudentId === row.student_id}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingStudentId === row.student_id
                        ? "Saving…"
                        : row.studentAssessmentId
                        ? "Update"
                        : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSavingAll ? "Saving…" : "Save All"}
          </button>
        </div>
      )}
    </section>
  );
};

export default FacultyBulkGradeEntryPage;