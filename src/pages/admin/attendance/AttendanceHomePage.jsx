// src/pages/admin/attendance/AttendanceHomePage.jsx
import { Link } from "react-router-dom";
import { PageHeader } from "../../../components/attendance/ui";

const tiles = [
  {
    to: "/attendance/policies",
    title: "Attendance Policies",
    text: "Minimum percentage, warning threshold, and how leave is counted.",
  },
  {
    to: "/attendance/reports/defaulters",
    title: "Defaulters Report",
    text: "Students below the required percentage. Exportable to CSV.",
  },
  {
    to: "/attendance/reports/compliance",
    title: "Compliance Report",
    text: "Which teachers are actually marking their sessions (needs a term).",
  },
  {
    to: "/attendance/course-summary",
    title: "Course Summary",
    text: "Full attendance breakdown for one course offering.",
  },
  {
    to: "/attendance/sessions",
    title: "Class Sessions",
    text: "Browse, mark, lock or unlock any session in the tenant.",
  },
  {
    to: "/attendance/generate",
    title: "Generate Sessions",
    text: "Bulk-create sessions for a course offering from its timetable.",
  },
];

export default function AttendanceHomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHeader
        title="Attendance Administration"
        subtitle="Policies, session generation and university-wide reports."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-900 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 group-hover:underline">
              {t.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
