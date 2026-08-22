import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ExaminationService from '@/features/examination/api/examination.service';

export default function GradeScalesPage() {
  const [scales, setScales] = useState([]);
  const [gradePolicies, setGradePolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    grade_policy: '',
    grade: '',
    min_percentage: '',
    max_percentage: '',
    grade_points: '',
    remarks: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scalesData, policiesData] = await Promise.all([
        ExaminationService.getGradeScales(),
        ExaminationService.getGradePolicies(),
      ]);
      setScales(scalesData.results ?? scalesData);
      setGradePolicies(policiesData.results ?? policiesData);
    } catch (error) {
      toast.error('Failed to load grade scales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ grade_policy: '', grade: '', min_percentage: '', max_percentage: '', grade_points: '', remarks: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      grade_policy: item.grade_policy,
      grade: item.grade,
      min_percentage: item.min_percentage,
      max_percentage: item.max_percentage,
      grade_points: item.grade_points,
      remarks: item.remarks,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await ExaminationService.updateGradeScale(editingId, formData);
        toast.success('Grade scale updated successfully.');
      } else {
        await ExaminationService.createGradeScale(formData);
        toast.success('Grade scale created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed. Please check inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade scale?')) return;
    try {
      await ExaminationService.deleteGradeScale(id);
      toast.success('Grade scale deleted.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Scales</h1>
          <p className="text-sm text-gray-500">Define percentage boundaries and points mapped to grade policies.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + Add Grade Scale
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Policy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Points</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">Loading...</td>
              </tr>
            ) : scales.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">No grade scales found.</td>
              </tr>
            ) : (
              scales.map((item) => {
                const matchedPolicy = gradePolicies.find((p) => p.id === item.grade_policy);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {matchedPolicy?.name || item.grade_policy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.min_percentage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.max_percentage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.grade_points}</td>
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
              {editingId ? 'Edit Grade Scale' : 'Create Grade Scale'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade Policy</label>
                <select
                  required
                  value={formData.grade_policy}
                  onChange={(e) => setFormData({ ...formData, grade_policy: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Grade Policy</option>
                  {gradePolicies.map((policy) => (
                    <option key={policy.id} value={policy.id}>{policy.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade</label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g. A+"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade Points</label>
                  <input
                    type="text"
                    value={formData.grade_points}
                    onChange={(e) => setFormData({ ...formData, grade_points: e.target.value })}
                    placeholder="e.g. 4.0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Percentage</label>
                  <input
                    type="text"
                    required
                    value={formData.min_percentage}
                    onChange={(e) => setFormData({ ...formData, min_percentage: e.target.value })}
                    placeholder="e.g. 80.00"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Percentage</label>
                  <input
                    type="text"
                    required
                    value={formData.max_percentage}
                    onChange={(e) => setFormData({ ...formData, max_percentage: e.target.value })}
                    placeholder="e.g. 100.00"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional remarks"
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