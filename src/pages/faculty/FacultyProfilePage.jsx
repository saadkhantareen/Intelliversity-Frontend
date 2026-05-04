import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileService from "@/services/profile.service";
import api from "@/services/api";

// ── Icons ──────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Document Types from your backend choices ───────────────────────────────
const DOCUMENT_TYPES = [
  { value: "cv", label: "CV / Resume" },
  { value: "degree", label: "Degree Certificate" },
  { value: "transcript", label: "Transcript" },
  { value: "id_card", label: "ID Card / CNIC" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

// ── Info Row ───────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800">{value || "—"}</span>
    </div>
  );
}

// ── Upload Document Modal ──────────────────────────────────────────────────
function UploadModal({ userId, onClose, onUploaded }) {
  const [form, setForm] = useState({
    document_type: "",
    title: "",
    description: "",
    document_public_id: "",
    resource_type: "raw",
  });
  const [saving, setSaving] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.document_type || !form.title || !form.document_public_id) {
      toast.error("Document type, title and Cloudinary public ID are required.");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Saving document…");
    try {
      const doc = await ProfileService.saveUserDocument(userId, form);
      toast.success("Document saved successfully!", { id: toastId, duration: 3000 });
      onUploaded(doc);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail ?? Object.values(err.response?.data ?? {})?.[0]?.[0] ?? "Failed to save document.";
      toast.error(msg, { id: toastId, duration: 4000 });
    } finally {
      setSaving(false);
    }
  }

  const inp = (id, label, placeholder = "", required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={form[id]}
        onChange={set(id)}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Upload document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Document Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Document type<span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={form.document_type}
              onChange={set("document_type")}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— select type —</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {inp("title", "Title", "e.g. PhD Certificate", true)}
          {inp("document_public_id", "Cloudinary public ID", "folder/filename", true)}

          {/* Resource Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resource type</label>
            <select
              value={form.resource_type}
              onChange={set("resource_type")}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="raw">Raw (PDF, DOCX…)</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              placeholder="Optional note about this document…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
            Upload the file to Cloudinary first, then paste the <strong>public_id</strong> from the Cloudinary response here.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function FacultyProfilePage() {
  const { id } = useParams(); // faculty profile UUID from URL
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);

  useEffect(() => {
    async function load() {
      setFetching(true);
      try {
        // Fetch faculty profile
        const profile = await api.get(`/api/v1/profiles/faculty/${id}/`);
        setFaculty(profile.data);

        // Fetch documents using the user's UUID
        const userId = profile.data.base_profile?.user?.id;
        if (userId) {
          const docs = await ProfileService.getUserDocuments(userId);
          setDocuments(Array.isArray(docs) ? docs : docs.results ?? []);
        }
      } catch {
        toast.error("Failed to load faculty profile.");
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [id]);

  async function handleDeleteDoc(docId) {
    setDeletingDocId(docId);
    const toastId = toast.loading("Deleting document…");
    try {
      await ProfileService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document deleted.", { id: toastId, duration: 3000 });
    } catch {
      toast.error("Failed to delete document.", { id: toastId, duration: 4000 });
    } finally {
      setDeletingDocId(null);
    }
  }

  function handleUploaded(doc) {
    setDocuments((prev) => [doc, ...prev]);
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile…</p>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Faculty member not found.</p>
      </div>
    );
  }

  const user = faculty.base_profile?.user ?? {};
  const bp = faculty.base_profile ?? {};
  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—";
  const initials = (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Back ── */}
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <BackIcon /> Back to faculty
        </button>

        {/* ── Header Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            {bp.profile_picture_url ? (
              <img src={bp.profile_picture_url} alt={fullName}
                className="w-16 h-16 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold shrink-0">
                {initials.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {faculty.designation && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                    {faculty.designation}
                  </span>
                )}
                {faculty.department?.name && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                    {faculty.department.name}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {faculty.registration_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column Detail ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Faculty Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 border-b pb-2">Faculty details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Qualification" value={faculty.qualification} />
              <InfoRow label="Specialization" value={faculty.specialization} />
              <InfoRow label="Experience" value={faculty.experience_years ? `${faculty.experience_years} yrs` : null} />
              <InfoRow label="Office no." value={faculty.office_number} />
              <InfoRow label="Office location" value={faculty.office_location} />
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 border-b pb-2">Personal details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Father's name" value={bp.father_name} />
              <InfoRow label="Date of birth" value={bp.date_of_birth} />
              <InfoRow label="Gender" value={bp.gender} />
              <InfoRow label="Nationality" value={bp.nationality} />
              <InfoRow label="CNIC" value={bp.cnic} />
              <InfoRow label="Religion" value={bp.religion} />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 border-b pb-2">Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Phone" value={bp.phone_number} />
              <InfoRow label="Emergency contact" value={bp.emergency_contact} />
              <InfoRow label="Address" value={bp.address} />
              <InfoRow label="City" value={bp.city} />
              <InfoRow label="Country" value={bp.country} />
            </div>
          </div>

          {/* Bio */}
          {bp.bio && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-3">Bio</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{bp.bio}</p>
            </div>
          )}
        </div>

        {/* ── Documents ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
              <p className="text-xs text-gray-400 mt-0.5">{documents.length} file{documents.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <UploadIcon /> Upload document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileIcon />
              <p className="text-sm mt-3">No documents uploaded yet.</p>
              <button onClick={() => setShowUpload(true)}
                className="mt-3 text-xs text-green-600 hover:underline">
                Upload the first document
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <FileIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 capitalize">{doc.document_type?.replace("_", " ")}</span>
                      {doc.is_verified && (
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <DownloadIcon /> View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      disabled={deletingDocId === doc.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon /> {deletingDocId === doc.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          userId={faculty.base_profile?.user?.id}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}