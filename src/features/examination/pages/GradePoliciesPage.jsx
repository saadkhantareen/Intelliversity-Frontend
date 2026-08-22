import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ExaminationService from '@/features/examination/api/examination.service';
import TermService from '@/features/terms/api/term.service';

export default function GradePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    term: '',
    name: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesData, termsData] = await Promise.all([
        ExaminationService.getGradePolicies(),
        TermService.getTerms ? TermService.getTerms() : TermService.getAll(),
      ]);
      setPolicies(policiesData.results ?? policiesData);
      setTerms(termsData.results ?? termsData);
    } catch (error) {
      toast.error('Failed to load grade policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ term: '', name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      term: item.term,
      name: item.name,
      description: item.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await ExaminationService.updateGradePolicy(editingId, formData);
        toast.success('Grade policy updated successfully.');
      } else {
        await ExaminationService.createGradePolicy(formData);
        toast.success('Grade policy created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed. Please check inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade policy?')) return;
    try {
      await ExaminationService.deleteGradePolicy(id);
      toast.success('Grade policy deleted.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Policies</h1>
          <p className="text-sm text-gray-500">Configure grading policies mapped to specific terms.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + Add Grade Policy
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">Loading...</td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">No grade policies found.</td>
              </tr>
            ) : (
              policies.map((item) => {
                const matchedTerm = terms.find((t) => t.id === item.term);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {matchedTerm?.name || matchedTerm?.title || item.term}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Grade Policy' : 'Create Grade Policy'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard Grading 2026"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <select
                  required
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Term</option>
                  {terms.map((termItem) => (
                    <option key={termItem.id} value={termItem.id}>
                      {termItem.name || termItem.title || termItem.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Policy details..."
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}