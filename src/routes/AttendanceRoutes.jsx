// src/routes/AttendanceRoutes.jsx
import { Navigate, Route, Routes } from "react-router-dom";

import usePortalRole from "../hooks/usePortalRole";

// Faculty
import FacultySessionsPage from "../pages/faculty/attendance/FacultySessionsPage";
import MarkAttendancePage from "../pages/faculty/attendance/MarkAttendancePage";
import CourseAttendanceSummaryPage from "../pages/faculty/attendance/CourseAttendanceSummaryPage";

// Student
import MyAttendancePage from "../pages/student/attendance/MyAttendancePage";

// Admin
import AttendanceHomePage from "../pages/admin/attendance/AttendanceHomePage";
import AttendancePoliciesPage from "../pages/admin/attendance/AttendancePoliciesPage";
import DefaultersReportPage from "../pages/admin/attendance/DefaultersReportPage";
import ComplianceReportPage from "../pages/admin/attendance/ComplianceReportPage";
import GenerateSessionsPage from "../pages/admin/attendance/GenerateSessionsPage";

export default function AttendanceRoutes() {
  const role = usePortalRole();

  if (role === "student") {
    return (
      <Routes>
        <Route index element={<MyAttendancePage />} />
        <Route path="*" element={<Navigate to="/attendance" replace />} />
      </Routes>
    );
  }

  if (role === "faculty") {
    return (
      <Routes>
        <Route index element={<FacultySessionsPage />} />
        <Route path="sessions" element={<FacultySessionsPage />} />
        <Route path="sessions/:sessionId/mark" element={<MarkAttendancePage />} />
        <Route path="course-summary" element={<CourseAttendanceSummaryPage />} />
        <Route path="*" element={<Navigate to="/attendance" replace />} />
      </Routes>
    );
  }

  // admin sees everything
  return (
    <Routes>
      <Route index element={<AttendanceHomePage />} />
      <Route path="policies" element={<AttendancePoliciesPage />} />
      <Route path="reports/defaulters" element={<DefaultersReportPage />} />
      <Route path="reports/compliance" element={<ComplianceReportPage />} />
      <Route path="course-summary" element={<CourseAttendanceSummaryPage />} />
      <Route path="sessions" element={<FacultySessionsPage />} />
      <Route path="sessions/:sessionId/mark" element={<MarkAttendancePage />} />
      <Route path="generate" element={<GenerateSessionsPage />} />
      <Route path="*" element={<Navigate to="/attendance" replace />} />
    </Routes>
  );
}
