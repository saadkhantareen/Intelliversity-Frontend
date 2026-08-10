import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepartmentService from '../../services/department.service';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await DepartmentService.deleteDepartment(id);
        setDepartments(departments.filter((d) => d.id !== id));
      } catch (error) {
        alert('Failed to delete. It might have linked programs.');
      }
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button
          onClick={() => navigate('/academics/departments/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          + Add Department
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold text-gray-700">Code</th>
              <th className="p-4 font-semibold text-gray-700">Name</th>
              <th className="p-4 font-semibold text-gray-700">Description</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-blue-600 font-bold">{dept.code}</td>
                <td className="p-4">{dept.name}</td>
                <td className="p-4 text-gray-500 truncate max-w-xs">{dept.description}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/academics/departments/edit/${dept.id}`)}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-600 hover:underline"
                  >
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

export default DepartmentList;
