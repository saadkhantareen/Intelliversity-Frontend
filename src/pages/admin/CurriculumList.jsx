import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CurriculumService from "../../services/curriculum.service";

const CurriculumList = () => {
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null); // For modal data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    CurriculumService.getCurriculums()
      .then(setCurriculums)
      .catch(console.error);
  }, []);

  const handleViewCourses = async (id) => {
    try {
      // Fetch the full detail which contains the 'courses' array
      const data = await CurriculumService.getCurriculumById(id);
      setSelectedCurriculum(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Curriculums</h1>
        <button
          onClick={() => navigate("/academics/curriculums/create")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow"
        >
          + Create Curriculum
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {curriculums.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
            <p className="text-sm text-blue-600 font-medium mb-4">
              {c.program_name || `Program ID: ${c.program}`}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleViewCourses(c.id)}
                className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold border border-blue-100"
              >
                View Courses
              </button>
              <button
                onClick={() => navigate(`/academics/curriculums/edit/${c.id}`)}
                className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-semibold border border-gray-100"
              >
                Edit Curriculum
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Simple Modal for Viewing Courses --- */}
      {isModalOpen && selectedCurriculum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedCurriculum.name}</h2>
                <p className="text-sm text-gray-500">Course List</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2">Course Code</th>
                    <th className="px-4 py-2">Semester</th>
                    <th className="px-4 py-2">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedCurriculum.courses?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">
                        {item.course}
                      </td>
                      <td className="px-4 py-3">{item.recommended_semester}</td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          {item.course_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!selectedCurriculum.courses ||
                    selectedCurriculum.courses.length === 0) && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-10 text-center text-gray-400 italic"
                      >
                        No courses added to this curriculum.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-white border rounded-lg font-bold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumList;
