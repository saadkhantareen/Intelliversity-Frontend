import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AcademicYearService from '../../services/academic-year.service';

const AcademicYearForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    terms: [],
  });

  useEffect(() => {
    if (id) {
      AcademicYearService.getYearById(id).then(setFormData);
    }
  }, [id]);

  const addTermRow = () => {
    setFormData({
      ...formData,
      terms: [
        ...formData.terms,
        {
          name: '',
          term_type: 'FALL', // Default to one of your choices
          start_date: '',
          end_date: '',
          course_registration_start_date: '',
          course_registration_end_date: '',
          course_drop_deadline: '',
          fee_deadline: '',
          is_active: false,
        },
      ],
    });
  };

  const removeTermRow = (index) => {
    const newTerms = formData.terms.filter((_, i) => i !== index);
    setFormData({ ...formData, terms: newTerms });
  };

  const updateTermRow = (index, field, value) => {
    const newTerms = [...formData.terms];
    newTerms[index][field] = value;
    setFormData({ ...formData, terms: newTerms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) await AcademicYearService.updateYear(id, formData);
      else await AcademicYearService.createYear(formData);
      navigate('/academics/academic-years');
    } catch (err) {
      alert('Error: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-2xl rounded-3xl mt-10 mb-20 border border-gray-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {id ? 'Edit' : 'Define'} Academic Year & Terms
        </h2>
        <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-full">
          <input
            type="checkbox"
            className="h-5 w-5 text-indigo-600 rounded"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <span className="ml-2 text-sm font-bold text-indigo-700 uppercase tracking-tight">
            Year Active
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* --- ACADEMIC YEAR SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50 rounded-2xl">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Year Title
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all bg-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 2024-2025"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Cycle Start
            </label>
            <input
              type="date"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Cycle End
            </label>
            <input
              type="date"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
        </div>

        {/* --- NESTED TERMS SECTION --- */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Academic Terms</h3>
              <p className="text-sm text-gray-500">Add semesters using your defined term types</p>
            </div>
            <button
              type="button"
              onClick={addTermRow}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              + Add Term
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {formData.terms.map((term, index) => (
              <div
                key={index}
                className="p-8 bg-white border-2 border-gray-100 rounded-3xl relative hover:border-indigo-200 transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => removeTermRow(index)}
                  className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">
                      Term Name
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-100 py-2 focus:border-indigo-400 outline-none bg-transparent"
                      value={term.name}
                      onChange={(e) => updateTermRow(index, 'name', e.target.value)}
                      placeholder="e.g. Fall Semester"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">
                      Term Type (Backend Choice)
                    </label>
                    <select
                      className="w-full border-b-2 border-gray-100 py-2 focus:border-indigo-400 outline-none bg-transparent font-bold text-gray-700"
                      value={term.term_type}
                      onChange={(e) => updateTermRow(index, 'term_type', e.target.value)}
                    >
                      <option value="FALL">Fall</option>
                      <option value="SPRING">Spring</option>
                      <option value="SUMMER">Summer</option>
                      <option value="WINTER">Winter</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600"
                      checked={term.is_active}
                      onChange={(e) => updateTermRow(index, 'is_active', e.target.checked)}
                    />
                    <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                </div>

                {/* Dates & Deadlines */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/50 p-6 rounded-2xl">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">
                      Start
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border-0 bg-transparent"
                      value={term.start_date}
                      onChange={(e) => updateTermRow(index, 'start_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">
                      End
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border-0 bg-transparent"
                      value={term.end_date}
                      onChange={(e) => updateTermRow(index, 'end_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-500 uppercase block mb-1">
                      Reg. Start
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border-0 bg-transparent"
                      value={term.course_registration_start_date}
                      onChange={(e) =>
                        updateTermRow(index, 'course_registration_start_date', e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-500 uppercase block mb-1">
                      Reg. End
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border-0 bg-transparent"
                      value={term.course_registration_end_date}
                      onChange={(e) =>
                        updateTermRow(index, 'course_registration_end_date', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6">
                  <div>
                    <label className="text-[10px] font-black text-red-400 uppercase block mb-1">
                      Drop Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border-0 bg-transparent font-semibold"
                      value={term.course_drop_deadline}
                      onChange={(e) => updateTermRow(index, 'course_drop_deadline', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-green-500 uppercase block mb-1">
                      Fee Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border-0 bg-transparent font-semibold"
                      value={term.fee_deadline}
                      onChange={(e) => updateTermRow(index, 'fee_deadline', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-10 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all"
          >
            {loading ? 'Saving...' : 'Initialize Academic Year'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicYearForm;
