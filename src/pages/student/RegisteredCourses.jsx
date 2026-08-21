import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/services/course.service';

/**
 * AttendanceBar Component
 * Renders the green/red progress bar seen in the screenshot.
 */
const AttendanceBar = ({ value }) => (
  <div className="relative w-24 h-6 bg-red-500 rounded overflow-hidden border border-gray-400">
    <div
      className="h-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold"
      style={{ width: `${value}%` }}
    >
      {value}%
    </div>
  </div>
);

export default function RegisteredCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    courseService
      .getRegisteredCourses()
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading courses...</div>;
  }

  return (
    <div className="p-4 animate-fadeIn">
      {/* Header Bar matching image_ef0e6f.png */}
      <div className="bg-[#00a191] text-white text-center py-2 font-bold text-xl rounded-t-md shadow-md">
        Registered Courses List
      </div>

      <div className="overflow-x-auto shadow-lg rounded-b-md">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-[#1e1b4b] text-white uppercase tracking-wider">
              <th className="p-3 border border-gray-700">Course No</th>
              <th className="p-3 border border-gray-700">Course Name</th>
              <th className="p-3 border border-gray-700 text-center">Credits</th>
              <th className="p-3 border border-gray-700">Teacher</th>
              <th className="p-3 border border-gray-700">Class</th>
              <th className="p-3 border border-gray-700 text-center">Attendance Summary</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr
                  key={course.course_no}
                  // Navigates to the detail page (e.g., /courses/CSE357)
                  onClick={() => navigate(`/courses/${course.course_no}/notifications`)}
                  className="border-b hover:bg-teal-50 cursor-pointer transition-colors group"
                >
                  <td className="p-3 border border-gray-200 font-bold text-gray-600">
                    {course.course_no}
                  </td>
                  <td className="p-3 border border-gray-200 font-bold group-hover:text-[#00a191]">
                    {course.course_name}
                  </td>
                  <td className="p-3 border border-gray-200 text-center font-bold">
                    {course.credits}
                  </td>
                  <td className="p-3 border border-gray-200 font-semibold text-gray-700">
                    {course.teacher}
                  </td>
                  <td className="p-3 border border-gray-200 text-[11px] text-gray-500 font-bold">
                    {course.class_name}
                  </td>
                  <td className="p-3 border border-gray-200">
                    <div className="flex gap-2 justify-center">
                      {course.attendance && course.attendance.length > 0 ? (
                        course.attendance.map((val, idx) => <AttendanceBar key={idx} value={val} />)
                      ) : (
                        <span className="text-gray-400 italic text-xs">No Attendance</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400">
                  No courses registered for this semester.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
