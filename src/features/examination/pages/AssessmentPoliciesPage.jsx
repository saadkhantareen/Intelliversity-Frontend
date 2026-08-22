import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ExaminationService from '@/features/examination/api/examination.service';
import TermService from '@/features/terms/api/term.service'; // Assuming this is where your term service is located

export default function AssessmentPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form states matching your API schema
  const [formData, setFormData] = useState({
    term: '',
    assessment_type: '',
    number_of_assessments: 1,
    total_weightage: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesData, typesData, termsData] = await Promise.all([
        ExaminationService.getAssessmentPolicies(),
        ExaminationService.getAssessmentTypes(),
        TermService.getTerms ? TermService.getTerms() : TermService.getAll(), // Adjust based on your term service method name
      ]);
      setPolicies(policiesData.results ?? policiesData);
      setAssessmentTypes(typesData.results ?? typesData);
      setTerms(termsData.results ?? termsData);
    } catch (error) {
      toast.error('Failed to load assessment policies or terms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ term: '', assessment_type: '', number_of_assessments: 1, total_weightage: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      term: item.term,
      assessment_type: item.assessment_type,
      number_of_assessments: item.number_of_assessments,
      total_weightage: item.total_weightage,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await ExaminationService.updateAssessmentPolicy(editingId, formData);
        toast.success('Assessment policy updated successfully.');
      } else {
        await ExaminationService.createAssessmentPolicy(formData);
        toast.success('Assessment policy created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed. Please check inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await ExaminationService.deleteAssessmentPolicy(id);
      toast.success('Assessment policy deleted.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Policies</h1>
          <p className="text-sm text-gray-500">Define weightage and counts for assessment types per term.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + Add Assessment Policy
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weightage (%)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">Loading...</td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">No assessment policies found.</td>
              </tr>
            ) : (
              policies.map((item) => {
                const matchedTerm = terms.find((t) => t.id === item.term);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.assessment_type_name || item.assessment_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {matchedTerm?.name || matchedTerm?.title || item.term}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.number_of_assessments}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.total_weightage}%</td>
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Assessment Policy' : 'Create Assessment Policy'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
                <select
                  required
                  value={formData.assessment_type}
                  onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Assessment Type</option>
                  {assessmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700">Number of Assessments</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.number_of_assessments}
                  onChange={(e) => setFormData({ ...formData, number_of_assessments: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Weightage (%)</label>
                <input
                  type="text"
                  required
                  value={formData.total_weightage}
                  onChange={(e) => setFormData({ ...formData, total_weightage: e.target.value })}
                  placeholder="e.g. 20.00"
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