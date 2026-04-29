import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getCurriculums,
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from '@/services/curriculum.service';
import { getPrograms } from '@/services/program.service';
import { getCourses } from '@/services/course.service';
import { getDepartments } from '@/services/department.service';

const EMPTY_FORM = {
  name: '',
  program: '',
  courses: [],
};

const CurriculumPage = () => {
  // ──────── List State ────────
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);

  // ──────── Form State ────────
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ──────── Dropdown Data ────────
  const [programs, setPrograms] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingFormData, setLoadingFormData] = useState(false);

  // ──────── Delete State ────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ──────── View Detail State ────────
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  // ──────── Course Selection State ────────
  const [courseFilterDept, setCourseFilterDept] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);

  // ──────── Load Curriculum List ────────
  const load = async () => {
    try {
      setLoading(true);
      const [curRes, progRes] = await Promise.all([
        getCurriculums(),
        getPrograms(),
      ]);
      setCurriculums(curRes.data);
      setPrograms(progRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ──────── Load Form Dropdown Data ────────
  const loadFormData = async () => {
    setLoadingFormData(true);
    try {
      const [courseRes, deptRes] = await Promise.all([
        getCourses(),
        getDepartments(),
      ]);
      setAllCourses(courseRes.data);
      setDepartments(deptRes.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoadingFormData(false);
    }
  };

  // ──────── Open Create Form ────────
  const openCreate = async () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setCourseFilterDept('');
    setCourseSearch('');
    setSelectedSemester(1);
    setShowForm(true);
    await loadFormData();
  };

  // ──────── Open Edit Form ────────
  const openEdit = async (cur) => {
    setEditTarget(cur);
    setLoadingFormData(true);
    try {
      const [detailRes, courseRes, deptRes] = await Promise.all([
        getCurriculum(cur.id),
        getCourses(),
        getDepartments(),
      ]);
      const detail = detailRes.data;
      setAllCourses(courseRes.data);
      setDepartments(deptRes.data);
      setForm({
        name: detail.name,
        program: detail.program,
        courses: (detail.courses || []).map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          credits: c.credits,
          department: c.department,
          semester: c.semester || 1,
        })),
      });
      setCourseFilterDept('');
      setCourseSearch('');
      setSelectedSemester(1);
      setShowForm(true);
    } catch {
      toast.error('Failed to load curriculum details');
    } finally {
      setLoadingFormData(false);
    }
  };

  // ──────── View Curriculum Detail ────────
  const openView = async (cur) => {
    setViewTarget(cur);
    setLoadingView(true);
    try {
      const res = await getCurriculum(cur.id);
      setViewData(res.data);
    } catch {
      toast.error('Failed to load curriculum');
    } finally {
      setLoadingView(false);
    }
  };

  const closeView = () => {
    setViewTarget(null);
    setViewData(null);
  };

  // ──────── Cancel Form ────────
  const cancelForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  // ──────── Form Field Setter ────────
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ──────── Add Course to Curriculum ────────
  const addCourse = (course) => {
    setForm((f) => {
      const alreadyAdded = f.courses.find((c) => c.id === course.id);
      if (alreadyAdded) {
        toast.error('Course already added');
        return f;
      }
      return {
        ...f,
        courses: [
          ...f.courses,
          {
            id: course.id,
            name: course.name,
            code: course.code,
            credits: course.credits,
            department: course.department,
            semester: selectedSemester,
          },
        ],
      };
    });
  };

  // ──────── Remove Course from Curriculum ────────
  const removeCourse = (courseId) => {
    setForm((f) => ({
      ...f,
      courses: f.courses.filter((c) => c.id !== courseId),
    }));
  };

  // ──────── Change Course Semester ────────
  const changeCourseSemester = (courseId, semester) => {
    setForm((f) => ({
      ...f,
      courses: f.courses.map((c) =>
        c.id === courseId ? { ...c, semester: Number(semester) } : c
      ),
    }));
  };

  // ──────── Submit Form ────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.courses.length === 0) {
      toast.error('Add at least one course');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        program: Number(form.program),
        courses: form.courses.map((c) => ({
          course_id: c.id,
          semester: c.semester,
        })),
      };
      if (editTarget) {
        await updateCurriculum(editTarget.id, payload);
        toast.success('Curriculum updated');
      } else {
        await createCurriculum(payload);
        toast.success('Curriculum created');
      }
      cancelForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ──────── Delete Curriculum ────────
  const handleDelete = async () => {
    try {
      await deleteCurriculum(deleteTarget.id);
      toast.success('Curriculum deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  // ──────── Helpers ────────
  const progName = (id) =>
    programs.find((p) => p.id === id)?.name ?? '—';

  const deptName = (id) =>
    departments.find((d) => d.id === id)?.name ?? '—';

  // ──────── Filtered Courses for Selection ────────
  const filteredCourses = allCourses.filter((course) => {
    const matchesDept = courseFilterDept
      ? String(course.department) === courseFilterDept
      : true;
    const matchesSearch = courseSearch
      ? course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.code.toLowerCase().includes(courseSearch.toLowerCase())
      : true;
    return matchesDept && matchesSearch;
  });

  // ──────── Courses Grouped by Semester (for display) ────────
  const coursesBySemester = form.courses.reduce((acc, course) => {
    const sem = course.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(course);
    return acc;
  }, {});

  const totalCredits = form.courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ──────── Header ──────── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum</h1>
          <p className="text-sm text-gray-500 mt-1">
            {curriculums.length} curriculum
            {curriculums.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + New Curriculum
          </button>
        )}
      </div>

      {/* ──────── Delete Confirmation Banner ──────── */}
      {deleteTarget && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-red-800">
              Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 ml-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* ──────── Inline Form ──────── */}
      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            {editTarget ? `Edit: ${editTarget.name}` : 'New Curriculum'}
          </h3>

          {loadingFormData ? (
            <div className="text-center py-8 text-gray-400">Loading form data...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ── Left Column: Basic Info + Course Selection ── */}
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Curriculum Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={set('name')}
                      placeholder="e.g. BSCS 2024 Curriculum"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.program}
                      onChange={set('program')}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Select program</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add to Semester
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Search & Filter */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <select
                      value={courseFilterDept}
                      onChange={(e) => setCourseFilterDept(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Available Courses */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Click a course to add it to semester {selectedSemester}
                    </p>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md bg-white">
                      {filteredCourses.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No courses found</p>
                      ) : (
                        filteredCourses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => addCourse(course)}
                            className="w-full text-left px-3 py-2 hover:bg-amber-50 border-b border-gray-100 last:border-0 flex justify-between items-center transition-colors"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-800">
                                {course.code}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                {course.name}
                              </span>
                            </div>
                            <span className="text-xs text-amber-600 font-medium">
                              + Add
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{form.courses.length}</span> courses •
                      <span className="font-medium ml-1">{totalCredits}</span> credits
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelForm}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* ── Right Column: Semester-wise Course Preview ── */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  📋 Curriculum Preview
                </h4>
                {Object.keys(coursesBySemester).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Add courses from the left panel
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {Object.keys(coursesBySemester)
                      .sort((a, b) => a - b)
                      .map((sem) => (
                        <div key={sem}>
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-xs font-semibold text-amber-700 uppercase">
                              Semester {sem}
                            </h5>
                            <span className="text-xs text-gray-400">
                              {coursesBySemester[sem].reduce((s, c) => s + (c.credits || 0), 0)} cr
                            </span>
                          </div>
                          <div className="space-y-1">
                            {coursesBySemester[sem].map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
                              >
                                <div>
                                  <span className="font-medium text-gray-800">
                                    {course.code}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    {course.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={course.semester}
                                    onChange={(e) =>
                                      changeCourseSemester(course.id, e.target.value)
                                    }
                                    className="text-xs border border-gray-200 rounded px-1 py-0.5"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                      <option key={s} value={s}>
                                        Sem {s}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeCourse(course.id)}
                                    className="text-red-400 hover:text-red-600 text-lg leading-none"
                                    title="Remove course"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── Loading State ──────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : curriculums.length === 0 && !showForm ? (
        /* Empty State */
        <div className="text-center py-16 text-gray-400">
          No curriculums yet. Create one to get started.
        </div>
      ) : (
        /* Curriculum List */
        <div className="space-y-3">
          {curriculums.map((cur) => (
            <div
              key={cur.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span
                  onClick={() => openView(cur)}
                  className="font-medium text-gray-900 hover:text-amber-600 cursor-pointer transition-colors"
                >
                  {cur.name}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Program: {progName(cur.program)}
                </p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => openView(cur)}
                  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1 rounded transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    openEdit(cur);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(cur);
                    setShowForm(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────── View Detail Panel ──────── */}
      {viewTarget && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {viewData.name}
              </h2>
              <button
                onClick={closeView}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Program: <strong>{progName(viewData.program)}</strong>
            </p>

            {loadingView ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : viewData.courses && viewData.courses.length > 0 ? (
              <div className="space-y-3">
                {/* Group by semester */}
                {(() => {
                  const grouped = viewData.courses.reduce((acc, c) => {
                    const sem = c.semester || 1;
                    if (!acc[sem]) acc[sem] = [];
                    acc[sem].push(c);
                    return acc;
                  }, {});
                  return Object.keys(grouped)
                    .sort((a, b) => a - b)
                    .map((sem) => (
                      <div key={sem}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold text-amber-700">
                            Semester {sem}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {grouped[sem].reduce((s, c) => s + (c.credits || 0), 0)} credits
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {grouped[sem].map((course) => (
                            <div
                              key={course.id}
                              className="flex justify-between bg-gray-50 rounded px-3 py-2 text-sm"
                            >
                              <div>
                                <span className="font-medium text-gray-800">
                                  {course.code}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  {course.name}
                                </span>
                              </div>
                              <span className="text-gray-400">{course.credits} cr</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400">No courses in this curriculum</p>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeView}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;
