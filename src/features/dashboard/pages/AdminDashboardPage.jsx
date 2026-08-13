import { useState, useEffect } from 'react';

// ──────────────────────────────────────
// Demo data — replace with API calls later
// ──────────────────────────────────────
const DEMO_DATA = {
  totalStudents: 0,
  totalFaculty: 0,
  totalCourses: 0,
  totalDepartments: 0,
  recentEnrollments: [
    { month: 'Jan', students: 0 },
    { month: 'Feb', students: 0 },
    { month: 'Mar', students: 0 },
    { month: 'Apr', students: 0 },
    { month: 'May', students: 0 },
    { month: 'Jun', students: 0 },
  ],
  departmentDistribution: [
    { name: 'Computer Science', students: 0 },
    { name: 'Engineering', students: 0 },
    { name: 'Business', students: 0 },
    { name: 'Humanities', students: 0 },
    { name: 'Mathematics', students: 0 },
    { name: 'Physics', students: 0 },
    { name: 'Biology', students: 0 },
  ],
  recentActivity: [
    {
      id: 1,
      action: 'New student enrolled',
      detail: 'Ahmed Khan — BSCS',
      time: '10 min ago',
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 2,
      action: 'Course updated',
      detail: 'CS301 — Data Structures',
      time: '1 hour ago',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 3,
      action: 'Faculty profile updated',
      detail: 'Dr. Fatima — CS Dept',
      time: '3 hours ago',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 4,
      action: 'New department created',
      detail: 'Artificial Intelligence',
      time: '5 hours ago',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 5,
      action: 'Bulk upload completed',
      detail: '150 students imported',
      time: 'Yesterday',
      color: 'bg-indigo-100 text-indigo-700',
    },
  ],
};

// ──────────────────────────────────────
// Mini bar chart component
// ──────────────────────────────────────
function MiniBarChart({ data, maxHeight = 120 }) {
  const max = Math.max(...data.map((d) => d.students));

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item) => (
        <div key={item.month} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t-md transition-all duration-500 min-h-[4px]"
            style={{
              backgroundColor: 'var(--brand-accent)',
              height: `${(item.students / max) * maxHeight}px`,
            }}
            title={`${item.students} students`}
          />
          <span className="text-xs mt-1" style={{ color: 'var(--brand-text-muted)' }}>
            {item.month}
          </span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────
// Horizontal bar chart component
// ──────────────────────────────────────
function HorizontalBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.students));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name}>
          <div
            className="flex justify-between text-xs mb-1"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            <span>{item.name}</span>
            <span className="font-medium">{item.students}</span>
          </div>
          <div
            className="w-full rounded-full h-2.5"
            style={{ backgroundColor: 'var(--brand-background)' }}
          >
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                backgroundColor: 'var(--brand-accent)',
                width: `${(item.students / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────
// Stat card component
// ──────────────────────────────────────
function StatCard({ label, value, icon, tone }) {
  return (
    <div
      className="border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
      style={{
        backgroundColor: 'var(--brand-surface)',
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--brand-text-muted)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--brand-text)' }}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={tone}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData] = useState(DEMO_DATA);
  const [loading, setLoading] = useState(false); // change to true when fetching real data

  // ──────────────────────────────────
  // Real API call — uncomment when backend is ready
  // ──────────────────────────────────
  // useEffect(() => {
  //   const fetchDashboard = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await api.get('/api/v1/admin/dashboard/');
  //       setData(res.data);
  //     } catch {
  //       // fallback to demo data
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchDashboard();
  // }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--brand-text)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-text-muted)' }}>
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Students"
          value={data.totalStudents}
          icon="👨‍🎓"
          tone={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
            color: 'var(--brand-primary)',
          }}
        />
        <StatCard
          label="Faculty Members"
          value={data.totalFaculty}
          icon="👩‍🏫"
          tone={{
            backgroundColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)',
            color: 'var(--brand-accent)',
          }}
        />
        <StatCard
          label="Total Courses"
          value={data.totalCourses}
          icon="📚"
          tone={{
            backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)',
            color: 'var(--brand-secondary)',
          }}
        />
        <StatCard
          label="Departments"
          value={data.totalDepartments}
          icon="🏛️"
          tone={{
            backgroundColor: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)',
            color: 'var(--brand-accent)',
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Trend */}
        <div
          className="border rounded-xl p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--brand-surface)',
            borderColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--brand-text)' }}>
            📈 Monthly Enrollments
          </h3>
          <MiniBarChart data={data.recentEnrollments} />
          <div className="flex justify-between mt-3">
            {data.recentEnrollments.map((item) => (
              <span
                key={item.month}
                className="text-xs text-center"
                style={{ color: 'var(--brand-text-muted)' }}
              >
                {item.students}
              </span>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div
          className="border rounded-xl p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--brand-surface)',
            borderColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--brand-text)' }}>
            🏛️ Students by Department
          </h3>
          <HorizontalBarChart data={data.departmentDistribution} />
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          🕐 Recent Activity
        </h3>
        <div className="space-y-4">
          {data.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${activity.color.split(' ')[0]}`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.detail}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${activity.color}`}>
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};