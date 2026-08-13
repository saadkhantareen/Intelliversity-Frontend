import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ProfileService } from '../api/profile.service';
import FacultyForm from './FacultyForm';

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevronIcon = ({ dir = 'right' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function DeleteModal({ faculty, onConfirm, onCancel, loading }) {
  if (!faculty) return null;
  const name =
    `${faculty.base_profile?.user?.first_name ?? ''} ${faculty.base_profile?.user?.last_name ?? ''}`.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete faculty member?</h3>
        <p className="text-sm text-gray-500 mb-6">
          This will permanently delete <span className="font-medium text-gray-800">{name}</span> (
          {faculty.registration_id}). This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ faculty, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: faculty?.base_profile?.user?.first_name ?? '',
    last_name: faculty?.base_profile?.user?.last_name ?? '',
    designation: faculty?.designation ?? '',
    qualification: faculty?.qualification ?? '',
    specialization: faculty?.specialization ?? '',
    experience_years: faculty?.experience_years ?? '',
    office_number: faculty?.office_number ?? '',
    office_location: faculty?.office_location ?? '',
    phone_number: faculty?.base_profile?.phone_number ?? '',
    city: faculty?.base_profile?.city ?? '',
    country: faculty?.base_profile?.country ?? '',
    bio: faculty?.base_profile?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    const toastId = toast.loading('Saving changes…');
    try {
      const payload = {
        designation: form.designation || null,
        qualification: form.qualification || null,
        specialization: form.specialization || null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        office_number: form.office_number || null,
        office_location: form.office_location || null,
        base_profile: {
          phone_number: form.phone_number || null,
          city: form.city || null,
          country: form.country || null,
          bio: form.bio || null,
          user: { first_name: form.first_name, last_name: form.last_name },
        },
      };
      const updated = await ProfileService.updateFaculty(faculty.id, payload);
      toast.success('Faculty updated successfully!', {
        id: toastId,
        duration: 3000,
      });
      onSaved(updated);
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to update.', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  }

  const inp = (id, label, type = 'text') => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={form[id]}
        onChange={set(id)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Edit faculty member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {inp('first_name', 'First name')}
            {inp('last_name', 'Last name')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp('designation', 'Designation')}
            {inp('qualification', 'Qualification')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp('specialization', 'Specialization')}
            {inp('experience_years', 'Experience (yrs)', 'number')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp('office_number', 'Office no.')}
            {inp('office_location', 'Office location')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp('phone_number', 'Phone')}
            {inp('city', 'City')}
          </div>
          {inp('country', 'Country')}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchFaculty = useCallback(async () => {
    setFetching(true);
    try {
      const res = await ProfileService.getFaculty({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch,
      });
      if (Array.isArray(res)) {
        setFaculty(res);
        setTotal(res.length);
      } else {
        setFaculty(res.results ?? []);
        setTotal(res.count ?? 0);
      }
    } catch {
      toast.error('Failed to load faculty.');
    } finally {
      setFetching(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  async function handleDelete() {
    setDeleting(true);
    const toastId = toast.loading('Deleting…');
    try {
      await ProfileService.deleteFaculty(deleteTarget.id);
      toast.success('Faculty member deleted.', { id: toastId, duration: 3000 });
      setDeleteTarget(null);
      fetchFaculty();
    } catch {
      toast.error('Failed to delete.', { id: toastId, duration: 4000 });
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved(updated) {
    setFaculty((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setEditTarget(null);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const getName = (f) =>
    `${f.base_profile?.user?.first_name ?? ''} ${f.base_profile?.user?.last_name ?? ''}`.trim() ||
    '—';
  const getEmail = (f) => f.base_profile?.user?.email ?? '—';
  const getDept = (f) => f.department?.name ?? f.department ?? '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} total members</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon /> Add faculty
          </button>
        </div>

        {showCreate && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Register new faculty member</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>
            <FacultyForm
              onSuccess={() => {
                setShowCreate(false);
                fetchFaculty();
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}

        <div className="relative mb-4 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Reg. ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Designation
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetching ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : faculty.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      No faculty members found.
                    </td>
                  </tr>
                ) : (
                  faculty.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {getName(f).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{getName(f)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                        {f.registration_id}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{getEmail(f)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {f.department_name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{f.designation ?? '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditTarget(f)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <EditIcon /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(f)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronIcon dir="left" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronIcon dir="right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editTarget && (
        <EditModal faculty={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />
      )}
      <DeleteModal
        faculty={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
