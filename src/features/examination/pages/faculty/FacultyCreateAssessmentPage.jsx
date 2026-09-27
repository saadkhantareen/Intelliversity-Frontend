import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ExaminationService from "../../api/examination.service";

const FacultyCreateAssessmentPage = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseRecord = location.state?.courseRecord;

  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [isTypesLoading, setIsTypesLoading] = useState(true);
  const [form, setForm] = useState({
    assessment_type: "",
    sequence_number: 1,
    total_marks: "",
    assessment_date: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTypes = async () => {
      setIsTypesLoading(true);
      try {
        const data = await ExaminationService.getAssessmentTypes({ is_active: true });
        setAssessmentTypes(data.results || data);
      } catch {
        setError("Failed to load assessment types.");
      } finally {
        setIsTypesLoading(false);
      }
    };
    loadTypes();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.assessment_type) {
      setError("Please select an assessment type.");
      return;
    }
    if (!form.total_marks || Number(form.total_marks) <= 0) {
      setError("Please enter a valid total marks value.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const created = await ExaminationService.createAssessment({
        course_offering: courseOfferingId,
        assessment_type: form.assessment_type,
        sequence_number: Number(form.sequence_number) || 1,
        total_marks: Number(form.total_marks),
        assessment_date: form.assessment_date || null,
      });

      // Straight into bulk marks entry for all students
      navigate(`/courses/${courseOfferingId}/assessments/${created.id}/grades`, {
        state: { courseRecord, assessment: created },
      });
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to create the assessment.";
      setError(backendMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <button
          onClick={() => navigate(`/courses/${courseOfferingId}/assessments`, { state: { courseRecord } })}
          className="mb-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back to assessments
        </button>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          New Assessment
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {courseRecord?.course_name || "Course"} ({courseRecord?.section_name || "—"})
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Set up a quiz, midterm or final. After creating, you'll enter marks for every enrolled student.
        </p>
      </header>

      {error && (
        <p className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Assessment Type</label>
          {isTypesLoading ? (
            <span className="text-sm text-slate-400">Loading types…</span>
          ) : (
            <select
              value={form.assessment_type}
              onChange={(e) => handleChange("assessment_type", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="">Select type (Quiz, Midterm, Final...)</option>
              {assessmentTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Sequence Number</label>
            <input
              type="number"
              min="1"
              value={form.sequence_number}
              onChange={(e) => handleChange("sequence_number", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
            />
            <p className="mt-1 text-[11px] text-slate-400">e.g. Quiz 1 → 1, Quiz 2 → 2</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Total Marks</label>
            <input
              type="number"
              min="1"
              value={form.total_marks}
              onChange={(e) => handleChange("total_marks", e.target.value)}
              placeholder="e.g. 10"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Date (optional)</label>
          <input
            type="date"
            value={form.assessment_date}
            onChange={(e) => handleChange("assessment_date", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => navigate(`/courses/${courseOfferingId}/assessments`, { state: { courseRecord } })}
            className="px-5 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {isCreating ? "Creating…" : "Create & Continue"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FacultyCreateAssessmentPage;