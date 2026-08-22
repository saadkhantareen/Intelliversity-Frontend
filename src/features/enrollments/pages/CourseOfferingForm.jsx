import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseOfferingService from '../api/course-offering.service';
import TermService from '@/features/terms/api/term.service';
import { api } from '@/shared/api/client';

const CourseOfferingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Dropdown options
  const [curriculumCourses, setCurriculumCourses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    curriculum_course: '',
    term: '',
    section: '',
    capacity: 30,
  });

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (id) {
      loadOffering();
    }
  }, [id]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingDropdowns(true);

      const [currCoursesRes, termsRes, sectionsRes] = await Promise.all([
        api.get('/api/v1/academics/curriculum-courses/').catch((err) => {
          console.error('Failed to load curriculum-courses:', err);
          return { data: [] };
        }),
        TermService.getTerms().catch((err) => {
          console.error('Failed to load terms:', err);
          return [];
        }),
        api.get('/api/v1/academics/sections/').catch((err) => {
          console.error('Failed to load sections:', err);
          return { data: [] };
        }),
      ]);

      // Normalize array outputs safely
      const extractArray = (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.results)) return res.data.results;
        if (Array.isArray(res?.results)) return res.results;
        return [];
      };

      const rawCourses = extractArray(currCoursesRes);
      const rawTerms = extractArray(termsRes);
      const rawSections = extractArray(sectionsRes);

      setCurriculumCourses(rawCourses);
      setTerms(rawTerms);
      setSections(rawSections);
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadOffering = async () => {
    try {
      const data = await CourseOfferingService.getOfferingById(id);
      const res = data?.data || data;

      setFormData({
        curriculum_course:
          typeof res.curriculum_course === 'object'
            ? res.curriculum_course?.id
            : res.curriculum_course || '',
        term: typeof res.term === 'object' ? res.term?.id : res.term || '',
        section: typeof res.section === 'object' ? res.section?.id : res.section || '',
        capacity: res.capacity ?? 30,
      });
    } catch (err) {
      console.error('Failed to load course offering:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
    };

    try {
      if (id) {
        await CourseOfferingService.updateOffering(id, payload);
      } else {
        await CourseOfferingService.createOffering(payload);
      }
      navigate('/enrollments/course-offerings');
    } catch (err) {
      alert(
        'Failed to save course offering: ' +
          JSON.stringify(err.response?.data || 'Server Error')
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper label formatters to display friendly titles for nested object records
  const formatCourseLabel = (item) => {
    if (!item) return '';
    const courseObj = typeof item.course === 'object' ? item.course : null;
    const curriculumObj = typeof item.curriculum === 'object' ? item.curriculum : null;

    const courseTitle = courseObj?.name || courseObj?.title || item.course_name || item.name || item.id;
    const currTitle = curriculumObj?.name || item.curriculum_name || '';

    return currTitle ? `${courseTitle} (${currTitle})` : courseTitle;
  };

  const formatTermLabel = (item) => {
    if (!item) return '';
    return item.name || item.title || item.code || item.id;
  };

  const formatSectionLabel = (item) => {
    if (!item) return '';
    const batchObj = typeof item.batch === 'object' ? item.batch : null;
    const secName = item.name || item.section_name || item.code || item.id;
    const batchName = batchObj?.name || '';

    return batchName ? `${secName} - [${batchName}]` : secName;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 mb-10 border border-gray-100">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {id ? 'Update' : 'Create'} Course Offering
        </h2>
        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">
          Enrollment Setup
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Curriculum Course Select */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Curriculum Course
          </label>
          <select
            required
            disabled={loadingDropdowns}
            className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
            value={formData.curriculum_course}
            onChange={(e) =>
              setFormData({ ...formData, curriculum_course: e.target.value })
            }
          >
            <option value="">
              {loadingDropdowns
                ? 'Loading courses...'
                : curriculumCourses.length === 0
                ? 'No curriculum courses found'
                : '-- Select Curriculum Course --'}
            </option>
            {curriculumCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {formatCourseLabel(c)}
              </option>
            ))}
          </select>
        </div>

        {/* Term Select */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Term
          </label>
          <select
            required
            disabled={loadingDropdowns}
            className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          >
            <option value="">
              {loadingDropdowns
                ? 'Loading terms...'
                : terms.length === 0
                ? 'No terms found'
                : '-- Select Term --'}
            </option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {formatTermLabel(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Section Select */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Section
          </label>
          <select
            required
            disabled={loadingDropdowns}
            className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          >
            <option value="">
              {loadingDropdowns
                ? 'Loading sections...'
                : sections.length === 0
                ? 'No sections found (Generate sections in Batches first)'
                : '-- Select Section --'}
            </option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {formatSectionLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Capacity
          </label>
          <input
            type="number"
            min="1"
            required
            className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/enrollments/course-offerings')}
            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || loadingDropdowns}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : id ? 'Update Offering' : 'Create Offering'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseOfferingForm;