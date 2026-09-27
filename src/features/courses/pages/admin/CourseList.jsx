import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseService from '../../api/course.service';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    CourseService.getCourses().then(setCourses).catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this course?')) {
      await CourseService.deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <button
          onClick={() => navigate('/academics/courses/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          + Add Course
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Name</th>
              <th className="p-4">Dept</th>
              <th className="p-4">Credits</th>
              <th className="p-4">Prerequisites</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{c.code}</td>
                <td className="p-4">{c.name}</td>
                <td className="p-4 text-gray-500">{c.department}</td>
                <td className="p-4 text-center">{c.credit_hours}</td>
                <td className="p-4">
                  {c.prerequisites?.map((p) => (
                    <span key={p} className="bg-gray-100 text-xs px-2 py-1 rounded mr-1">
                      {p}
                    </span>
                  ))}
                </td>
                <td className="p-4 text-right space-x-3">
                  <button
                    onClick={() => navigate(`/academics/courses/edit/${c.id}`)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseList;
