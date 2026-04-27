import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from '@/services/program.service';
import { getDepartments } from '@/services/department.service';

const DEGREE_LEVELS = [
  { value: 'UG', label: 'Undergraduate (BS)' },
  { value: 'PG', label: 'Postgraduate (MS/MBA)' },
  { value: 'PHD', label: 'Doctorate (PhD)' },
  { value: 'DIP', label: 'Diploma' },
];

const EMPTY_FORM = {
  name: '',
  code: '',
  department: '',
  degree_level: '',
  total_credits_required: '',
  number_of_semesters: '',
};

const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        getPrograms(),
        getDepartments(),
      ]);
      setPrograms(progRes.data);
      setDepartments(deptRes.data);
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

  const openEdit = (prog) => {
    setEditTarget(prog);
    setForm({
      name: prog.name,
      code: prog.code,
      department: prog.department,
      degree_level: prog.degree_level,
      total_credits_required: prog.total_credits_required,
      number_of_semesters: prog.number_of_semesters,
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
        department: Number(form.department),
        total_credits_required: Number(form.total_credits_required),
        number_of_semesters: Number(form.number_of_semesters),
      };
      if (editTarget) {
        await updateProgram(editTarget.id, payload);
        toast.success('Program updated');
      } else {
        await createProgram(payload);
        toast.success('Program created');
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
      await deleteProgram(deleteTarget.id);
      toast.success('Program deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const deptName = (id) =>
    departments.find((d) => d.id === id)?.name ?? '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {programs.length} program
            {programs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Program
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : programs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 text-gray-400">No programs yet.</div>
      ) : (
        /* Program List */
        <div className="space-y-3">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded mr-2">
                  {prog.code}
                </span>
                <span className="font-medium text-gray-900">{prog.name}</span>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span>Dept: {deptName(prog.department)}</span>
                  <span>Level: {prog.degree_level}</span>
                  <span>Credits: {prog.total_credits_required}</span>
                  <span>Semesters: {prog.number_of_semesters}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => openEdit(prog)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(prog)}
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
        title={editTarget ? 'Edit Program' : 'New Program'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. BS Computer Science"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Code + Degree Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={set('code')}
                placeholder="e.g. BSCS"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree Level <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.degree_level}
                onChange={set('degree_level')}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select level</option>
                {DEGREE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.department}
                onChange={set('department')}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.code}] {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Credits + Semesters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Credits <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.total_credits_required}
                onChange={set('total_credits_required')}
                placeholder="e.g. 130"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. of Semesters <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.number_of_semesters}
                onChange={set('number_of_semesters')}
                placeholder="e.g. 8"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
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
        title="Delete Program"
      >
        <p className="text-gray-600 mb-5">
          Delete <strong>{deleteTarget?.name}</strong>? All associated curriculum
          and student records will be affected.
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

export default ProgramsPage;
