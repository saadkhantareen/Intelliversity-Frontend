import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BatchService from '../api/batch.service';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await BatchService.getBatches();
      const data = Array.isArray(res) ? res : res?.results || res?.data || [];
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateSections = async (batch) => {
    if (
      window.confirm(
        `Are you sure you want to auto-generate sections for "${batch.name}"? This will divide total capacity into sections.`
      )
    ) {
      try {
        setGeneratingId(batch.id);
        await BatchService.autoGenerateSections(batch.id);
        alert('Sections successfully generated!');
        loadBatches(); // Refresh batch list data
      } catch (err) {
        console.error('Failed to auto-generate sections:', err);
        alert(
          'Failed to generate sections: ' +
            JSON.stringify(err.response?.data || 'Server Error')
        );
      } finally {
        setGeneratingId(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await BatchService.deleteBatch(id);
        setBatches(batches.filter((b) => b.id !== id));
      } catch (err) {
        alert('Failed to delete batch.');
        console.error(err);
      }
    }
  };

  const renderName = (field) => {
    if (!field) return '-';
    if (typeof field === 'object') return field.name || field.code || field.id;
    return field;
  };

  const renderStatusBadge = (status) => {
    const statusUpper = String(status || '').toUpperCase();

    switch (statusUpper) {
      case 'ACTIVE':
      case 'TRUE':
        return (
          <span className="text-green-600 bg-green-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">
            Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-blue-600 bg-blue-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">
            Completed
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="text-purple-600 bg-purple-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">
            Archived
          </span>
        );
      default:
        return (
          <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-tighter">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Batches</h1>
          <p className="text-gray-500 text-sm">Manage student cohorts and capacity allocations</p>
        </div>
        <button
          onClick={() => navigate('/academics/batches/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all"
        >
          + Create Batch
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Batch Name</th>
              <th className="px-6 py-4 font-bold">Program</th>
              <th className="px-6 py-4 font-bold">Curriculum / Term</th>
              <th className="px-6 py-4 font-bold text-center">Capacity</th>
              <th className="px-6 py-4 font-bold text-center">Sem</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{b.name}</div>
                  <div className="text-xs text-gray-400">ID: {b.id}</div>
                </td>
                <td className="px-6 py-4 text-indigo-600 font-bold text-sm">
                  {renderName(b.program)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="font-medium text-gray-800">{renderName(b.curriculum)}</div>
                  <div className="text-xs text-gray-400">Term: {renderName(b.admission_term)}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">
                    {b.max_students ?? 0} Total / {b.max_students_per_section ?? 0} per sec
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Sem {b.expected_current_semester ?? 0}
                </td>
                <td className="px-6 py-4 text-center">{renderStatusBadge(b.status)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {/* Auto-Generate Sections Action */}
                    <button
                      onClick={() => handleAutoGenerateSections(b)}
                      disabled={generatingId === b.id}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs border border-emerald-200 transition-colors disabled:opacity-50"
                      title="Automatically split capacity into sections"
                    >
                      {generatingId === b.id ? 'Generating...' : '⚡ Auto Sections'}
                    </button>

                    {/* Edit Action */}
                    <button
                      onClick={() => navigate(`/academics/batches/edit/${b.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 font-bold text-sm px-2 py-1"
                    >
                      Edit
                    </button>

                    {/* Delete Action */}
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1"
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
          <div className="p-10 text-center text-gray-400 font-medium">Loading batches...</div>
        )}

        {!loading && batches.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">No batches created yet.</div>
        )}
      </div>
    </div>
  );
};

export default BatchList;