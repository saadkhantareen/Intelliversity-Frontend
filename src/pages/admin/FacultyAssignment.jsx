const FacultyAssignment = () => {
  const [formData, setFormData] = useState({
    faculty: '', // registration_id (SlugField)
    course: '',  // course_code (SlugField)
    term: '',    // ID
    section: ''  // ID
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await EnrollmentService.assignCourseToFaculty(formData);
      toast.success("Faculty assigned successfully!");
    } catch (err) {
      toast.error("Assignment failed. Verify IDs and constraints.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-xl font-black mb-6">Assign Course to Faculty</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Faculty Registration ID (e.g., FAC-001)" 
          className="w-full p-3 border rounded-xl"
          onChange={e => setFormData({...formData, faculty: e.target.value})}
        />
        <input 
          placeholder="Course Code (e.g., CS101)" 
          className="w-full p-3 border rounded-xl"
          onChange={e => setFormData({...formData, course: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
           <input placeholder="Term UUID" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, term: e.target.value})}/>
           <input placeholder="Section UUID" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, section: e.target.value})}/>
        </div>
        <button className="w-full py-4 bg-black text-white font-bold rounded-xl">Create Assignment</button>
      </form>
    </div>
  );
};