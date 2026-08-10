import { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useProfile } from '../../context/ProfileContext';
import { useCloudinary } from '../../hooks/useCloudinary';
import SectionCard from '../../components/ui/SectionCard';
import InfoField from '../../components/ui/InfoField';
import toast from 'react-hot-toast';

function AdminProfilePage() {
  const { config } = useTenant();
  const { profile, documents, isLoading, updateProfile, uploadDocument, deleteDocument } =
    useProfile();

  // Bring in our reusable Cloudinary logic
  const { uploadToCloudinary, getPrivateUrl, isUploading } = useCloudinary();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [privateUrls, setPrivateUrls] = useState({}); // { [docId]: url }
  const [loadingUrlId, setLoadingUrlId] = useState(null);

  const [formData, setFormData] = useState({
    base_profile: {
      phone_number: '',
      emergency_contact: '',
      father_name: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      cnic: '',
      religion: '',
      address: '',
      city: '',
      country: '',
      bio: '',
    },
  });

  const [docForm, setDocForm] = useState({
    document_type: '',
    title: '',
    file: null,
    description: '',
  });

  useEffect(() => {
    if (profile) {
      const bp = profile.base_profile || {};
      setFormData({
        base_profile: {
          phone_number: bp.phone_number || '',
          emergency_contact: bp.emergency_contact || '',
          father_name: bp.father_name || '',
          date_of_birth: bp.date_of_birth || '',
          gender: bp.gender || '',
          nationality: bp.nationality || '',
          cnic: bp.cnic || '',
          religion: bp.religion || '',
          address: bp.address || '',
          city: bp.city || '',
          country: bp.country || '',
          bio: bp.bio || '',
        },
      });
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      base_profile: { ...prev.base_profile, [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const errors = err.response?.data;
      toast.error(errors?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Profile picture upload ────────────────────────────────────────────────
  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { public_id } = await uploadToCloudinary(file, 'profile');
      // Save public_id to Django — backend resolves the actual URL
      await updateProfile({
        base_profile: { profile_picture_public_id: public_id },
      });
      toast.success('Profile picture updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile picture');
    }
  };

  // ── Document upload ───────────────────────────────────────────────────────
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docForm.file || !docForm.document_type || !docForm.title) {
      toast.error('Please fill all document fields');
      return;
    }

    try {
      // Step 1 & 2: upload file to Cloudinary via hook
      const { public_id, resource_type } = await uploadToCloudinary(docForm.file, 'document');

      // Step 3: tell Django to save the record with public_id
      await uploadDocument({
        document_type: docForm.document_type,
        title: docForm.title,
        description: docForm.description,
        document_public_id: public_id,
        resource_type,
      });

      toast.success('Document uploaded successfully!');
      setDocForm({ document_type: '', title: '', file: null, description: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload document');
    }
  };

  // ── View private document ─────────────────────────────────────────────────
  const handleViewDoc = async (doc) => {
    if (privateUrls[doc.id]) {
      window.open(privateUrls[doc.id], '_blank');
      return;
    }
    setLoadingUrlId(doc.id);
    try {
      const url = await getPrivateUrl(doc.public_id, doc.resource_type);
      setPrivateUrls((prev) => ({ ...prev, [doc.id]: url }));
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Could not get document URL');
    } finally {
      setLoadingUrlId(null);
    }
  };

  const handleDocDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setPrivateUrls((prev) => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const bp = profile?.base_profile;
  const themeColor = config?.color || '#4F46E5';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{ backgroundColor: themeColor }}
            className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{ backgroundColor: themeColor }}
              className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <SectionCard title="Basic Information">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with upload */}
          <div className="relative w-16 h-16">
            {isUploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-10">
                <span className="text-white text-xs">...</span>
              </div>
            )}
            {bp?.profile_picture_url ? (
              <img
                src={bp.profile_picture_url}
                alt="profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                style={{ backgroundColor: themeColor }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold select-none"
              >
                {bp?.first_name?.[0]}
                {bp?.last_name?.[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 cursor-pointer shadow hover:bg-gray-100 transition-colors">
              <span className="text-xs">📷</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePicUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-800">
              {bp?.first_name} {bp?.last_name}
            </p>
            <p className="text-sm text-gray-400">{bp?.email}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {bp?.roles?.map((r) => (
                <span
                  key={r}
                  style={{ backgroundColor: themeColor }}
                  className="text-white px-2 py-0.5 rounded-full text-xs"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Admin Info — read only */}
      <SectionCard title="Admin Information">
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Designation" value={profile?.designation} />
          <InfoField label="Office Number" value={profile?.office_number} />
          <InfoField label="Office Location" value={profile?.office_location} />
        </div>
      </SectionCard>

      {/* Personal Info — editable */}
      <SectionCard title="Personal Information">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Father Name', field: 'father_name' },
              { label: 'Date of Birth', field: 'date_of_birth', type: 'date' },
              { label: 'CNIC', field: 'cnic' },
              { label: 'Religion', field: 'religion' },
              { label: 'Nationality', field: 'nationality' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {label}
                </label>
                <input
                  type={type || 'text'}
                  value={formData.base_profile[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ '--tw-ring-color': themeColor }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                Gender
              </label>
              <select
                value={formData.base_profile.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Father Name" value={bp?.father_name} />
            <InfoField label="Date of Birth" value={bp?.date_of_birth} />
            <InfoField label="Gender" value={bp?.gender} />
            <InfoField label="CNIC" value={bp?.cnic} />
            <InfoField label="Religion" value={bp?.religion} />
            <InfoField label="Nationality" value={bp?.nationality} />
          </div>
        )}
      </SectionCard>

      {/* Contact Info — editable */}
      <SectionCard title="Contact Information">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Phone Number', field: 'phone_number' },
              { label: 'Emergency Contact', field: 'emergency_contact' },
              { label: 'City', field: 'city' },
              { label: 'Country', field: 'country' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={formData.base_profile[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                Address
              </label>
              <textarea
                value={formData.base_profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Phone Number" value={bp?.phone_number} />
            <InfoField label="Emergency Contact" value={bp?.emergency_contact} />
            <InfoField label="Address" value={bp?.address} />
            <InfoField label="City" value={bp?.city} />
            <InfoField label="Country" value={bp?.country} />
          </div>
        )}
      </SectionCard>

      {/* Bio */}
      <SectionCard title="Bio">
        {isEditing ? (
          <textarea
            value={formData.base_profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            placeholder="Write something about yourself..."
          />
        ) : (
          <p className="text-sm text-gray-600">{bp?.bio || '—'}</p>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Documents">
        {/* Upload form */}
        <form
          onSubmit={handleDocUpload}
          className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100"
        >
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
              Document Type
            </label>
            <select
              value={docForm.document_type}
              onChange={(e) =>
                setDocForm((prev) => ({
                  ...prev,
                  document_type: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Select type</option>
              <option value="cnic">CNIC</option>
              <option value="passport">Passport</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
              Title
            </label>
            <input
              type="text"
              value={docForm.title}
              onChange={(e) => setDocForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              placeholder="Document title"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">File</label>
            <input
              type="file"
              key={docForm.title} // reset input when form clears
              onChange={(e) =>
                setDocForm((prev) => ({
                  ...prev,
                  file: e.target.files[0] || null,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={docForm.description}
              onChange={(e) => setDocForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              placeholder="Optional description"
            />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={isUploading}
              style={{ backgroundColor: themeColor }}
              className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isUploading ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        </form>

        {/* Document list */}
        {documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">{doc.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{doc.document_type}</p>
                  {doc.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{doc.description}</p>
                  )}
                  {doc.is_verified && (
                    <span className="text-xs text-green-500 font-medium">✓ Verified</span>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => handleViewDoc(doc)}
                    disabled={loadingUrlId === doc.id}
                    className="text-xs text-blue-500 hover:underline disabled:opacity-50"
                  >
                    {loadingUrlId === doc.id ? 'Loading…' : 'View'}
                  </button>
                  <button
                    onClick={() => handleDocDelete(doc.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default AdminProfilePage;
