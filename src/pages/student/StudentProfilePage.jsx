import { useState, useEffect } from "react";
import { useTenant } from "../../context/TenantContext";
import { useProfile } from "../../context/ProfileContext";
import SectionCard from "../../components/ui/SectionCard";
import InfoField from "../../components/ui/InfoField";
import toast from "react-hot-toast";
import axios from "axios"; // plain axios for Cloudinary direct upload
import api from "../../services/api";

// ─── Cloudinary upload helper (Synced with Admin/Faculty) ──────────────────────
async function uploadToCloudinary(file, assetCategory) {
  const { data: sigData } = await api.get(`/api/v1/storage/uploads/signature/${assetCategory}/`);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sigData.api_key);
  formData.append("timestamp", String(sigData.timestamp));
  formData.append("signature", sigData.signature);
  formData.append("public_id", sigData.public_id);
  formData.append("type", sigData.type);
  formData.append("asset_folder", sigData.asset_folder);
  formData.append("context", sigData.context);

  const resourceType = sigData.resource_type || "image";
  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/${resourceType}/upload`,
    formData
  );

  return {
    public_id: cloudRes.data.public_id,
    resource_type: cloudRes.data.resource_type,
    secure_url: cloudRes.data.secure_url,
  };
}

async function getPrivateUrl(publicId, resourceType) {
  const { data } = await api.post(`/api/v1/storage/uploads/private-url/`, {
    public_id: publicId,
    resource_type: resourceType,
  });
  return data.url;
}

// ──────────────────────────────────────────────────────────────────────────────

function StudentProfilePage() {
  const { config } = useTenant();
  const {
    profile,
    documents,
    isLoading,
    updateProfile,
    uploadDocument,
    deleteDocument,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [privateUrls, setPrivateUrls] = useState({}); 
  const [loadingUrlId, setLoadingUrlId] = useState(null);

  const [formData, setFormData] = useState({
    base_profile: {
      phone_number: "", emergency_contact: "", father_name: "",
      date_of_birth: "", gender: "", nationality: "",
      cnic: "", religion: "", address: "", city: "", country: "", bio: "",
    },
  });

  const [docForm, setDocForm] = useState({
    document_type: "", title: "", file: null, description: "",
  });

  useEffect(() => {
    if (profile) {
      const bp = profile.base_profile || {};
      setFormData({
        base_profile: {
          phone_number: bp.phone_number || "",
          emergency_contact: bp.emergency_contact || "",
          father_name: bp.father_name || "",
          date_of_birth: bp.date_of_birth || "",
          gender: bp.gender || "",
          nationality: bp.nationality || "",
          cnic: bp.cnic || "",
          religion: bp.religion || "",
          address: bp.address || "",
          city: bp.city || "",
          country: bp.country || "",
          bio: bp.bio || "",
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
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPic(true);
    try {
      const { public_id } = await uploadToCloudinary(file, "profile");
      await updateProfile({ base_profile: { profile_picture_public_id: public_id } });
      toast.success("Picture updated!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docForm.file || !docForm.document_type || !docForm.title) {
      toast.error("Required fields missing");
      return;
    }
    setIsUploadingDoc(true);
    try {
      const { public_id, resource_type } = await uploadToCloudinary(docForm.file, "document");
      await uploadDocument({
        document_type: docForm.document_type,
        title: docForm.title,
        description: docForm.description,
        public_id,
        resource_type,
      });
      toast.success("Document uploaded!");
      setDocForm({ document_type: "", title: "", file: null, description: "" });
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleViewDoc = async (doc) => {
    if (privateUrls[doc.id]) {
      window.open(privateUrls[doc.id], "_blank");
      return;
    }
    setLoadingUrlId(doc.id);
    try {
      const url = await getPrivateUrl(doc.public_id, doc.resource_type);
      setPrivateUrls((prev) => ({ ...prev, [doc.id]: url }));
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Error opening document");
    } finally {
      setLoadingUrlId(null);
    }
  };

  const handleDocDelete = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteDocument(docId);
      toast.success("Deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const bp = profile?.base_profile;
  const themeColor = config?.color || "#4F46E5";

  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading student profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={{ backgroundColor: themeColor }} className="text-white px-4 py-2 rounded-lg text-sm">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-sm border text-gray-600">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: themeColor }} className="text-white px-4 py-2 rounded-lg text-sm">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <SectionCard title="Basic Information">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16">
            {isUploadingPic && <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-10 text-white text-xs">...</div>}
            {bp?.profile_picture_url ? (
              <img src={bp.profile_picture_url} alt="profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div style={{ backgroundColor: themeColor }} className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {bp?.first_name?.[0]}{bp?.last_name?.[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 cursor-pointer shadow">
              <span className="text-xs">📷</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePicUpload} disabled={isUploadingPic} />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{bp?.first_name} {bp?.last_name}</p>
            <p className="text-sm text-gray-400">{bp?.email}</p>
            <span style={{ backgroundColor: themeColor }} className="text-white px-2 py-0.5 rounded-full text-xs mt-1 inline-block">Student</span>
          </div>
        </div>
      </SectionCard>

      {/* Academic Info (Student Specific) */}
      <SectionCard title="Academic Information">
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Roll Number" value={profile?.roll_number} />
          <InfoField label="Program" value={profile?.program?.name} />
          <InfoField label="Semester" value={profile?.semester} />
          <InfoField label="CGPA" value={profile?.cgpa} />
          <InfoField label="Batch" value={profile?.batch} />
          <InfoField label="Status" value={profile?.enrollment_status} />
        </div>
      </SectionCard>

      {/* Personal & Contact Info (Same as Admin/Faculty) */}
      <SectionCard title="Personal Information">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Father Name", field: "father_name" }, { label: "Date of Birth", field: "date_of_birth", type: "date" }, { label: "CNIC", field: "cnic" }].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 uppercase mb-1">{label}</label>
                <input type={type || "text"} value={formData.base_profile[field]} onChange={(e) => handleChange(field, e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Father Name" value={bp?.father_name} />
            <InfoField label="Date of Birth" value={bp?.date_of_birth} />
            <InfoField label="CNIC" value={bp?.cnic} />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Contact Information">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Phone", field: "phone_number" }, { label: "Emergency", field: "emergency_contact" }].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 uppercase mb-1">{label}</label>
                <input type="text" value={formData.base_profile[field]} onChange={(e) => handleChange(field, e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Phone" value={bp?.phone_number} />
            <InfoField label="Emergency" value={bp?.emergency_contact} />
            <InfoField label="Address" value={bp?.address} />
          </div>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Documents">
        <form onSubmit={handleDocUpload} className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
          <select value={docForm.document_type} onChange={(e) => setDocForm(p => ({ ...p, document_type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Type</option>
            <option value="cnic">CNIC</option>
            <option value="transcript">Transcript</option>
            <option value="other">Other</option>
          </select>
          <input type="text" value={docForm.title} onChange={(e) => setDocForm(p => ({ ...p, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Title" />
          <input type="file" onChange={(e) => setDocForm(p => ({ ...p, file: e.target.files[0] }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" disabled={isUploadingDoc} style={{ backgroundColor: themeColor }} className="text-white rounded-lg text-sm">
            {isUploadingDoc ? "..." : "Upload"}
          </button>
        </form>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="text-xs text-gray-400 uppercase">{doc.document_type}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleViewDoc(doc)} className="text-xs text-blue-500">View</button>
                <button onClick={() => handleDocDelete(doc.id)} className="text-xs text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default StudentProfilePage;