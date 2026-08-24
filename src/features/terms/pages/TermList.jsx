import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermService from '../api/term.service';

const TermList = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const data = await TermService.getTerms();
      setTerms(data.data || data);
    } catch (err) {
      console.error('Failed to fetch terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await TermService.deleteTerm(id);
        setTerms((prev) => prev.filter((term) => term.id !== id));
      } catch (err) {
        alert('Failed to delete term.');
        console.error(err);
      }
    }
  };

  // Handle term activation using the dedicated activation service endpoint
  const handleToggleActive = async (term) => {
    if (term.is_active) {
      alert('This term is already active.');
      return;
    }

    try {
      // Calls the backend activation action (utilizing TermActivateSerializer)
      await TermService.activateTerm(term.id);
      
      // Reload the terms list to reflect the newly active term and automatic deactivation of others
      loadTerms();
    } catch (err) {
      alert('Failed to activate term: ' + JSON.stringify(err.response?.data || err.message));
      console.error(err);
    }
  };

  const getAcademicYearLabel = (term) => {
    if (!term.academic_year && !term.academic_year_name && !term.academic_year_detail) {
      return 'N/A';
    }
    if (typeof term.academic_year === 'object' && term.academic_year !== null) {
      return term.academic_year.name || term.academic_year.year_name || 'N/A';
    }
    if (typeof term.academic_year_detail === 'object' && term.academic_year_detail !== null) {
      return term.academic_year_detail.name || 'N/A';
    }
    if (term.academic_year_name) return term.academic_year_name;
    return String(term.academic_year);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Academic Terms</h1>
          <p className="text-gray-500 text-sm mt-1">Manage semesters, statuses, and deadlines</p>
        </div>
        <button
          onClick={() => navigate('/academics/terms/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
        >
          + Add Term
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <th className="px-6 py-4">Term Name</th>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Key Deadlines</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {terms.map((term) => (
              <tr key={term.id} className="hover:bg-indigo-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{term.name}</div>
                  <div className="text-xs font-medium text-gray-400 uppercase mt-0.5">
                    Type: {term.term_type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200">
                    {getAcademicYearLabel(term)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleActive(term)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      term.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-default'
                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 cursor-pointer'
                    }`}
                    title={term.is_active ? 'Active Term' : 'Click to activate this term'}
                  >
                    {term.is_active ? '● Active' : '○ Make Active'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                  {term.start_date} <span className="text-gray-300 mx-1">→</span> {term.end_date}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 space-y-1">
                  <div><span className="font-semibold text-gray-700">Reg:</span> {term.course_registration_start_date}</div>
                  <div><span className="font-semibold text-gray-700">Fee Due:</span> {term.fee_deadline}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => navigate(`/academics/terms/edit/${term.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 font-bold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(term.id)}
                      className="text-rose-500 hover:text-rose-700 font-bold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-12 text-center text-gray-400 font-medium">Loading terms...</div>
        )}

        {!loading && terms.length === 0 && (
          <div className="p-12 text-center text-gray-400 font-medium">
            No terms found. Click "+ Add Term" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default TermList;