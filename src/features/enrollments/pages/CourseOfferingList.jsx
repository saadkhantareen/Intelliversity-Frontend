import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseOfferingService from '../api/course-offering.service';

const CourseOfferingList = () => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const res = await CourseOfferingService.getOfferings();
      const data = Array.isArray(res) ? res : res?.results || res?.data || [];
      setOfferings(data);
    } catch (err) {
      console.error('Failed to load offerings:', err);
    } finally {
      setLoading(false);
    }
  };

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
      loadOfferings();
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
    if (window.confirm('Are you sure you want to delete this course offering?')) {
      try {
        await CourseOfferingService.deleteOffering(id);
        setOfferings(offerings.filter((o) => o.id !== id));
      } catch (err) {
        alert('Failed to delete course offering.');
        console.error(err);
      }
    }
  };

  const renderName = (field) => {
    if (!field) return '-';
    if (typeof field === 'object') return field.name || field.title || field.id;
    return field;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Course Offerings</h1>
          <p className="text-gray-500 text-sm">
            Manage section-level course offerings and auto-generation
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : '⚡ Auto-Generate Offerings'}
          </button>
          <button
            onClick={() => navigate('/enrollments/course-offerings/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all"
          >
            + Create Offering
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Curriculum Course</th>
              <th className="px-6 py-4 font-bold">Term</th>
              <th className="px-6 py-4 font-bold">Section</th>
              <th className="px-6 py-4 font-bold text-center">Capacity</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offerings.map((o) => (
              <tr key={o.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">
                  {renderName(o.curriculum_course)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{renderName(o.term)}</td>
                <td className="px-6 py-4 text-sm text-indigo-600 font-medium">
                  {renderName(o.section)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">
                    {o.capacity} Seats
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-3">
                    <button
                      onClick={() => navigate(`/enrollments/course-offerings/edit/${o.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 font-bold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="text-red-500 hover:text-red-700 font-bold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="p-10 text-center text-gray-400 font-medium">Loading offerings...</div>}
        {!loading && offerings.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">No course offerings found.</div>
        )}
      </div>
    </div>
  );
};

export default CourseOfferingList;