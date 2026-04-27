# File Map and Responsibilities

## Root

- `package.json`:
  - Dependency and script manifest.
  - Scripts: `dev`, `build`, `lint`, `preview`.
- `vite.config.js`:
  - React plugin.
  - Dev server host + port (`5173`).
- `tailwind.config.js` + `postcss.config.js`:
  - Tailwind scanning and PostCSS plugin setup.

## Application Entry

- `src/main.jsx`:
  - Mounts React app.
  - Wrap order: `BrowserRouter` -> `TenantProvider` -> `AuthProvider` -> `App`.
  - Mounts `Toaster` globally.

- `src/App.jsx`:
  - Defines route graph and protected route nesting.

## Context Layer

- `src/context/TenantContext.jsx`:
  - Subdomain-based tenant detection and validation.

- `src/context/AuthContext.jsx`:
  - Auth state, persistence hydration, login/logout actions.

## Shared Components

- `src/components/shared/ProtectedRoute.jsx`:
  - Gate for authenticated routes.

## Layout Components

- `src/components/layout/DashboardShell.jsx`:
  - Main authenticated app chrome (responsive sidebar, topbar, outlet rendering).
  - Handles logout trigger and shows user/university metadata.

- `src/components/layout/StudentLayout.jsx`:
  - Student portal config wrapper around `DashboardShell`.

- `src/components/layout/FacultyLayout.jsx`:
  - Faculty portal config wrapper around `DashboardShell`.

- `src/components/layout/AdminLayout.jsx`:
  - Admin portal config wrapper with 3-section sidebar (Academics, Management, System).
  - Includes sidebar links to all 4 academic pages (Departments, Programs, Courses, Curriculum).

- `src/components/layout/icons.jsx`:
  - Shared icon primitives used by shell and nav config.

- `src/components/layout/PortalLayouts.jsx`:
  - Portal layout switcher mapping portal keys to portal wrapper components.

- `src/components/shared/Modal.jsx`:
  - Reusable modal component used across all academic pages for create/edit forms and delete confirmations.
  - Props: `isOpen`, `onClose`, `title`, `children`.

## Pages

### Auth Pages
- `src/pages/auth/LoginPage.jsx`:
  - Login form and post-login redirect.

- `src/pages/auth/ForgotPasswordPage.jsx`:
  - Forgot password request form and submitted state.

- `src/pages/auth/ResetPasswordPage.jsx`:
  - Token-based reset form.

### Dashboard Pages
- `src/pages/student/DashboardPage.jsx`:
  - Student portal dashboard.

- `src/pages/admin/DashboardPage.jsx`:
  - Admin dashboard with stat cards and charts (monthly enrollments, department distribution, recent activity).
  - Uses demo data, ready for API integration.

### Admin Academic Pages (NEW)
- `src/pages/admin/DepartmentsPage.jsx` (251 lines):
  - CRUD interface for managing academic departments.
  - Form fields: Name, Code, Description.
  - Features: List with cards, create/edit/delete modals, loading/empty states, toast notifications.

- `src/pages/admin/ProgramsPage.jsx` (341 lines):
  - CRUD interface for managing degree programs.
  - Form fields: Name, Code, Degree Level (dropdown), Department (dropdown), Total Credits, No. of Semesters.
  - Features: 2-column form grid, FK resolution (displays department name), number conversion.

- `src/pages/admin/CoursesPage.jsx` (336 lines):
  - CRUD interface for managing courses.
  - Form fields: Name, Code, Credits (1-10), Department (dropdown), Description.
  - Features: Department filter dropdown, client-side filtering, FK resolution.

- `src/pages/admin/CurriculumPage.jsx` (251 lines):
  - CRUD interface for managing curriculum.
  - Form fields: Name, Program (dropdown).
  - Features: Simplest page (2 fields), FK resolution (displays program name).

### Placeholder Pages
- `src/pages/admin/ComingSoon.jsx`:
  - Placeholder page for future features (Analytics, Settings).

- `src/pages/errors/PageNotFound.jsx`:
  - Fallback 404 page.

- `src/pages/errors/PortalNotFound.jsx`:
  - Portal detection failure page.

## Services

### API Infrastructure
- `src/services/api.js`:
  - Shared Axios instance with tenant-aware base URL, port 8000.
  - JWT request interceptor (adds Bearer token from localStorage).
  - 401 response interceptor (clears token, redirects to /login).
  - Exports: `export default api` and `export const api`.

### Authentication Service
- `src/services/auth.service.js`:
  - Authentication-related endpoint methods.

### Academic Services (NEW)
- `src/services/department.service.js`:
  - CRUD functions for departments.
  - Functions: `getDepartments()`, `getDepartment(id)`, `createDepartment(data)`, `updateDepartment(id, data)`, `deleteDepartment(id)`.
  - Endpoint: `/api/v1/academics/departments/`

- `src/services/program.service.js`:
  - CRUD functions for programs.
  - Functions: `getPrograms()`, `getProgram(id)`, `createProgram(data)`, `updateProgram(id, data)`, `deleteProgram(id)`.
  - Endpoint: `/api/v1/academics/programs/`

- `src/services/course.service.js`:
  - CRUD functions for courses (includes prerequisites endpoint).
  - Functions: `getCourses()`, `getCourse(id)`, `createCourse(data)`, `updateCourse(id, data)`, `deleteCourse(id)`, `getCoursePrereqs(id)`.
  - Endpoint: `/api/v1/academics/courses/`

- `src/services/curriculum.service.js`:
  - CRUD functions for curriculum.
  - Functions: `getCurriculums()`, `getCurriculum(id)`, `createCurriculum(data)`, `updateCurriculum(id, data)`, `deleteCurriculum(id)`.
  - Endpoint: `/api/v1/academics/curriculum/`

## Styling

- `src/index.css`:
  - Tailwind directives only.

- `src/App.css`:
  - Currently empty.
