// src/components/layout/CourseDetailLayout.jsx
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';

const COURSE_NAV = [
  { id: 'notifications', label: 'Course Notification', icon: '📢' },
  { id: 'attendance', label: 'Attendance', icon: '✅' },
  { id: 'marks', label: 'Marks Summary', icon: '📊' },
  { id: 'resources', label: 'Learning Resources', icon: '📚' },
  { id: 'assignments', label: 'Assignments', icon: '📝' },
  { id: 'mdb', label: 'MDB', icon: '👥' },
  { id: 'gdb', label: 'GDB', icon: '💬' },
  { id: 'quizzes', label: 'Quizzes', icon: '✍️' },
  { id: 'lectures', label: 'Lecture Contents', icon: '💻' },
  { id: 'info', label: 'Course Information', icon: 'ℹ️' },
];

export default function CourseDetailLayout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0f172a] p-4">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 bg-black/20 p-4 rounded-xl">
        {COURSE_NAV.map((item) => {
          const isActive = location.pathname.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/courses/${courseId}/${item.id}`)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all shadow-lg 
                ${isActive ? 'bg-[#00a191] text-white scale-110' : 'bg-white hover:bg-gray-200'}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] mt-2 text-center w-20 font-bold uppercase tracking-tighter
                ${isActive ? 'text-[#00a191]' : 'text-white/80'}`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Course Sub-Page Content */}
      <div className="bg-white rounded-lg p-6 min-h-[400px]">
        <Outlet />
      </div>
    </div>
  );
}
