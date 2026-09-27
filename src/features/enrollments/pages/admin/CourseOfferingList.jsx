import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CourseOfferingTable from '../../components/CourseOfferingTable';
import { useCourseOfferings } from '../../hooks/useCourseOfferings';
import CourseOfferingService from '../../api/course-offering.service';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseOfferingList = () => {
  const { courseOfferings, isLoading, error, deletingId, loadCourseOfferings, deleteCourseOffering } =
    useCourseOfferings();
  
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const handleAutoGenerate = async () => {
    if (
      !window.confirm(
        'Are you sure you want to auto-generate course offerings across all active batches?'
      )
    )
      return;

    try {
      setGenerating(true);
      await CourseOfferingService.autoGenerateOfferings();
      alert('Course offerings auto-generated successfully!');
      await loadCourseOfferings();
    } catch (err) {
      console.error('Failed to auto-generate offerings:', err);
      alert(
        'Auto-generation failed: ' +
          JSON.stringify(err.response?.data || 'Server Error')
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm(
      'Delete this course offering? This action cannot be undone.'
    );
    if (!shouldDelete) return;

    try {
      await deleteCourseOffering(id);
      toast.success('Course offering deleted successfully.');
    } catch {
      // The hook exposes the request error in the page-level alert.
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="course-offerings-title"
    >
      <header className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            Academic setup
          </p>
          <h1
            id="course-offerings-title"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Course offerings
          </h1>
          <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-6 text-slate-500">
            Assign courses to a term, batch, section, and faculty member for delivery.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-2.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : '⚡ Auto-Generate Offerings'}
          </button>
          <button
            onClick={() => navigate('/enrollments/course-offerings/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-2.5 rounded-xl font-bold shadow-md transition-all"
          >
            + Create Offering
          </button>
        </div>
      </header>

      {error && (
        <p
          className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <div
            className="grid min-h-[180px] place-content-center px-8 py-8 text-sm text-slate-500"
            role="status"
          >
            Loading course offerings…
          </div>
        ) : (
          <CourseOfferingTable
            courseOfferings={courseOfferings}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
};

export default CourseOfferingList;
