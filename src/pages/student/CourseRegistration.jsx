import React, { useEffect, useState } from 'react';
import EnrollmentService from '../../services/enrollment.service';
import toast from 'react-hot-toast';

const CourseRegistration = () => {
  const [offered, setOffered] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [available, enrolled] = await Promise.all([
        EnrollmentService.getStudentOfferedCourses(),
        EnrollmentService.getMyEnrollments()
      ]);
      setOffered(available);
      setMyCourses(enrolled);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (code) => {
    try {
      await EnrollmentService.enrollInCourse(code);
      toast.success(`Enrolled in ${code}`);
      fetchData(); // Refresh lists
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || "Enrollment failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Curriculum...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Course Registration</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Available Courses */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-bold mb-4 text-blue-600">Offered this Semester</h2>
          <div className="space-y-4">
            {offered.map(item => (
              <div key={item.course_id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-bold">{item.course_code}: {item.course_name}</p>
                  <p className="text-xs text-gray-500">Cr.Hrs: {item.credit_hours} | Sem: {item.recommended_semester}</p>
                </div>
                <button 
                  onClick={() => handleEnroll(item.course_code)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Currently Enrolled */}
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed">
          <h2 className="text-lg font-bold mb-4 text-green-600">My Enrollments</h2>
          {myCourses.length === 0 && <p className="text-gray-400">No courses selected yet.</p>}
          <div className="space-y-3">
            {myCourses.map(enr => (
              <div key={enr.id} className="bg-white p-3 shadow-sm rounded flex justify-between">
                <span>{enr.course}</span>
                <button onClick={() => EnrollmentService.dropCourse(enr.id).then(fetchData)} className="text-red-500 text-xs uppercase font-bold">Drop</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;