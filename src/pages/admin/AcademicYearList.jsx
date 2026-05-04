import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicYearService from '../../services/academic-year.service';

const AcademicYearList = () => {
  const [years, setYears] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = () => {
    AcademicYearService.getYears()
      .then(setYears)
      .catch(err => console.error("Failed to load academic years", err));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this academic year? This will also delete all associated terms.")) {
      try {
        await AcademicYearService.deleteYear(id);
        // Refresh the list after deletion
        setYears(years.filter(year => year.id !== id));
      } catch (err) {
        alert("Failed to delete. It might be linked to other records.");
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Academic Years</h1>
          <p className="text-gray-500 text-sm">Define your university cycles and semesters</p>
        </div>
        <button 
          onClick={() => navigate('/academics/academic-years/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all"
        >
          + Add Academic Year
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Year Name</th>
              <th className="px-6 py-4 font-bold">Duration</th>
              <th className="px-6 py-4 font-bold text-center">Terms</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {years.map((year) => (
              <tr key={year.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{year.name}</div>
                  <div className="text-xs text-gray-400">ID: {year.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {year.start_date} <span className="text-gray-300">→</span> {year.end_date}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                    {year.terms?.length || 0} Terms
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {year.is_active ? (
                    <span className="text-green-600 bg-green-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">Active</span>
                  ) : (
                    <span className="text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => navigate(`/academics/academic-years/edit/${year.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 font-bold text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(year.id)}
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
        
        {years.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">
            No academic years defined yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicYearList;