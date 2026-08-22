import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TermService from '../api/term.service';
import AcademicYearService from '@/features/academic-year/api/academic-year.service';

const TermForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const yearIdParam = searchParams.get('academic_year');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);

  const [formData, setFormData] = useState({
    academic_year: '',
    name: '',
    term_type: 'FALL',
    is_active: true, // Added is_active toggle default state
    start_date: '',
    end_date: '',
    fee_issue_date: '',
    fee_deadline: '',
    faculty_course_assignment_start_date: '',
    faculty_course_assignment_end_date: '',
    course_registration_start_date: '',
    course_registration_end_date: '',
    course_drop_deadline: '',
    course_withdraw_deadline: '',
  });

  useEffect(() => {
    const initData = async () => {
      try {
        let years = [];
        try {
          const yearsRes = await AcademicYearService.getYears();
          years = yearsRes.data || yearsRes;
        } catch {
          years = [];
        }
        setAcademicYears(years);

        if (id) {
          const termData = await TermService.getTermById(id);
          
          let resolvedYearId = '';
          const rawYear = termData.academic_year;

          if (typeof rawYear === 'object' && rawYear !== null) {
            resolvedYearId = rawYear.id || rawYear.uuid || '';
          } else if (typeof rawYear === 'string') {
            const matchedYear = years.find((y) => y.id === rawYear || y.name === rawYear);
            resolvedYearId = matchedYear ? matchedYear.id : rawYear;
          }

          setFormData({
            ...termData,
            academic_year: resolvedYearId,
            is_active: termData.is_active ?? true,
          });
        } else if (yearIdParam) {
          setFormData((prev) => ({ ...prev, academic_year: yearIdParam }));
        } else if (years.length > 0) {
          setFormData((prev) => ({ ...prev, academic_year: years[0].id }));
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, yearIdParam]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const yearId = typeof formData.academic_year === 'object'
      ? formData.academic_year?.id
      : formData.academic_year;

    const payload = {
      ...formData,
      academic_year: yearId,
    };

    try {
      if (id) {
        await TermService.updateTerm(id, payload);
      } else {
        await TermService.createTerm(payload);
      }
      navigate('/academics/terms');
    } catch (err) {
      alert('Error saving term: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center text-gray-500 font-bold">Loading term form...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-3xl my-10 border border-gray-100">
      <div className="mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {id ? 'Edit Academic Term' : 'Add Academic Term'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Configure term schedules, fees, and registration windows</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 items-center">
          <div>
            <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
              Academic Year
            </label>
            <select
              name="academic_year"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white font-semibold text-gray-700"
              value={formData.academic_year}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
              Term Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white font-medium text-gray-800"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Fall 2026 Semester"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
              Term Type
            </label>
            <select
              name="term_type"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white font-semibold text-gray-700"
              value={formData.term_type}
              onChange={handleChange}
              required
            >
              <option value="FALL">Fall</option>
              <option value="SPRING">Spring</option>
              <option value="SUMMER">Summer</option>
              <option value="WINTER">Winter</option>
            </select>
          </div>

          {/* Active Status Toggle */}
          <div>
            <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
              Status
            </label>
            <div className="flex items-center h-[50px] px-4 border-2 border-gray-200 rounded-xl bg-white">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-sm font-bold text-gray-700">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Term Duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">Start Date</label>
              <input
                type="date"
                name="start_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">End Date</label>
              <input
                type="date"
                name="end_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Course Registration & Faculty Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-black text-blue-600 uppercase mb-2">Reg. Start</label>
              <input
                type="date"
                name="course_registration_start_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.course_registration_start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-blue-600 uppercase mb-2">Reg. End</label>
              <input
                type="date"
                name="course_registration_end_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.course_registration_end_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-purple-600 uppercase mb-2">Faculty Assign Start</label>
              <input
                type="date"
                name="faculty_course_assignment_start_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.faculty_course_assignment_start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-purple-600 uppercase mb-2">Faculty Assign End</label>
              <input
                type="date"
                name="faculty_course_assignment_end_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.faculty_course_assignment_end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Deadlines & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-black text-amber-600 uppercase mb-2">Fee Issue Date</label>
              <input
                type="date"
                name="fee_issue_date"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.fee_issue_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-amber-600 uppercase mb-2">Fee Deadline</label>
              <input
                type="date"
                name="fee_deadline"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.fee_deadline}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-rose-600 uppercase mb-2">Drop Deadline</label>
              <input
                type="date"
                name="course_drop_deadline"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.course_drop_deadline}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-rose-600 uppercase mb-2">Withdraw Deadline</label>
              <input
                type="date"
                name="course_withdraw_deadline"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white text-sm"
                value={formData.course_withdraw_deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/academics/terms')}
            className="px-8 py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
          >
            {loading ? 'Saving...' : id ? 'Update Term' : 'Create Term'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TermForm;