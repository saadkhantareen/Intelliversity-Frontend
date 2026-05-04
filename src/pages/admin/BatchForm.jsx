import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BatchService from '../../services/batch.service';
import ProgramService from '../../services/program.service';
import CurriculumService from '../../services/curriculum.service';
import AcademicYearService from '../../services/academic-year.service';

const BatchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [programs, setPrograms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    program: '', 
    curriculum: '', 
    start_academic_year: '', 
    start_date: '',
    end_date: '',
    max_students: 0,
    is_active: true,
    sections: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progRes, currRes, yearRes] = await Promise.all([
          ProgramService.getPrograms(),
          CurriculumService.getCurriculums(),
          AcademicYearService.getYears()
        ]);
        
        setPrograms(progRes);
        setCurriculums(currRes);
        setAcademicYears(yearRes);

        if (id) {
          const batchData = await BatchService.getBatchById(id);
          setFormData({
            ...batchData,
            program: typeof batchData.program === 'object' ? batchData.program.code : batchData.program,
            curriculum: currRes.find(c => c.name === batchData.curriculum)?.id || batchData.curriculum,
            start_academic_year: batchData.start_academic_year?.id || batchData.start_academic_year
          });
        }
      } catch (err) {
        console.error("Error loading form dependencies:", err);
      }
    };
    loadData();
  }, [id]);

  const addSectionRow = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { name: '', total_seats: 0 }]
    });
  };

  const removeSectionRow = (index) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const updateSectionRow = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) await BatchService.updateBatch(id, formData);
      else await BatchService.createBatch(formData);
      navigate('/academics/batches');
    } catch (err) {
      alert("Failed to save batch: " + JSON.stringify(err.response?.data || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 mb-10">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">{id ? 'Update' : 'Create'} Batch</h2>
        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Academic Management</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Batch Name</label>
            <input 
              type="text" className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. Batch 2024 - Fall" required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Max Students</label>
            <input 
              type="number" className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all"
              value={formData.max_students} onChange={e => setFormData({...formData, max_students: e.target.value})} required 
            />
          </div>
        </div>

        {/* Academic Mapping Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Program</label>
            <select 
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white transition-all"
              value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} required
            >
              <option value="">Select Program</option>
              {programs.map(p => <option key={p.id} value={p.code}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Curriculum</label>
            <select 
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white transition-all"
              value={formData.curriculum} onChange={e => setFormData({...formData, curriculum: e.target.value})} required
            >
              <option value="">Select Curriculum</option>
              {curriculums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Academic Year</label>
            <select 
              className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white transition-all"
              value={formData.start_academic_year} 
              onChange={e => setFormData({...formData, start_academic_year: e.target.value})}
              required
            >
              <option value="">Select Year</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Batch Start Date</label>
            <input type="date" className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Batch End Date</label>
            <input type="date" className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
          </div>
        </div>

        {/* Section Management */}
        <div className="border-t pt-6 bg-gray-50/50 p-6 rounded-2xl border-dashed border-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Batch Sections</h3>
              <p className="text-xs text-gray-500">Add group divisions for this batch</p>
            </div>
            <button 
              type="button" 
              onClick={addSectionRow} 
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm"
            >
              <span className="text-xl">+</span> Add Section
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.sections.map((row, index) => (
              <div key={index} className="flex gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Section Name</label>
                  <input type="text" className="w-full border-b-2 border-gray-100 p-2 focus:border-indigo-400 outline-none transition-all" value={row.name} onChange={e => updateSectionRow(index, 'name', e.target.value)} placeholder="e.g. Section A" required />
                </div>
                <div className="w-32">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Seats</label>
                  <input type="number" className="w-full border-b-2 border-gray-100 p-2 focus:border-indigo-400 outline-none transition-all" value={row.total_seats} onChange={e => updateSectionRow(index, 'total_seats', e.target.value)} required />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeSectionRow(index)} 
                  className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  title="Remove Section"
                >
                  ✕
                </button>
              </div>
            ))}
            {formData.sections.length === 0 && (
              <p className="text-center text-gray-400 italic py-4 text-sm font-medium">No sections added yet. Click "+ Add Section" to start.</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-8">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-8 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : id ? 'Update Batch Configuration' : 'Confirm & Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchForm;