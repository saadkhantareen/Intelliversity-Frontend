import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicYearService from '../api/academic-year.service';
import TermService from '../../terms/api/term.service';

const AcademicYearList = () => {
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [expandedYear, setExpandedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yearsRes, termsRes] = await Promise.all([
        AcademicYearService.getYears(),
        TermService.getTerms(),
      ]);

      // Normalize pagination payloads (Django DRF returns { results: [...] })
      const parsedYears = Array.isArray(yearsRes)
        ? yearsRes
        : yearsRes?.results || yearsRes?.data || [];
        
      const parsedTerms = Array.isArray(termsRes)
        ? termsRes
        : termsRes?.results || termsRes?.data || [];

      setYears(parsedYears);
      setTerms(parsedTerms);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this academic year? This will also delete all associated terms.'
      )
    ) {
      try {
        await AcademicYearService.deleteYear(id);
        setYears(years.filter((year) => year.id !== id));
      } catch (err) {
        alert('Failed to delete. It might be linked to other records.');
        console.error(err);
      }
    }
  };

  // 1. Flexible Term Matching (Handles Object, UUID, and String ID comparison)
  const getTermsForYear = (yearId) => {
    if (!Array.isArray(terms)) return [];

    return terms.filter((term) => {
      const rawYear = term.academic_year;

      if (typeof rawYear === 'object' && rawYear !== null) {
        return (
          String(rawYear.id) === String(yearId) ||
          String(rawYear.uuid) === String(yearId)
        );
      }
      return String(rawYear) === String(yearId);
    });
  };

  // 2. Flexible Status Resolver (Handles boolean, string "true", status enum, or active prop)
  const isYearActive = (year) => {
    if (year.is_active === true || year.is_active === 'true' || year.is_active === 1) {
      return true;
    }
    if (year.active === true || year.active === 'true' || year.active === 1) {
      return true;
    }
    if (typeof year.status === 'string' && year.status.toUpperCase() === 'ACTIVE') {
      return true;
    }
    return false;
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
            {years.map((year) => {
              const yearTerms = getTermsForYear(year.id);
              const activeStatus = isYearActive(year);
              const isExpanded = expandedYear === year.id;

              return (
                <React.Fragment key={year.id}>
                  <tr className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{year.name}</div>
                      <div className="text-xs text-gray-400">ID: {year.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {year.start_date} <span className="text-gray-300">→</span> {year.end_date}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/academics/terms?academic_year=${year.id}`)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 transition-all cursor-pointer"
                        title="Click to view related terms"
                      >
                        {yearTerms.length} {yearTerms.length === 1 ? 'Term' : 'Terms'}
                      </button>

                      {yearTerms.length > 0 && (
                        <button
                          onClick={() => setExpandedYear(isExpanded ? null : year.id)}
                          className="block mx-auto mt-1 text-[10px] text-indigo-500 underline font-semibold hover:text-indigo-800"
                        >
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {activeStatus ? (
                        <span className="text-green-600 bg-green-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={() => navigate(`/academics/terms/create?academic_year=${year.id}`)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs border border-emerald-200 transition-colors"
                        >
                          + Add Term
                        </button>
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

                  {/* Inline Term Drawer */}
                  {isExpanded && (
                    <tr className="bg-indigo-50/20">
                      <td colSpan="5" className="px-8 py-4">
                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-inner">
                          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                            Terms in {year.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {yearTerms.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => navigate(`/academics/terms/edit/${t.id}`)}
                                className="p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 text-xs cursor-pointer transition-all"
                              >
                                <div className="font-bold text-gray-800">{t.name}</div>
                                <div className="text-gray-500 text-[11px] mt-0.5">
                                  {t.start_date} to {t.end_date}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="p-10 text-center text-gray-400 font-medium">Loading academic years...</div>
        )}

        {!loading && years.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">
            No academic years defined yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicYearList;