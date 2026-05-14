import React, { useEffect, useState } from "react";
import { ProfileService } from "../../services/profile.service";
import { useCloudinary } from "../../hooks/useCloudinary";
import toast from "react-hot-toast";

const StudentProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  const { uploadToCloudinary, isUploading } = useCloudinary();

  const [docForm, setDocForm] = useState({
    document_type: "",
    title: "",
    file: null,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profileRes, docsRes] = await Promise.all([
          ProfileService.getMyProfile(),
          ProfileService.getMyDocuments(),
        ]);
        setProfileData(profileRes.profile);
        setDocuments(docsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docForm.file || !docForm.document_type || !docForm.title) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const { public_id, resource_type } = await uploadToCloudinary(
        docForm.file,
        "document",
      );
      await ProfileService.saveDocument({
        title: docForm.title,
        document_type: docForm.document_type,
        description: "",
        document_public_id: public_id,
        resource_type,
      });
      const updatedDocs = await ProfileService.getMyDocuments();
      setDocuments(updatedDocs);
      toast.success("Document uploaded successfully!");
      setDocForm({ document_type: "", title: "", file: null });
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleViewDoc = (doc) => {
    if (!doc.url) {
      toast.error("Document URL is not available.");
      return;
    }

    let fileType = doc.resource_type || "image";
    const urlStr = doc.url.toLowerCase();
    const titleStr = (doc.title || "").toLowerCase();

    if (urlStr.includes(".pdf") || titleStr.includes(".pdf")) {
      fileType = "pdf";
    }

    setPreviewDoc({
      id: doc.id,
      url: doc.url,
      type: fileType,
      title: doc.title || "Document Preview",
    });
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await ProfileService.deleteDocument(docId);
      setDocuments(documents.filter((doc) => doc.id !== docId));
      if (previewDoc?.id === docId) setPreviewDoc(null);
      toast.success("Document deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        <p className="animate-pulse">Loading Profile Data...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 font-medium">
        <p>No profile found.</p>
      </div>
    );
  }

  const {
    base_profile,
    roll_number,
    program,
    current_semester,
    cgpa,
    batch,
    section_name,
  } = profileData;
  const { user } = base_profile;

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 font-sans text-gray-800">
      {/* ── HEADER & PROFILE SUMMARY ── */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={
              base_profile.profile_picture_url ||
              "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />
        </div>

        <div className="text-center sm:text-left mt-2 flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.first_name} {user.last_name}
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-600 mb-3">
            <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              <strong className="text-gray-900">Roll No:</strong>{" "}
              {roll_number || "N/A"}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              <strong className="text-gray-900">Email:</strong> {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* ── ACADEMIC INFORMATION ── */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
          Academic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Program", value: program },
            { label: "Semester", value: current_semester },
            { label: "CGPA", value: cgpa },
            { label: "Batch", value: batch },
            { label: "Section", value: section_name },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                {label}
              </p>
              <p className="text-base text-gray-900 font-medium">
                {value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PERSONAL DETAILS ── */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
          Personal Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Father's Name", value: base_profile.father_name },
            { label: "Date of Birth", value: base_profile.date_of_birth },
            { label: "Gender", value: base_profile.gender },
            { label: "CNIC", value: base_profile.cnic },
            { label: "Nationality", value: base_profile.nationality },
            { label: "Religion", value: base_profile.religion },
            { label: "Phone Number", value: base_profile.phone_number },
            {
              label: "Emergency Contact",
              value: base_profile.emergency_contact,
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                {label}
              </p>
              <p className="text-base text-gray-900 font-medium">
                {value || "N/A"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-blue-50/50 rounded-xl border-l-4 border-blue-500">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            <strong className="text-gray-900 block mb-1">Biography</strong>
            {base_profile.bio || "No biography provided."}
          </p>
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900 mr-2">Location:</strong>
            {[base_profile.address, base_profile.city, base_profile.country]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </p>
        </div>
      </div>

      {/* ── DOCUMENT MANAGEMENT ── */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
          Documents & Certificates
        </h2>

        {/* Upload Form */}
        <form
          onSubmit={handleDocUpload}
          className="mb-8 p-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="flex flex-col items-center mb-4">
            <svg
              className="w-10 h-10 text-blue-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-blue-700 font-semibold text-lg">
              Upload a Document
            </p>
            <p className="text-sm text-blue-500 font-medium mt-1">
              Supports PDF, JPG, PNG (Max 5MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={docForm.document_type}
              onChange={(e) =>
                setDocForm((p) => ({ ...p, document_type: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Select Type</option>
              <option value="cnic">CNIC</option>
              <option value="transcript">Transcript</option>
              <option value="other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Document Title"
              value={docForm.title}
              onChange={(e) =>
                setDocForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            <div className="sm:col-span-2">
              <input
                type="file"
                onChange={(e) =>
                  setDocForm((p) => ({ ...p, file: e.target.files[0] }))
                }
                disabled={isUploading}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="sm:col-span-2 w-full py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {isUploading
                ? "Uploading to secure storage..."
                : "Upload Document"}
            </button>
          </div>
        </form>

        {/* Documents List */}
        <div className="flex flex-col gap-4">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="p-3 bg-gray-50 rounded-lg shrink-0">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {doc.title || "Untitled Document"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs uppercase text-gray-400 font-medium">
                        {doc.document_type}
                      </span>
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          doc.is_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.is_verified ? "✓ Verified" : "Pending Review"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button
                    onClick={() => handleViewDoc(doc)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">
                No documents found. Upload your certificates or transcripts
                above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── DOCUMENT PREVIEW MODAL ── */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                {previewDoc.title}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                title="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 bg-gray-100 p-4 md:p-8 flex justify-center items-center overflow-hidden">
              {previewDoc.type === "pdf" ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-full rounded-xl shadow-inner bg-white border-none"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
