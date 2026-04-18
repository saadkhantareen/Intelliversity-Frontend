# Bulk Upload User Interface

## Overview
The bulk upload feature provides administrators with a centralized view to parse, manage, and push CSV/Excel lists of users up to the backend for fast onboarding. 

## Key Components

### 1. View & Navigation (`BulkUploadPage.jsx`)
Located in `src/pages/admin/BulkUploadPage.jsx`.
- Placed behind administrative authentication boundaries in the React Router (`App.jsx`).
- Uses standard layout components for header and sidebar consistency within the `admin` portal logic.

### 2. Interaction Flow
The page abstracts away complex validation through a multi-step component:
- **Template Download**: A prominent button triggers a `GET` request leveraging `userService.downloadBulkTemplate()` to retrieve the pre-formatted CSV structure from the backend template API.
- **File Selection**: Implements drag-and-drop or manual click selection. Accepts strictly `.csv`, `.xls`, or `.xlsx`.
- **Upload Parsing**: Uses Javascript FormData to bundle the file and submit it cleanly.
- **Response Handling**: The backend returns individual status lines per row. The UI unpacks the array of `success/error` statuses into a unified table to let the administrator visually verify which emails were fully parsed and which were rejected.

### 3. API Integration (`user.service.js`)
Service layer functions extend `api.js` automatically applying JWT bearer headers.
- **`bulkUpload(file)`**: Passes the raw file in a `multipart/form-data` payload. Handles edge-case timeout requirements or network boundaries gracefully.
- **`downloadBulkTemplate()`**: Fetches `blob` typed network streams directly and forces the browser to engage its native 'Save As' dialogue dynamically.

## Common Testing Scenarios & Constraints
- Only valid portal supervisors typically possess enough API authority to post to `/api/v1/profiles/bulk-upload/`.
- Large file uploads (>1000 users) may face latency; the service and UI use loading spinners to indicate an active processing state while `bulk_processor.py` (Backend) iterates the rows.
