import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import PortalRouter from './PortalRouter';
import ProfileRouter from './ProfileRouter';

import DashboardRouter from './DashboardRouter';
import CoursesRouter from './CoursesRouter';

// Public pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

// Error pages
const PortalNotFound = lazy(() => import('@/app/pages/errors/PortalNotFound'));
const PageNotFound = lazy(() => import('@/app/pages/errors/PageNotFound'));

// Academic Year
const AcademicYearList = lazy(() => import('@/features/academic-year/pages/AcademicYearList'));
const AcademicYearForm = lazy(() => import('@/features/academic-year/pages/AcademicYearForm'));

// Batches
const BatchList = lazy(() => import('@/features/batches/pages/BatchList'));
const BatchForm = lazy(() => import('@/features/batches/pages/BatchForm'));

// Courses
const CourseList = lazy(() => import('@/features/courses/pages/admin/CourseList'));
const CourseForm = lazy(() => import('@/features/courses/pages/admin/CourseForm'));
const RegisteredCourses = lazy(() => import('@/features/courses/pages/student/RegisteredCourses'));

// Curriculum
const CurriculumList = lazy(() => import('@/features/curriculum/pages/CurriculumList'));
const CurriculumForm = lazy(() => import('@/features/curriculum/pages/CurriculumForm'));

// Departments
const DepartmentList = lazy(() => import('@/features/departments/pages/DepartmentList'));
const DepartmentForm = lazy(() => import('@/features/departments/pages/DepartmentForm'));

// Programs
const ProgramList = lazy(() => import('@/features/programs/pages/ProgramList'));
const ProgramForm = lazy(() => import('@/features/programs/pages/ProgramForm'));

// Terms
const TermList = lazy(() => import('@/features/terms/pages/TermList'));
const TermForm = lazy(() => import('@/features/terms/pages/TermForm'));

// Enrollments / Course Offerings
const CourseOfferingList = lazy(() => import('@/features/enrollments/pages/CourseOfferingList'));
const CourseOfferingForm = lazy(() => import('@/features/enrollments/pages/CourseOfferingForm'));

// Examinations / Assessment Types & Policies
const AssessmentTypesPage = lazy(() => import('@/features/examination/pages/AssessmentTypesPage'));
const AssessmentPoliciesPage = lazy(() => import('@/features/examination/pages/AssessmentPoliciesPage'));
const GradePoliciesPage = lazy(() => import('@/features/examination/pages/GradePoliciesPage'));
const GradeScalesPage = lazy(() => import('@/features/examination/pages/GradeScalesPage'));

// Users / Profile
const StudentsPage = lazy(() => import('@/features/profile/pages/StudentsPage'));
const FacultyPage = lazy(() => import('@/features/profile/pages/FacultyPage'));
const StudentForm = lazy(() => import('@/features/profile/pages/StudentForm'));
const FacultyForm = lazy(() => import('@/features/profile/pages/FacultyForm'));

// Loading
function FullScreenLoader({ text = 'Loading...' }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

// Protected routes
function ProtectedAppRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<PortalRouter />}>
        {/* Shared */}
        <Route path="/profile" element={<ProfileRouter />} />
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Courses */}
        <Route path="/courses" element={<CoursesRouter />} />

        {/* Academic Years */}
        <Route path="/academics/academic-years" element={<AcademicYearList />} />
        <Route path="/academics/academic-years/create" element={<AcademicYearForm />} />
        <Route path="/academics/academic-years/edit/:id" element={<AcademicYearForm />} />

        {/* Terms */}
        <Route path="/academics/terms" element={<TermList />} />
        <Route path="/academics/terms/create" element={<TermForm />} />
        <Route path="/academics/terms/edit/:id" element={<TermForm />} />

        {/* Departments */}
        <Route path="/academics/departments" element={<DepartmentList />} />
        <Route path="/academics/departments/create" element={<DepartmentForm />} />
        <Route path="/academics/departments/edit/:id" element={<DepartmentForm />} />

        {/* Programs */}
        <Route path="/academics/programs" element={<ProgramList />} />
        <Route path="/academics/programs/create" element={<ProgramForm />} />
        <Route path="/academics/programs/edit/:id" element={<ProgramForm />} />

        {/* Courses */}
        <Route path="/academics/courses" element={<CourseList />} />
        <Route path="/academics/courses/create" element={<CourseForm />} />
        <Route path="/academics/courses/edit/:id" element={<CourseForm />} />

        {/* Curriculums */}
        <Route path="/academics/curriculums" element={<CurriculumList />} />
        <Route path="/academics/curriculums/create" element={<CurriculumForm />} />
        <Route path="/academics/curriculums/edit/:id" element={<CurriculumForm />} />

        {/* Batches */}
        <Route path="/academics/batches" element={<BatchList />} />
        <Route path="/academics/batches/create" element={<BatchForm />} />
        <Route path="/academics/batches/edit/:id" element={<BatchForm />} />

        {/* Enrollments / Course Offerings */}
        <Route path="/enrollments/course-offerings" element={<CourseOfferingList />} />
        <Route path="/enrollments/course-offerings/create" element={<CourseOfferingForm />} />
        <Route path="/enrollments/course-offerings/edit/:id" element={<CourseOfferingForm />} />

        {/* Examinations */}
        <Route path="/examinations/assessment-types" element={<AssessmentTypesPage />} />
        <Route path="/examinations/assessment-policies" element={<AssessmentPoliciesPage />} />
        <Route path="/examinations/grade-policies" element={<GradePoliciesPage />} />
        <Route path="/examinations/grade-scales" element={<GradeScalesPage />} />


        {/* Students */}
        <Route path="/users/students" element={<StudentsPage />} />
        <Route path="/users/students/create" element={<StudentForm />} />

        {/* Faculty */}
        <Route path="/users/faculty" element={<FacultyPage />} />
        <Route path="/users/faculty/create" element={<FacultyForm />} />

        {/* Student */}
        <Route path="/registered-courses" element={<RegisteredCourses />} />
      </Route>
    </Route>
  );
}

// Root router
export default function AppRouter() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />

        {/* Protected */}
        {ProtectedAppRoutes()}

        {/* Errors */}
        <Route path="/portal-not-found" element={<PortalNotFound />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}