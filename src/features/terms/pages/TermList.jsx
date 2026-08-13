import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermService from '../api/term.service';

const TermList = () => {
  const [terms, setTerms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    TermService.getTerms()
      .then(setTerms)
      .catch((err) => console.error('Failed to load terms', err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">All Academic Terms</h1>
          <p className="text-gray-500 text-sm">
            Overview of semesters, deadlines, and registration periods
          </p>
        </div>
        <button
          onClick={() => navigate('/academics/terms/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all"
        >
          + Create Term
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Term Name</th>
              <th className="px-6 py-4 font-bold">Duration</th>
              <th className="px-6 py-4 font-bold">Registration Period</th>
              <th className="px-6 py-4 font-bold text-center">Deadlines</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {terms.map((term) => (
              <tr key={term.id} className="hover:bg-blue-50/30 transition-colors text-sm">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{term.name}</div>
                  <div className="text-xs text-indigo-500 font-medium uppercase">
                    {term.term_type}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {term.start_date} <span className="text-gray-400">to</span> {term.end_date}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="text-xs">Start: {term.course_registration_start_date}</div>
                  <div className="text-xs">End: {term.course_registration_end_date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-red-500 font-semibold">
                    Drop: {term.course_drop_deadline}
                  </div>
                  <div className="text-xs text-green-600 font-semibold">
                    Fee: {term.fee_deadline}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {term.is_active ? (
                    <span className="text-green-600 bg-green-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/academics/terms/edit/${term.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 font-bold"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {terms.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">No terms found.</div>
        )}
      </div>
    </div>
  );
};

export default TermList;
