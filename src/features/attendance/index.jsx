import { Navigate, Route, Routes } from "react-router-dom";

import usePortalRole from "@/shared/hooks/usePortalRole";

// Faculty
import FacultySessionsPage from "./pages/faculty/FacultySessionsPage";
import MarkAttendancePage from "./pages/faculty/MarkAttendancePage";
import CourseAttendanceSummaryPage from "./pages/faculty/CourseAttendanceSummaryPage";

// Student
import MyAttendancePage from "./pages/student/MyAttendancePage";

// Admin
import AttendanceHomePage from "./pages/admin/AttendanceHomePage";
import AttendancePoliciesPage from "./pages/admin/AttendancePoliciesPage";
import DefaultersReportPage from "./pages/admin/DefaultersReportPage";
import ComplianceReportPage from "./pages/admin/ComplianceReportPage";
import GenerateSessionsPage from "./pages/admin/GenerateSessionsPage";

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
