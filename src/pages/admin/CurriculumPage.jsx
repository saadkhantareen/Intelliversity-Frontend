import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import {
  getCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from '@/services/curriculum.service';
import { getPrograms } from '@/services/program.service';

const EMPTY_FORM = { name: '', program: '' };

const CurriculumPage = () => {
  const [curriculums, setCurriculums] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [curRes, progRes] = await Promise.all([
        getCurriculums(),
        getPrograms(),
      ]);
      setCurriculums(curRes.data);
      setPrograms(progRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (cur) => {
    setEditTarget(cur);
    setForm({
      name: cur.name,
      program: cur.program,
    });
    setShowForm(true);
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        program: Number(form.program),
      };
      if (editTarget) {
        await updateCurriculum(editTarget.id, payload);
        toast.success('Curriculum updated');
      } else {
        await createCurriculum(payload);
        toast.success('Curriculum created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCurriculum(deleteTarget.id);
      toast.success('Curriculum deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const progName = (id) =>
    programs.find((p) => p.id === id)?.name ?? '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum</h1>
          <p className="text-sm text-gray-500 mt-1">
            {curriculums.length} curriculum
            {curriculums.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Curriculum
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : curriculums.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 text-gray-400">
          No curriculums yet.
        </div>
      ) : (
        /* Curriculum List */
        <div className="space-y-3">
          {curriculums.map((cur) => (
            <div
              key={cur.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="font-medium text-gray-900">{cur.name}</span>
                <p className="text-xs text-gray-500 mt-1">
                  Program: {progName(cur.program)}
                </p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => openEdit(cur)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(cur)}
                  className="text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Curriculum' : 'New Curriculum'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. BSCS 2024 Curriculum"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Program */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.program}
              onChange={set('program')}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Curriculum"
      >
        <p className="text-gray-600 mb-5">
          Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CurriculumPage;
