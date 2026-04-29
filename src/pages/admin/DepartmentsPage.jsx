import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/services/department.service';

const EMPTY_FORM = { name: '', code: '', description: '' };

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      setDepartments(res.data);
    } catch {
      toast.error('Failed to load departments');
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

  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await updateDepartment(editTarget.id, form);
        toast.success('Department updated');
      } else {
        await createDepartment(form);
        toast.success('Department created');
      }
      cancelForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDepartment(deleteTarget.id);
      toast.success('Department deleted');
      setDeleteTarget(null);
      setConfirmDelete(false);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">
            {departments.length} department
            {departments.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + New Department
          </button>
        )}
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            {editTarget ? 'Edit Department' : 'New Department'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Computer Science"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={set('code')}
                  placeholder="e.g. CS"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  placeholder="Optional description"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editTarget
                    ? 'Update'
                    : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Banner */}
      {deleteTarget && !confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-red-800">
              Delete <strong>{deleteTarget.name}</strong>? This will also remove
              all programs and courses linked to it.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 ml-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : departments.length === 0 && !showForm ? (
        /* Empty State */
        <div className="text-center py-16 text-gray-400">
          No departments yet. Create one to get started.
        </div>
      ) : (
        /* Department List */
        <div className="space-y-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded mr-3">
                  {dept.code}
                </span>
                <span className="font-medium text-gray-900">{dept.name}</span>
                {dept.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {dept.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    setConfirmDelete(false);
                    openEdit(dept);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(dept);
                    setConfirmDelete(false);
                    setShowForm(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
