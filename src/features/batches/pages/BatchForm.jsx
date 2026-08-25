import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BatchService from '../api/batch.service';
import { ProgramService } from '@/features/programs';
import { CurriculumService } from '@/features/curriculum';
import TermService from '../../terms/api/term.service';

const BatchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    program: '',
    curriculum: '',
    admission_term: '',
    per_section_capacity: 30,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progRes, currRes, termRes] = await Promise.all([
          ProgramService.getPrograms(),
          CurriculumService.getCurriculums(),
          TermService.getTerms(),
        ]);

        // Normalize response payloads
        const parsedPrograms = Array.isArray(progRes) ? progRes : progRes?.results || progRes?.data || [];
        const parsedCurriculums = Array.isArray(currRes) ? currRes : currRes?.results || currRes?.data || [];
        const parsedTerms = Array.isArray(termRes) ? termRes : termRes?.results || termRes?.data || [];

        setPrograms(parsedPrograms);
        setCurriculums(parsedCurriculums);
        setTerms(parsedTerms);

        if (id) {
          const batchData = await BatchService.getBatchById(id);
          const data = batchData?.data || batchData;

          setFormData({
            name: data.name || '',
            program: typeof data.program === 'object' ? data.program?.code || data.program?.id : data.program || '',
            curriculum: typeof data.curriculum === 'object' ? data.curriculum?.id : data.curriculum || '',
            admission_term: typeof data.admission_term === 'object' ? data.admission_term?.id : data.admission_term || '',
            status: data.status || 'ACTIVE',
            expected_current_semester: data.expected_current_semester ?? 1,
            per_section_capacity: data.per_section_capacity ?? 30,
          });
        }
      } catch (err) {
        console.error('Error loading form dependencies:', err);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      per_section_capacity: Number(formData.per_section_capacity),
    };

    try {
      if (id) await BatchService.updateBatch(id, payload);
      else await BatchService.createBatch(payload);
      navigate('/academics/batches');
    } catch (err) {
      alert('Failed to save batch: ' + JSON.stringify(err.response?.data || 'Server Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 mb-10">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">{id ? 'Update' : 'Create'} Batch</h2>
        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">
          Academic Management
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Batch Name
            </label>
            <input
              type="text"
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Batch 2024 - CS"
              required
            />
          </div>
        </div>

        {/* Mappings: Program, Curriculum, Admission Term */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Program</label>
            <select
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white transition-all"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              required
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id || p.code} value={p.code || p.id}>
                  {p.name} ({p.code || p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Curriculum
            </label>
            <select
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white transition-all"
              value={formData.curriculum}
              onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
              required
            >
              <option value="">Select Curriculum</option>
              {curriculums.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Admission Term
            </label>
            <select
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white transition-all"
              value={formData.admission_term}
              onChange={(e) => setFormData({ ...formData, admission_term: e.target.value })}
              required
            >
              <option value="">Select Admission Term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacity & Semester Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Per Section Capacity
            </label>
            <input
              type="number"
              min="0"
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
              value={formData.per_section_capacity}
              onChange={(e) => setFormData({ ...formData, per_section_capacity: e.target.value })}
              required
            />
          </div>

        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : id
              ? 'Update Batch Configuration'
              : 'Confirm & Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchForm;