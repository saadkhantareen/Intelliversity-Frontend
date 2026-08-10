import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TermService from '../../services/term.service';
import AcademicYearService from '../../services/academic-year.service';

const TermForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    start_date: '',
    end_date: '',
    course_registration_start_date: '',
    course_registration_end_date: '',
    course_drop_deadline: '',
    fee_deadline: '',
    term_type: 'Regular',
    is_active: false,
  });

  useEffect(() => {
    // Load academic years for the dropdown
    AcademicYearService.getYears().then(setAcademicYears);

    if (id) {
      TermService.getTermById(id).then((data) => {
        setFormData({
          ...data,
          academic_year: data.academic_year?.id || data.academic_year,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) await TermService.updateTerm(id, formData);
      else await TermService.createTerm(formData);
      navigate('/academics/terms');
    } catch (err) {
      alert('Error: ' + JSON.stringify(err.response?.data || 'Server Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
        {id ? 'Edit Term' : 'Create New Term'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Parent Academic Year
            </label>
            <select
              className="w-full border p-2.5 rounded-lg mt-1 bg-gray-50"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Term Name</label>
            <input
              type="text"
              className="w-full border p-2.5 rounded-lg mt-1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Fall 2024"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600">Term Type</label>
            <select
              className="w-full border p-2.5 rounded-lg mt-1"
              value={formData.term_type}
              onChange={(e) => setFormData({ ...formData, term_type: e.target.value })}
            >
              <option value="Regular">Regular</option>
              <option value="Short">Short</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Start Date</label>
            <input
              type="date"
              className="w-full border p-2.5 rounded-lg mt-1"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">End Date</label>
            <input
              type="date"
              className="w-full border p-2.5 rounded-lg mt-1"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-indigo-900 uppercase text-xs tracking-widest">
            Registration & Deadlines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Reg. Start</label>
              <input
                type="date"
                className="w-full border p-2 rounded text-sm"
                value={formData.course_registration_start_date}
                onChange={(e) =>
                  setFormData({ ...formData, course_registration_start_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Reg. End</label>
              <input
                type="date"
                className="w-full border p-2 rounded text-sm"
                value={formData.course_registration_end_date}
                onChange={(e) =>
                  setFormData({ ...formData, course_registration_end_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-500 uppercase">Drop Deadline</label>
              <input
                type="date"
                className="w-full border p-2 rounded text-sm border-red-100"
                value={formData.course_drop_deadline}
                onChange={(e) => setFormData({ ...formData, course_drop_deadline: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-green-600 uppercase">Fee Deadline</label>
              <input
                type="date"
                className="w-full border p-2 rounded text-sm border-green-100"
                value={formData.fee_deadline}
                onChange={(e) => setFormData({ ...formData, fee_deadline: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Currently Active Term</span>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
          >
            {loading ? 'Saving...' : 'Save Term'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TermForm;
