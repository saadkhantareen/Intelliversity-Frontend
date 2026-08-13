import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CurriculumService from '../api/curriculum.service';
import ProgramService from '@/features/programs';
import CourseService from '@/features/courses';

const CurriculumForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    program: '', // Needs to be the program CODE (e.g., "BSCS")
    total_credit_hours: 0,
    description: '',
    courses: [], // Array of { course: "CODE", recommended_semester: 1, course_type: "CORE" }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progRes, courseRes] = await Promise.all([
          ProgramService.getPrograms(),
          CourseService.getCourses(),
        ]);
        setPrograms(progRes);
        setCourses(courseRes);

        if (id) {
          const curriculumData = await CurriculumService.getCurriculumById(id);

          // NORMALIZATION: Ensure the form state uses codes, even if backend sends objects or IDs
          setFormData({
            ...curriculumData,
            // Convert program to code string
            program:
              typeof curriculumData.program === 'object'
                ? curriculumData.program.code
                : progRes.find((p) => p.id === curriculumData.program)?.code ||
                  curriculumData.program,

            // Convert each course inside the curriculum to a code string
            courses: curriculumData.courses.map((item) => ({
              ...item,
              course:
                typeof item.course === 'object'
                  ? item.course.code
                  : courseRes.find((c) => c.id === item.course)?.code || item.course,
            })),
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    loadData();
  }, [id]);

  const addCourseRow = () => {
    setFormData({
      ...formData,
      courses: [...formData.courses, { course: '', recommended_semester: 1, course_type: 'CORE' }],
    });
  };

  const removeCourseRow = (index) => {
    const newCourses = formData.courses.filter((_, i) => i !== index);
    setFormData({ ...formData, courses: newCourses });
  };

  const updateCourseRow = (index, field, value) => {
    const newCourses = [...formData.courses];
    newCourses[index][field] = value;
    setFormData({ ...formData, courses: newCourses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // DEBUG: Look at this in your browser console (F12) before clicking save
    console.log('Submitting Payload:', formData);

    try {
      if (id) await CurriculumService.updateCurriculum(id, formData);
      else await CurriculumService.createCurriculum(formData);
      navigate('/academics/curriculums');
    } catch (err) {
      const serverError = err.response?.data;
      alert('Error Saving Curriculum:\n' + JSON.stringify(serverError, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{id ? 'Edit' : 'Create'} Curriculum</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Curriculum Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. BSCS Fall 2026 Revised"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Program</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              required
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.code}>
                  {' '}
                  {/* CRITICAL: Using p.code */}
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Total Credit Hours Required
          </label>
          <input
            type="number"
            className="w-40 border border-gray-300 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.total_credit_hours}
            onChange={(e) => setFormData({ ...formData, total_credit_hours: e.target.value })}
            required
          />
        </div>

        {/* Dynamic Courses Section */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Courses Mapping</h3>
            <button
              type="button"
              onClick={addCourseRow}
              className="text-sm font-semibold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition"
            >
              + Add Course
            </button>
          </div>

          <div className="space-y-3">
            {formData.courses.length === 0 && (
              <p className="text-center text-gray-400 py-4 italic border-2 border-dashed rounded-xl">
                No courses added to this curriculum yet.
              </p>
            )}
            {formData.courses.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="col-span-5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Course</label>
                  <select
                    className="w-full border border-gray-300 p-2 rounded-md bg-white mt-1 outline-none focus:border-indigo-500"
                    value={row.course}
                    onChange={(e) => updateCourseRow(index, 'course', e.target.value)}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {' '}
                        {/* CRITICAL: Using c.code */}
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Semester</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-2 rounded-md bg-white mt-1"
                    min="1"
                    value={row.recommended_semester}
                    onChange={(e) => updateCourseRow(index, 'recommended_semester', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                  <select
                    className="w-full border border-gray-300 p-2 rounded-md bg-white mt-1 outline-none"
                    value={row.course_type}
                    onChange={(e) => updateCourseRow(index, 'course_type', e.target.value)}
                  >
                    <option value="CORE">Core</option>
                    <option value="ELEC">Elective</option>
                    <option value="GEN">General</option>
                  </select>
                </div>
                <div className="col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeCourseRow(index)}
                    className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-md transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg disabled:opacity-50 transition transform active:scale-95"
          >
            {loading ? 'Saving Data...' : 'Save Curriculum'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CurriculumForm;
