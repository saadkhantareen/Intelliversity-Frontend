# Admin Academic Pages Feature

## Overview

The Admin Academic Pages feature provides a complete CRUD interface for managing academic entities: Departments, Programs, Courses, and Curriculum. This feature was implemented across 6 chunks with full API integration, validation, and professional UI/UX patterns.

**Status**: ✅ **Complete and Functional** as of April 28, 2026

---

## Architecture

### Layer Structure

```
Frontend Layers
├── Pages (CRUD UI)
│   ├── DepartmentsPage.jsx (251 lines)
│   ├── ProgramsPage.jsx (341 lines)
│   ├── CoursesPage.jsx (336 lines)
│   └── CurriculumPage.jsx (251 lines)
│
├── Services (API abstraction)
│   ├── department.service.js (5 functions)
│   ├── program.service.js (5 functions)
│   ├── course.service.js (6 functions)
│   └── curriculum.service.js (5 functions)
│
├── Shared Components
│   └── Modal.jsx (Reusable form/confirmation modal)
│
├── Layout (Navigation)
│   └── AdminLayout.jsx (Sidebar with 3 sections)
│
└── Infrastructure
    ├── App.jsx (Routes & lazy imports)
    └── api.js (JWT interceptor & base config)
```

---

## Routes & Navigation

### Route Definitions (src/App.jsx)

```javascript
// Lazy imports
const DepartmentsPage = lazy(() => import("@/pages/admin/DepartmentsPage"));
const ProgramsPage = lazy(() => import("@/pages/admin/ProgramsPage"));
const CoursesPage = lazy(() => import("@/pages/admin/CoursesPage"));
const CurriculumPage = lazy(() => import("@/pages/admin/CurriculumPage"));
const ComingSoon = lazy(() => import("@/pages/admin/ComingSoon"));

// Protected Routes
<Route path="/departments" element={<DepartmentsPage />} />
<Route path="/programs" element={<ProgramsPage />} />
<Route path="/courses" element={<CoursesPage />} />
<Route path="/curriculum" element={<CurriculumPage />} />
<Route path="/analytics" element={<ComingSoon />} />
<Route path="/settings" element={<ComingSoon />} />
```

### Sidebar Navigation (AdminLayout.jsx)

Three distinct sections in the admin portal sidebar:

#### 1. Academics Section (NEW)
- **Departments** → `/departments`
- **Programs** → `/programs`
- **Courses** → `/courses`
- **Curriculum** → `/curriculum`

#### 2. Management Section
- Dashboard → `/dashboard`
- Profile → `/profile`
- Users → `/users`
- Bulk Upload → `/users/bulk-upload`
- Announcements → `/announcements`

#### 3. System Section
- Analytics → `/analytics` (ComingSoon)
- Tenants → `/tenants`
- Settings → `/settings` (ComingSoon)

---

## Service Layer

### API Configuration

All academic services use the shared axios instance from `src/services/api.js`:

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:8000`,
});

// JWT Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (401 handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export const api; // Named export
```

### Service Functions

#### Department Service (`department.service.js`)
```javascript
import { api } from './api';
const BASE = '/api/v1/academics/departments';

export const getDepartments();    // GET /
export const getDepartment(id);   // GET /:id/
export const createDepartment(data);  // POST /
export const updateDepartment(id, data);  // PATCH /:id/
export const deleteDepartment(id);    // DELETE /:id/
```

#### Program Service (`program.service.js`)
```javascript
import { api } from './api';
const BASE = '/api/v1/academics/programs';

export const getPrograms();       // GET /
export const getProgram(id);      // GET /:id/
export const createProgram(data);     // POST /
export const updateProgram(id, data);     // PATCH /:id/
export const deleteProgram(id);       // DELETE /:id/
```

#### Course Service (`course.service.js`)
```javascript
import { api } from './api';
const BASE = '/api/v1/academics/courses';

export const getCourses();           // GET /
export const getCourse(id);          // GET /:id/
export const createCourse(data);         // POST /
export const updateCourse(id, data);         // PATCH /:id/
export const deleteCourse(id);           // DELETE /:id/
export const getCoursePrereqs(id);       // GET /:id/prerequisites/
```

#### Curriculum Service (`curriculum.service.js`)
```javascript
import { api } from './api';
const BASE = '/api/v1/academics/curriculum';

export const getCurriculums();        // GET /
export const getCurriculum(id);       // GET /:id/
export const createCurriculum(data);      // POST /
export const updateCurriculum(id, data);      // PATCH /:id/
export const deleteCurriculum(id);        // DELETE /:id/
```

---

## Page Components

### Departments Page (251 lines)

**Purpose**: CRUD for academic departments (foundational entity)

**Form Fields**:
| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Code | Text | Yes |
| Description | Textarea | No |

**Features**:
- ✅ Load departments on mount
- ✅ Create new department via modal
- ✅ Edit existing department (pre-filled form)
- ✅ Delete with confirmation modal
- ✅ Loading, empty, and error states
- ✅ Toast notifications for all actions
- ✅ Responsive card layout

### Programs Page (341 lines)

**Purpose**: CRUD for degree programs (linked to departments)

**Form Fields**:
| Field | Type | Required | Source |
|-------|------|----------|--------|
| Name | Text | Yes | User |
| Code | Text | Yes | User |
| Degree Level | Select | Yes | Hardcoded (UG, PG, PHD, DIP) |
| Department | Select | Yes | API (getDepartments) |
| Total Credits | Number | Yes | User (1-∞) |
| No. of Semesters | Number | Yes | User (1-∞) |

**Features**:
- ✅ Parallel load: programs + departments
- ✅ 2-column form grid layout
- ✅ Display department name instead of ID
- ✅ Degree level enum conversion (UG→'Undergraduate (BS)')
- ✅ Number type conversion before API submission
- ✅ Full CRUD with validation

### Courses Page (336 lines)

**Purpose**: CRUD for courses (linked to departments, with optional filtering)

**Form Fields**:
| Field | Type | Required | Source |
|-------|------|----------|--------|
| Name | Text | Yes | User |
| Code | Text | Yes | User |
| Credits | Number | Yes | User (1-10) |
| Department | Select | Yes | API (getDepartments) |
| Description | Textarea | Yes | User |

**Unique Features**:
- ✅ **Department Filter Dropdown** - Client-side filtering of list
- ✅ "All Departments" option resets filter
- ✅ Count updates dynamically based on filter
- ✅ Department name resolution from ID

### Curriculum Page (251 lines)

**Purpose**: CRUD for curriculum (linked to programs)

**Form Fields**:
| Field | Type | Required | Source |
|-------|------|----------|--------|
| Name | Text | Yes | User |
| Program | Select | Yes | API (getPrograms) |

**Features**:
- ✅ Simplest page (only 2 fields)
- ✅ Program dropdown populated from API
- ✅ Display program name instead of ID
- ✅ Full CRUD

---

## Shared Components

### Modal.jsx

Reusable modal component used across all 4 academic pages for create/edit forms and delete confirmations.

```jsx
Props:
- isOpen (boolean): Controls visibility
- onClose (function): Called when X button clicked
- title (string): Header text
- children (node): Modal body content

Features:
- Fixed positioning (z-50)
- Semi-transparent backdrop
- White card with rounded corners
- Smooth animations
```

### DashboardPage.jsx (Admin)

Professional admin dashboard with demo data and chart components:

```jsx
Components:
- StatCard: 4-column card grid (Students, Faculty, Courses, Departments)
- MiniBarChart: Vertical bar chart for monthly enrollments
- HorizontalBarChart: Horizontal bar chart for department distribution
- Recent Activity: Timeline feed with 5 sample activities

Features:
- 100% responsive (mobile → 4-column desktop)
- Hover effects and smooth animations
- Emoji icons for visual appeal
- Ready for API integration (commented code included)
```

---

## State Management Pattern

All pages follow the same React hooks pattern:

```javascript
const [data, setData] = useState([]);              // Main entity list
const [loading, setLoading] = useState(true);      // Initial fetch
const [showForm, setShowForm] = useState(false);   // Modal visibility
const [editTarget, setEditTarget] = useState(null); // Edit mode
const [deleteTarget, setDeleteTarget] = useState(null); // Delete target
const [form, setForm] = useState(EMPTY_FORM);     // Form fields
const [saving, setSaving] = useState(false);      // Submit loading

// Parallel data loading
const load = async () => {
  const [res1, res2] = await Promise.all([api1(), api2()]);
};

// Form control helper
const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

// CRUD operations
handleSubmit() → create or update
handleDelete() → delete with confirmation
openCreate() → reset form, open modal
openEdit(item) → pre-fill form, open modal
```

---

## UI/UX Patterns

### Consistent Styling
- **Amber 500 accent** for admin portal (`bg-amber-500 hover:bg-amber-600`)
- **Tailwind CSS** for all styling
- **Responsive grid layouts** (mobile-first approach)
- **Card-based design** with subtle shadows and hover effects

### User Feedback
- ✅ Toast notifications (react-hot-toast)
  - "Entity created"
  - "Entity updated"
  - "Entity deleted"
  - "Failed to load data"
  - "Save failed"
  - "Delete failed"

- ✅ Loading states
  - "Loading..." centered text during fetch
  - Disabled submit button with "Saving..." text

- ✅ Empty states
  - Message specific to context (e.g., "No departments yet")
  - Clear call-to-action (+ New button)

- ✅ Modal states
  - Form modal for create/edit
  - Confirmation modal for delete
  - Both modals can be closed via X or Cancel button

### Accessibility
- Required fields marked with red asterisk (*)
- Form labels associated with inputs
- Keyboard navigation (Tab, Enter)
- Color contrast meets WCAG standards
- Focus ring on inputs (focus:ring-2)

---

## Data Flow

### Create Flow
```
User clicks "+ New Entity"
  ↓
openCreate() → reset form, open modal
  ↓
User fills form and clicks Create
  ↓
handleSubmit() → number conversion → createXXX(payload)
  ↓
API POST → 201 Created
  ↓
Toast "Entity created" → load() → re-fetch list → close modal
```

### Edit Flow
```
User clicks Edit on row
  ↓
openEdit(item) → pre-fill form with item data, open modal
  ↓
User modifies fields and clicks Update
  ↓
handleSubmit() → detectEditTarget → updateXXX(id, payload)
  ↓
API PATCH → 200 OK
  ↓
Toast "Entity updated" → load() → re-fetch list → close modal
```

### Delete Flow
```
User clicks Delete on row
  ↓
setDeleteTarget(item) → open confirmation modal
  ↓
User clicks Delete in confirmation
  ↓
handleDelete() → deleteXXX(id)
  ↓
API DELETE → 204 No Content
  ↓
Toast "Entity deleted" → load() → re-fetch list → close modal
```

---

## Error Handling

### API Errors
```javascript
try {
  // API call
} catch (err) {
  // Try to extract backend error detail
  toast.error(err.response?.data?.detail || 'Save failed');
}
```

### 401 Unauthorized
- Handled by response interceptor in `api.js`
- Clears token from localStorage
- Redirects to `/login`

### Network Errors
- Caught in try/catch blocks
- Generic error toast shown
- Page remains functional

---

## Future Enhancements

### When Backend Provides Endpoints:
- [ ] Replace demo data in DashboardPage with real API calls
- [ ] Add course prerequisites management endpoint
- [ ] Add bulk operations (multi-select delete)
- [ ] Add export functionality (CSV, PDF)
- [ ] Add sorting and pagination
- [ ] Add search across entity lists
- [ ] Add audit logs (who changed what, when)

### Frontend Improvements:
- [ ] Undo/Redo functionality
- [ ] Optimistic UI updates (show change before confirmation)
- [ ] Debounced search
- [ ] Advanced filtering (multi-select, date range)
- [ ] Inline editing mode
- [ ] Keyboard shortcuts (Del for delete, Esc to close, etc.)

---

## Testing Checklist

### Unit/Integration Tests (Not yet implemented):
- [ ] Service functions call correct endpoints
- [ ] Form validation prevents invalid submissions
- [ ] Modal open/close states work correctly
- [ ] Number conversion handles edge cases
- [ ] Error handling shows appropriate messages

### Manual Testing:
- ✅ All 4 pages load without errors
- ✅ CRUD operations work (create, read, update, delete)
- ✅ Forms validate required fields
- ✅ Modals open and close correctly
- ✅ Toast notifications appear
- ✅ Loading states display
- ✅ Empty states display when no data
- ✅ Department filter works
- ✅ Responsive layout on mobile/tablet/desktop
- ✅ JWT token attached to all requests
- ✅ 401 redirects to login

---

## Known Issues & Fixes

### Fixed Issues:
1. ✅ **Import Statement Error** (Fixed)
   - Service files were using `import api from './api'` (default)
   - Corrected to `import { api } from './api'` (named export)
   - Matches api.js which exports both named and default

2. ✅ **Dashboard Route Conflict** (Fixed)
   - App.jsx was importing student DashboardPage for all portals
   - Created DashboardRouter function to switch between admin/student
   - Admin now sees professional analytics dashboard

---

## Implementation Timeline

| Chunk | Task | Lines | Status |
|-------|------|-------|--------|
| 1 | Foundation (api.js, Modal, ComingSoon) | 50 | ✅ Complete |
| 2 | Service layer (4 files × 5-6 functions) | 40 | ✅ Complete |
| 3 | Layout & Routes (AdminLayout, App) | 80 | ✅ Complete |
| 4 | DepartmentsPage | 251 | ✅ Complete |
| 5 | ProgramsPage | 341 | ✅ Complete |
| 6 | CoursesPage + CurriculumPage | 587 | ✅ Complete |
| — | Import Fixes | 4 | ✅ Complete |
| — | Dashboard Integration | 227 | ✅ Complete |
| **TOTAL** | **Admin Academic Feature** | **~1,580** | **✅ COMPLETE** |

---

## Deployment Checklist

Before production deployment:

- [ ] Verify backend endpoints match documented contracts
- [ ] Test with real data (not demo data)
- [ ] Verify API error messages are user-friendly
- [ ] Set up analytics tracking
- [ ] Test on all target browsers
- [ ] Verify mobile responsiveness
- [ ] Set up error logging/monitoring
- [ ] Configure CORS properly
- [ ] Review security (no credentials in logs, XSS protection, etc.)
- [ ] Performance test (load times, bundle size)

