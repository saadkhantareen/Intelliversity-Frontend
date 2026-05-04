import React, { useEffect, useState } from "react";
import ProfileService from "../../services/profile.service";

const FacultyProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ── Document Handlers ──────────────────────────────────────────────────

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // Matching your Serializer fields:
    formData.append("file", file); 
    formData.append("title", file.name); 
    formData.append("document_type", "other"); 
    formData.append("description", "Uploaded via faculty portal");

    try {
      setUploading(true);
      await ProfileService.saveDocument(formData);
      
      // Refresh the list
      const updatedDocs = await ProfileService.getMyDocuments();
      setDocuments(updatedDocs);
      alert("Document uploaded successfully!");
      
      // Reset the file input
      e.target.value = null;
    } catch (error) {
      console.error("Upload Error Details:", error.response?.data);
      alert(
        error.response?.data?.detail || 
        "Upload failed. Ensure backend has MultiPartParser enabled."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await ProfileService.deleteDocument(docId);
      setDocuments(documents.filter((doc) => doc.id !== docId));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading Profile...</div>;
  if (!profileData) return <div style={{ padding: "20px" }}>No profile found.</div>;

  const { base_profile, registration_id } = profileData;
  const { user } = base_profile;

  return (
    <div style={{ maxWidth: "650px", margin: "20px auto", fontFamily: "Arial", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#fff" }}>
      
      {/* ── PROFILE SECTION ── */}
      <h2 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px", marginTop: 0 }}>Faculty Profile</h2>
      
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <img 
          src={base_profile.profile_picture_public_id || "https://via.placeholder.com/100"} 
          alt="Profile" 
          style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
        />
        <div>
          <h3 style={{ margin: "0 0 5px 0" }}>{user.first_name} {user.last_name}</h3>
          <p style={{ margin: "3px 0" }}><strong>Reg ID:</strong> {registration_id}</p>
          <p style={{ margin: "3px 0" }}><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
        <div>
          <p><strong>Father's Name:</strong> {base_profile.father_name}</p>
          <p><strong>DOB:</strong> {base_profile.date_of_birth}</p>
          <p><strong>Gender:</strong> {base_profile.gender}</p>
          <p><strong>CNIC:</strong> {base_profile.cnic}</p>
        </div>
        <div>
          <p><strong>Nationality:</strong> {base_profile.nationality}</p>
          <p><strong>Religion:</strong> {base_profile.religion}</p>
          <p><strong>Phone:</strong> {base_profile.phone_number}</p>
          <p><strong>City:</strong> {base_profile.city}</p>
        </div>
      </div>

      <div style={{ marginTop: "15px", padding: "12px", background: "#f9f9f9", borderRadius: "4px", fontSize: "14px" }}>
        <p style={{ margin: "0 0 5px 0" }}><strong>Bio:</strong> {base_profile.bio}</p>
        <p style={{ margin: 0 }}><strong>Address:</strong> {base_profile.address}, {base_profile.country}</p>
      </div>

      {/* ── DOCUMENT SECTION ── */}
      <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #eee" }}>
        <h3 style={{ marginBottom: "15px" }}>Document Management</h3>
        
        {/* Upload Box */}
        <div style={{ marginBottom: "20px", padding: "15px", border: "1px dashed #007bff", borderRadius: "6px", backgroundColor: "#f0f7ff" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>
            Upload New File:
          </label>
          <input 
            type="file" 
            onChange={handleFileUpload} 
            disabled={uploading} 
            style={{ fontSize: "13px" }}
          />
          {uploading && <span style={{ marginLeft: "10px", color: "#007bff", fontSize: "13px" }}>Processing...</span>}
        </div>

        {/* Documents List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #eee", borderRadius: "6px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                    {doc.title || "Untitled Document"}
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: "#007bff", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}
                    >
                      View File
                    </a>
                    <span style={{ 
                      fontSize: "11px", 
                      padding: "2px 6px", 
                      borderRadius: "10px",
                      backgroundColor: doc.is_verified ? "#d4edda" : "#fff3cd",
                      color: doc.is_verified ? "#155724" : "#856404"
                    }}>
                      {doc.is_verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteDoc(doc.id)}
                  style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: "#999", fontSize: "14px", textAlign: "center", padding: "20px" }}>
              No documents found. Upload your degrees or certificates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyProfilePage;