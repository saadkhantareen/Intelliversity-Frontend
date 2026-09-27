import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExaminationService from '../../../examination/api/examination.service';

const StudentMarksPage = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setIsLoading(true);
        const data = await ExaminationService.getStudentAssessments({
          course_offering: courseOfferingId,
        });
        setAssessments(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError('Failed to load your course marks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseOfferingId) {
      fetchMarks();
    }
  }, [courseOfferingId]);

  // Assessments ko assessment_type ke mutabiq group karna
  const groupedAssessments = assessments.reduce((acc, item) => {
    const typeName = (item.assessment_type || 'Other Assessments').toUpperCase();
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(item);
    return acc;
  }, {});

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Back to courses
        </button>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Student Portal
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Course Assessment Marks
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Review all the assessment scores and marks assigned by your faculty for this course.
        </p>
      </header>

      {error && (
        <p className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="grid min-h-[240px] place-content-center px-8 py-8 text-sm text-slate-500" role="status">
          Loading your marks…
        </div>
      ) : assessments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No assessment marks published for this course yet.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedAssessments).map(([typeName, items]) => (
            <div key={typeName} className="space-y-4">
              {/* Section Header with Count */}
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                {typeName} <span className="ml-1 text-slate-400">({items.length})</span>
              </h2>

              {/* Table for this group */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Assessment</th>
                      <th className="px-6 py-3">Total Marks</th>
                      <th className="px-6 py-3">Obtained Marks</th>
                      <th className="px-6 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {item.assessment_title || item.assessment?.title || 'Assessment'}
                        </td>
                        <td className="px-6 py-4">{item.total_marks || item.assessment?.total_marks || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {item.obtained_marks !== null && item.obtained_marks !== undefined ? item.obtained_marks : 'Not Graded'}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{item.remarks || '-'}</td>
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

export default StudentMarksPage;