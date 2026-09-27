import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EnrollmentService from "../../api/enrollment.service";

const FacultyCourseStudentsPage = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseRecord = location.state?.courseRecord;

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await EnrollmentService.getStudentsByCourseOffering(courseOfferingId);
        if (isMounted) setEnrolledStudents(data.results || data);
      } catch {
        if (isMounted) {
          setError("Failed to load students for this course offering.");
          setEnrolledStudents([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, [courseOfferingId]);

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <button
          onClick={() => navigate("/courses")}
          className="mb-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back to my course assignments
        </button>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Enrolled Students Roster
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {courseRecord?.course_name || "Course"} ({courseRecord?.section_name || "—"})
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Students currently enrolled in this course offering.
        </p>
      </header>

      {error && (
        <p
          className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mb-5 flex justify-end">
        <button
          onClick={() => navigate(`/courses/${courseOfferingId}/assessments`, { state: { courseRecord } })}
          className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Manage Assessments
        </button>
      </div>

      {isLoading ? (
        <div className="grid min-h-[200px] place-content-center px-8 py-8 text-sm text-slate-500" role="status">
          Loading student records...
        </div>
      ) : enrolledStudents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-sm font-bold text-slate-800">No students found.</h3>
          <p className="mt-1 text-xs text-slate-500">
            No students are currently enrolled in this course offering.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Registration ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Batch Name</th>
                <th className="py-3.5 px-4">Section Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {enrolledStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">{student.registration_id}</td>
                  <td className="py-4 px-4 text-slate-600">{student.name}</td>
                  <td className="py-4 px-4 text-slate-600">{student.batch_name}</td>
                  <td className="py-4 px-4 text-slate-600">{student.section_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default FacultyCourseStudentsPage;