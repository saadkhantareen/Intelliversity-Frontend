import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DepartmentService from '../../services/department.service';

const DepartmentForm = () => {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    if (id) {
      loadDepartment();
    }
  }, [id]);

  const loadDepartment = async () => {
    try {
      const data = await DepartmentService.getDepartmentById(id);
      setFormData(data);
    } catch (error) {
      console.error('Error loading department:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await DepartmentService.updateDepartment(id, formData);
      } else {
        await DepartmentService.createDepartment(formData);
      }
      navigate('/academics/departments');
    } catch (error) {
      alert('Error: ' + JSON.stringify(error.response?.data));
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-6">{id ? 'Edit' : 'Create'} Department</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department Name</label>
          <input
            type="text"
            className="mt-1 block w-full border rounded-md p-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Code</label>
          <input
            type="text"
            className="mt-1 block w-full border rounded-md p-2"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. CS"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 block w-full border rounded-md p-2"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-gray-600">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            {id ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
