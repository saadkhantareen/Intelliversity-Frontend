import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgramService from '../../services/program.service';

const ProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await ProgramService.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    // Confirmation dialog before deleting
    if (window.confirm(`Are you sure you want to delete the program: "${name}"?`)) {
      try {
        await ProgramService.deleteProgram(id);
        // Update local state to remove the deleted program from the UI
        setPrograms(programs.filter(p => p.id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete program. It may have linked data (like courses or enrollments).");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 text-lg">Loading programs...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Degree Programs</h1>
          <p className="text-sm text-gray-500">Manage academic programs across all departments</p>
        </div>
        <button 
          onClick={() => navigate('/academics/programs/create')}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition font-semibold"
        >
          + Add Program
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">Code</th>
              <th className="p-4 font-semibold text-gray-700">Program Name</th>
              <th className="p-4 font-semibold text-gray-700">Department</th>
              <th className="p-4 font-semibold text-gray-700">Level</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">No programs found.</td>
              </tr>
            ) : (
              programs.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-mono font-bold text-blue-700">{p.code}</td>
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.department_name || p.department}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">
                      {p.degree_level}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button 
                      onClick={() => navigate(`/academics/programs/edit/${p.id}`)} 
                      className="text-indigo-600 hover:text-indigo-900 font-medium transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id, p.name)} 
                      className="text-red-500 hover:text-red-700 font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramList;