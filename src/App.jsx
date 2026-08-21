import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useTenant } from './context/TenantContext';
import { useBrandingEffects } from '@/hooks/useBrandingEffects';
import AttendanceRoutes from './routes/AttendanceRoutes';

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Shared Pages
const PortalNotFound = lazy(() => import('@/pages/errors/PortalNotFound'));
const PageNotFound = lazy(() => import('@/pages/errors/PageNotFound'));

// Student Pages
const DashboardPage = lazy(() => import('@/pages/student/DashboardPage'));
const DashboardRouter = lazy(() => import('@/routes/DashboardRouter'));
const CoursesRouter = lazy(() => import('@/routes/CoursesRouter'));
const StudentProfilePage = lazy(() => import('@/pages/student/StudentProfilePage'));
const RegisteredCourses = lazy(() => import('@/pages/student/RegisteredCourses'));
const RegistrationCard = lazy(() => import('@/pages/student/RegistrationCard'));
const FeesPage = lazy(() => import('@/pages/student/FeesPage'));
const ResultCardPage = lazy(() => import('@/pages/student/ResultCardPage'));
const SoSPage = lazy(() => import('@/pages/student/SoSPage'));

// Faculty & Admin
// const FacultyProfilePage = lazy(() => import("@/pages/faculty/FacultyProfilePage"));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));
const UsersPage = lazy(() => import('@/pages/admin/UserPage'));
const UserDetailPage = lazy(() => import('@/pages/admin/UserDetailPage'));
const FacultyProfilePage = lazy(() => import('@/pages/faculty/FacultyProfilePage'));

// New Admin Pages from image
const AdminDashboardPage = lazy(() => import('@/pages/admin/Dashboard'));
const DepartmentList = lazy(() => import('@/pages/admin/DepartmentList'));
const DepartmentForm = lazy(() => import('@/pages/admin/DepartmentForm'));
const ProgramList = lazy(() => import('@/pages/admin/ProgramList'));
const ProgramForm = lazy(() => import('@/pages/admin/ProgramForm'));
const CourseList = lazy(() => import('@/pages/admin/CourseList'));
const CourseForm = lazy(() => import('@/pages/admin/CourseForm'));
const CurriculumList = lazy(() => import('@/pages/admin/CurriculumList'));
const CurriculumForm = lazy(() => import('@/pages/admin/CurriculumForm'));
const BatchForm = lazy(() => import('@/pages/admin/BatchForm'));
const BatchList = lazy(() => import('@/pages/admin/BatchList'));
const AcademicYearList = lazy(() => import('@/pages/admin/AcademicYearList'));
const AcademicYearForm = lazy(() => import('@/pages/admin/AcademicYearForm'));
const TermList = lazy(() => import('@/pages/admin/TermList'));
const TermForm = lazy(() => import('@/pages/admin/TermForm'));
const StudentForm = lazy(() => import('@/pages/admin/StudentForm'));
const FacultyForm = lazy(() => import('@/pages/admin/FacultyForm'));
const StudentsPage = lazy(() => import('@/pages/admin/StudentsPage'));
const FacultyPage = lazy(() => import('@/pages/admin/FacultyPage'));
// const AdminProfile = lazy(() => import("@/pages/admin/AdminProfilePage"));

const CourseDetailLayout = lazy(() => import('@/components/layout/CourseDetailLayout'));

// Layouts
const StudentLayout = lazy(() => import('@/components/layout/StudentLayout'));
const FacultyLayout = lazy(() => import('@/components/layout/FacultyLayout'));
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));

function FullScreenLoader({ text = 'Loading...' }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

function ProfileRouter() {
  const { tenant } = useTenant();
  switch (tenant?.portal_name) {
    case 'student':
      return <StudentProfilePage />;
    case 'faculty':
      return <FacultyProfilePage />;
    case 'admin':
      return <AdminProfilePage />;
    default:
      return <PageNotFound />;
  }
}

function PortalLayoutRouter() {
  const { tenant, isTenantLoading, error } = useTenant();
  if (isTenantLoading) return <FullScreenLoader text="Loading portal..." />;
  if (error || !tenant) return <PortalNotFound />;

  switch (tenant.portal_name) {
    case 'student':
      return <StudentLayout />;
    case 'faculty':
      return <FacultyLayout />;
    case 'admin':
      return <AdminLayout />;
    default:
      return <PortalNotFound />;
  }
}

function ProtectedAppRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<PortalLayoutRouter />}>
        {/* Shared Protected Routes */}
        <Route path="/profile" element={<ProfileRouter />} />

        {/* 
            Note: Since Dashboard is shared in the switch but routes are defined here, 
            you might want to handle which dashboard shows up. 
            Below, the Admin Dashboard is added to the admin section.
        */}
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Admin Specific Routes */}

        <Route path="/academics/departments" element={<DepartmentList />} />
        <Route path="/academics/departments/create" element={<DepartmentForm />} />
        <Route path="/academics/departments/edit/:id" element={<DepartmentForm />} />

        <Route path="/academics/programs" element={<ProgramList />} />
        <Route path="/academics/programs/create" element={<ProgramForm />} />
        <Route path="/academics/programs/edit/:id" element={<ProgramForm />} />

        <Route path="/academics/courses" element={<CourseList />} />
        <Route path="/academics/courses/create" element={<CourseForm />} />
        <Route path="/academics/courses/edit/:id" element={<CourseForm />} />

        <Route path="/academics/curriculums" element={<CurriculumList />} />
        <Route path="/academics/curriculums/create" element={<CurriculumForm />} />
        <Route path="/academics/curriculums/edit/:id" element={<CurriculumForm />} />

        <Route path="/academics/batches" element={<BatchList />} />
        <Route path="/academics/batches/create" element={<BatchForm />} />
        <Route path="/academics/batches/edit/:id" element={<BatchForm />} />

        <Route path="/academics/academic-years" element={<AcademicYearList />} />
        <Route path="/academics/academic-years/create" element={<AcademicYearForm />} />
        <Route path="/academics/academic-years/edit/:id" element={<AcademicYearForm />} />

        <Route path="/academics/terms" element={<TermList />} />
        <Route path="/academics/terms/create" element={<TermForm />} />
        <Route path="/academics/terms/edit/:id" element={<TermForm />} />

        {/* <Route path="/faculty/profile" element={<FacultyProfilePage />}/> */}

        <Route path="/users/students" element={<StudentsPage />} />
        <Route path="/users/faculty" element={<FacultyPage />} />

        {/* Attendance Module */}
        <Route path="/attendance/*" element={<AttendanceRoutes />} />
      </Route>
    </Route>
  );
}

export default function App() {
  useBrandingEffects();

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />
        {ProtectedAppRoutes()}
        <Route path="/portal-not-found" element={<PortalNotFound />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}
