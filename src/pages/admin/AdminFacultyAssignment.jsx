import React, { useState, useEffect } from "react";
import EnrollmentService from "../../services/enrollment.service";

const AdminFacultyAssignment = () => {
  const [sections, setSections] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [terms, setTerms] = useState([]);
  
  // Form State
  const [selectedSection, setSelectedSection] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [offeredCourses, setOfferedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [secData, facData, termData] = await Promise.all([
          EnrollmentService.getSections(),
          EnrollmentService.getAllFaculty(),
          EnrollmentService.getTerms()
        ]);
        setSections(secData);
        setFacultyList(facData);
        setTerms(termData);
        
        // Auto-select active term if available
        const active = termData.find(t => t.is_active);
        if (active) setSelectedTerm(active.id);
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    loadInitialData();
  }, []);

  const handleFetchCurriculum = async () => {
    if (!selectedSection || !semester) {
      alert("Please select a section and enter a semester number.");
      return;
    }
    setLoadingCourses(true);
    try {
      const data = await EnrollmentService.getCoursesForFacultyEnrollment(selectedSection, semester);
      setOfferedCourses(data);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to load curriculum courses.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleAssign = async (courseCode, facultyRegId) => {
    if (!facultyRegId) return alert("Select a faculty member first.");
    if (!selectedTerm) return alert("Select an academic term.");

    const payload = {
      faculty: facultyRegId,
      course: courseCode,
      term: selectedTerm,
      section: selectedSection
    };

    try {
      await EnrollmentService.assignCourseToFaculty(payload);
      alert(`Course ${courseCode} successfully assigned!`);
    } catch (err) {
      alert(err.response?.data?.detail || "Assignment failed. Perhaps teacher is already assigned?");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto", backgroundColor: "#fff" }}>
      <h2 style={{ marginBottom: "25px", color: "#1e293b" }}>Faculty Course Mapping</h2>

      {/* TOP FILTERS SECTION */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        padding: "20px", 
        background: "#f8fafc", 
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginBottom: "30px" 
      }}>
        <div>
          <label style={{ fontWeight: "600", fontSize: "13px", color: "#64748b", display: "block", marginBottom: "8px" }}>SECTION</label>
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          >
            <option value="">Select Section (e.g. BSCS-2A)</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.batch_name})</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "600", fontSize: "13px", color: "#64748b", display: "block", marginBottom: "8px" }}>SEMESTER</label>
          <input 
            type="number" 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g. 2"
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "600", fontSize: "13px", color: "#64748b", display: "block", marginBottom: "8px" }}>TERM</label>
          <select 
            value={selectedTerm} 
            onChange={(e) => setSelectedTerm(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          >
            <option value="">Select Term</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name} {t.is_active ? "(Active)" : ""}</option>)}
          </select>
        </div>

        <button 
          onClick={handleFetchCurriculum}
          style={{ alignSelf: "flex-end", height: "42px", background: "#4f46e5", color: "#white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
        >
          {loadingCourses ? "Loading..." : "Load Courses"}
        </button>
      </div>

      {/* DYNAMIC COURSES LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {offeredCourses.length > 0 ? (
          offeredCourses.map((item) => (
            <div key={item.course_id} style={{ 
              display: "grid", 
              gridTemplateColumns: "2fr 1fr 2fr 100px", 
              alignItems: "center", 
              gap: "20px", 
              padding: "15px 25px", 
              border: "1px solid #e2e8f0", 
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>COURSE</span>
                <span style={{ fontWeight: "600", color: "#334155" }}>{item.course_code} - {item.course_name}</span>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>SEMESTER</span>
                <span style={{ fontWeight: "600", color: "#334155" }}>{item.recommended_semester}</span>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>FACULTY MEMBER</span>
                <select 
                  id={`fac-select-${item.course_code}`}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.registration_id}>
                      {f.base_profile.user.first_name} {f.base_profile.user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => {
                  const facId = document.getElementById(`fac-select-${item.course_code}`).value;
                  handleAssign(item.course_code, facId);
                }}
                style={{ background: "#10b981", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                Assign
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "#94a3b8", border: "2px dashed #e2e8f0", borderRadius: "12px" }}>
            Select Section and Semester to load courses from Curriculum
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFacultyAssignment;