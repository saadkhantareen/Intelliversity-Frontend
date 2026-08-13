import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseService from '../../api/course.service';
import DepartmentService from '@/features/departments';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // Used to populate prerequisites list
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '', // Stores the department 'code'
    credit_hours: 3,
    description: '',
    prerequisites: [], // Stores an array of course 'code' strings
  });

  useEffect(() => {
    // Load necessary data for dropdowns
    const loadInitialData = async () => {
      try {
        const [depts, courses] = await Promise.all([
          DepartmentService.getDepartments(),
          CourseService.getCourses(),
        ]);
        setDepartments(depts);
        setAllCourses(courses);
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };

    loadInitialData();

    if (id) {
      CourseService.getCourseById(id).then((data) => {
        setFormData(data);
      });
    }
  }, [id]);

  const handlePrereqChange = (e) => {
    // Extract the 'value' (which is the course code) from all selected <option> elements
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, prerequisites: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await CourseService.updateCourse(id, formData);
      } else {
        await CourseService.createCourse(formData);
      }
      navigate('/academics/courses');
    } catch (err) {
      const errorData = err.response?.data;
      alert('Error saving course:\n' + JSON.stringify(errorData, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Course' : 'Create New Course'}
        </h2>
        <p className="text-gray-500 text-sm">Fill in the details to manage the academic catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., CS201"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Data Structures"
              required
            />
          </div>
        </div>

        {/* Dept and Credits Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Credit Hours (1-10)
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.credit_hours}
              min="1"
              max="10"
              onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide a brief overview of the course content..."
          />
        </div>

        {/* Prerequisites Multi-Select */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-800 mb-2">
            Prerequisites
            <span className="text-xs font-normal text-blue-600 ml-2">
              (Hold Ctrl or Cmd to select multiple)
            </span>
          </label>
          <select
            multiple
            className="w-full border border-gray-300 p-2 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
            value={formData.prerequisites}
            onChange={handlePrereqChange}
          >
            {allCourses
              .filter((c) => c.code !== formData.code) // Cannot be its own prerequisite
              .map((c) => (
                <option key={c.id} value={c.code} className="p-1">
                  {c.code} — {c.name}
                </option>
              ))}
          </select>

          {/* Selected Preview Chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.prerequisites.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No prerequisites selected</span>
            ) : (
              formData.prerequisites.map((code) => (
                <span
                  key={code}
                  className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm"
                >
                  {code}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-10 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg transition ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700 active:transform active:scale-95'
            }`}
          >
            {loading ? 'Processing...' : id ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
