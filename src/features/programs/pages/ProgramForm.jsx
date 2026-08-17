import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProgramService from '../api/program.service';
import { DepartmentService } from '@/features/departments';
import { toast } from 'react-hot-toast';

const ProgramForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: '', // This will now store the 'code' string
    name: '',
    code: '',
    degree_level: 'UG',
    total_fee: '',
    total_credit_hours_required: '',
    number_of_semesters: '',
    annual_intake_capacity: '',
  });

  useEffect(() => {
    // 1. Fetch departments to populate the dropdown
    DepartmentService.getDepartments()
      .then(setDepartments)
      .catch((err) => console.error('Failed to load departments', err));

    // 2. If editing, fetch existing program data
    if (id) {
      ProgramService.getProgramById(id)
        .then(setFormData)
        .catch((err) => console.error('Failed to load program', err));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await ProgramService.updateProgram(id, formData);
      } else {
        await ProgramService.createProgram(formData);
      }
      navigate('/academics/programs');
    } catch (err) {
      // Improved error handling to show EXACTLY what the backend rejected
      const errorData = err.response?.data;
      if (errorData) {
        const messages = Object.entries(errorData)
          .map(([field, m]) => `${field}: ${m}`)
          .join('\n');

        toast.error(`Validation Error:\n${messages}`, { autoClose: 7000 });
      } else {
        toast.error('An unexpected error occurred while saving.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {id ? 'Edit' : 'Create'} Degree Program
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Department Selection - Sending 'code' to match SlugRelatedField */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
          <select
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          >
            <option value="">Select Department (By Code)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Program Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Software Engineering"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Program Code</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. BSSE"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Degree Level</label>
          <select
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.degree_level}
            onChange={(e) => setFormData({ ...formData, degree_level: e.target.value })}
          >
            <option value="UG">Undergraduate</option>
            <option value="PG">Postgraduate</option>
            <option value="PHD">Doctorate</option>
            <option value="DIP">Diploma</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Total Fee (PKR)</label>
          <input
            type="number"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.total_fee}
            onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Required Credit Hours
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.total_credit_hours_required}
            onChange={(e) =>
              setFormData({ ...formData, total_credit_hours_required: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">No. of Semesters</label>
          <input
            type="number"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.number_of_semesters}
            onChange={(e) => setFormData({ ...formData, number_of_semesters: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Annual Intake Capacity
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.annual_intake_capacity}
            onChange={(e) => setFormData({ ...formData, annual_intake_capacity: e.target.value })}
            required
          />
        </div>

        <div className="col-span-2 flex justify-end gap-3 mt-6 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {loading ? 'Saving...' : 'Save Program'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgramForm;
