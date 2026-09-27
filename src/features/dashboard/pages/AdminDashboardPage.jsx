import { useState } from 'react';
import {
  IcUsers,
  IcUser,
  IcBook,
  IcTenant,
  IcChart,
} from '@/shared/components/icons';
import BklitKpiCard from '../components/BklitKpiCard';
import BklitAreaChart from '../components/BklitAreaChart';
import BklitDepartmentBreakdown from '../components/BklitDepartmentBreakdown';
import BklitActivityFeed from '../components/BklitActivityFeed';

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Data Profiles (Semester / 1-Year / All-Time)
// ─────────────────────────────────────────────────────────────────────────────
const TIMEFRAME_DATA = {
  '6M': {
    stats: {
      totalStudents: 2845,
      totalFaculty: 168,
      totalCourses: 324,
      totalDepartments: 16,
      studentsDelta: '+12.4%',
      facultyDelta: '+4.8%',
      coursesDelta: '+9.1%',
      departmentsDelta: '100% active',
      studentsSpark: [2100, 2240, 2380, 2520, 2690, 2845],
      facultySpark: [142, 148, 152, 158, 164, 168],
      coursesSpark: [260, 275, 288, 302, 315, 324],
      departmentsSpark: [14, 14, 15, 15, 16, 16],
    },
    enrollments: [
      { month: 'Jan', value: 340 },
      { month: 'Feb', value: 410 },
      { month: 'Mar', value: 380 },
      { month: 'Apr', value: 520 },
      { month: 'May', value: 480 },
      { month: 'Jun', value: 590 },
    ],
  },
  '1Y': {
    stats: {
      totalStudents: 5420,
      totalFaculty: 195,
      totalCourses: 480,
      totalDepartments: 18,
      studentsDelta: '+21.8%',
      facultyDelta: '+8.2%',
      coursesDelta: '+14.6%',
      departmentsDelta: '+2 new',
      studentsSpark: [3800, 4100, 4400, 4750, 5100, 5420],
      facultySpark: [160, 168, 175, 182, 190, 195],
      coursesSpark: [360, 390, 420, 445, 465, 480],
      departmentsSpark: [14, 15, 15, 16, 17, 18],
    },
    enrollments: [
      { month: 'Q1', value: 1150 },
      { month: 'Q2', value: 1380 },
      { month: 'Q3', value: 1290 },
      { month: 'Q4', value: 1600 },
    ],
  },
  All: {
    stats: {
      totalStudents: 14850,
      totalFaculty: 240,
      totalCourses: 720,
      totalDepartments: 22,
      studentsDelta: '+44.2%',
      facultyDelta: '+18.0%',
      coursesDelta: '+32.4%',
      departmentsDelta: 'Established',
      studentsSpark: [8500, 9800, 11200, 12600, 13700, 14850],
      facultySpark: [180, 195, 210, 220, 232, 240],
      coursesSpark: [450, 520, 590, 640, 680, 720],
      departmentsSpark: [12, 14, 16, 18, 20, 22],
    },
    enrollments: [
      { month: '2022', value: 3100 },
      { month: '2023', value: 3800 },
      { month: '2024', value: 4450 },
      { month: '2025', value: 5200 },
      { month: '2026', value: 5900 },
    ],
  },
};

const DEPARTMENT_DISTRIBUTION = [
  { name: 'Computer Science & AI', students: 840 },
  { name: 'Software Engineering', students: 620 },
  { name: 'Electrical Engineering', students: 480 },
  { name: 'Business Administration', students: 390 },
  { name: 'Data Science & Cyber', students: 310 },
  { name: 'Humanities & Social Sciences', students: 205 },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    action: 'New student enrollment verified',
    detail: 'Ahmed Khan — BS Computer Science (Fall 2026)',
    time: '2m ago',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 2,
    action: 'Course syllabus updated',
    detail: 'CS301: Advanced Data Structures & Algorithms',
    time: '24m ago',
    dotColor: 'bg-blue-500',
  },
  {
    id: 3,
    action: 'Faculty evaluation report published',
    detail: 'Dr. Fatima Tariq — CS Department',
    time: '1h ago',
    dotColor: 'bg-purple-500',
  },
  {
    id: 4,
    action: 'Grade scale audit completed',
    detail: 'Standard Relative Grading Policy v2.4',
    time: '3h ago',
    dotColor: 'bg-amber-500',
  },
  {
    id: 5,
    action: 'Bulk section allotment generated',
    detail: '142 students assigned to CS-4A & CS-4B',
    time: '5h ago',
    dotColor: 'bg-indigo-500',
  },
];

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState('6M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [randomOffset, setRandomOffset] = useState(0);

  const currentDataset = TIMEFRAME_DATA[period] || TIMEFRAME_DATA['6M'];
  const stats = currentDataset.stats;

  // Real-time pulse trigger that shifts numbers slightly to demonstrate rolling NumberFlow animation
  const handleLivePulse = () => {
    setIsRefreshing(true);
    setRandomOffset((prev) => (prev === 0 ? 12 : prev === 12 ? -8 : 0));
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* ── Top Hero Header with Quick Timeframe Filter & Live Trigger ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: 'var(--brand-text, #0f172a)' }}
            >
              Executive Campus Intelligence
            </h1>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, #38bdf8 14%, transparent)',
                color: '#38bdf8',
              }}
            >
              <IcChart s={13} />
              Bklit Metrics
            </span>
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--brand-text-muted, #64748b)' }}
          >
            Real-time enrollment velocities, academic workload, and departmental capacity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Live Refresh Trigger to see NumberFlow roll */}
          <button
            type="button"
            onClick={handleLivePulse}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{
              borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.08))',
              color: 'var(--brand-text, #0f172a)',
            }}
            title="Simulate live metric updates"
          >
            <svg
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            <span>Live Pulse</span>
          </button>
        </div>
      </div>

      {/* ── 4 Bklit KPI Cards with NumberFlow & Live Sparklines ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BklitKpiCard
          title="Total Active Students"
          value={stats.totalStudents + randomOffset}
          delta={stats.studentsDelta}
          deltaLabel="enrollment surge"
          isPositive={true}
          sparkData={stats.studentsSpark}
          color="#38bdf8"
          icon={IcUsers}
        />

        <BklitKpiCard
          title="Faculty Members"
          value={stats.totalFaculty + (randomOffset > 0 ? 1 : 0)}
          delta={stats.facultyDelta}
          deltaLabel="active roster"
          isPositive={true}
          sparkData={stats.facultySpark}
          color="#a855f7"
          icon={IcUser}
        />

        <BklitKpiCard
          title="Active Course Offerings"
          value={stats.totalCourses + (randomOffset > 0 ? 3 : 0)}
          delta={stats.coursesDelta}
          deltaLabel="this term"
          isPositive={true}
          sparkData={stats.coursesSpark}
          color="#10b981"
          icon={IcBook}
        />

        <BklitKpiCard
          title="Academic Departments"
          value={stats.totalDepartments}
          delta={stats.departmentsDelta}
          deltaLabel="accredited"
          isPositive={true}
          sparkData={stats.departmentsSpark}
          color="#f59e0b"
          icon={IcTenant}
        />
      </div>

      {/* ── Main Interactive Area Chart (Enrollment Trends) ── */}
      <BklitAreaChart
        title="Enrollment & Matriculation Velocity"
        subtitle="Live spline trajectory with interactive scrubbing and NumberFlow readout"
        data={currentDataset.enrollments}
        periods={['6M', '1Y', 'All']}
        activePeriod={period}
        onPeriodChange={(p) => setPeriod(p)}
        color="#38bdf8"
        secondaryColor="#818cf8"
      />

      {/* ── Bento Grid Bottom Row: Department Breakdown & Live Campus Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BklitDepartmentBreakdown
          title="Department Allocation & Capacity"
          subtitle="Student concentration per accredited department"
          data={DEPARTMENT_DISTRIBUTION}
        />

        <BklitActivityFeed
          title="Live Campus Audit & Event Log"
          subtitle="Chronological stream of administrative and academic operations"
          activities={RECENT_ACTIVITIES}
        />
      </div>
    </div>
  );
}
