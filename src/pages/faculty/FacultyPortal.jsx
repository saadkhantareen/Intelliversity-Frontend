import React, { useEffect, useState } from 'react';
import EnrollmentService from '../../services/enrollment.service';

export default function FacultyPortal() {
  const [myLoads, setMyLoads] = useState([]);
  const [availableToTeach, setAvailableToTeach] = useState([]);

  useEffect(() => {
    EnrollmentService.getFacultyAssignments().then(setMyLoads);
    EnrollmentService.getFacultyEnrollmentCourses().then(setAvailableToTeach);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Faculty Dashboard</h1>

      <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Current Teaching Load</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {myLoads.map(load => (
          <div key={load.id} className="bg-white border-l-4 border-blue-600 p-5 rounded-r-xl shadow-sm">
            <h3 className="font-bold text-xl">{load.course}</h3>
            <p className="text-gray-500 text-sm">Section ID: {load.section}</p>
            <p className="text-xs mt-4 text-blue-500 font-medium">Term: {load.term}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4 text-gray-700">Courses You Can Be Assigned To</h2>
      <div className="flex flex-wrap gap-3">
        {availableToTeach.map(c => (
          <span key={c.course_id} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm border">
            {c.course_code}: {c.course_name}
          </span>
        ))}
      </div>
    </div>
  );
}