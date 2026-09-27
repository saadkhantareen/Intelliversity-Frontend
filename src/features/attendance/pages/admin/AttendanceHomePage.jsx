import { Link } from "react-router-dom";
import { Button, Card, PageHeader } from "../../components/ui";

export default function AttendanceHomePage() {
  const cards = [
    {
      title: "Attendance Policies",
      desc: "Configure minimum attendance percentage, warning thresholds, and rules per term or program.",
      link: "/attendance/policies",
      btnText: "Manage Policies",
    },
    {
      title: "Defaulters Report",
      desc: "Identify and export lists of students falling below attendance requirements.",
      link: "/attendance/reports/defaulters",
      btnText: "View Defaulters",
    },
    {
      title: "Compliance Report",
      desc: "Monitor faculty marking compliance across course offerings and terms.",
      link: "/attendance/reports/compliance",
      btnText: "View Compliance",
    },
    {
      title: "Class Sessions",
      desc: "View, create, lock, or cancel class sessions across offerings.",
      link: "/attendance/sessions",
      btnText: "Manage Sessions",
    },
    {
      title: "Bulk Generate Sessions",
      desc: "Schedule and bulk generate class sessions for course offerings.",
      link: "/attendance/generate",
      btnText: "Generate Sessions",
    },
    {
      title: "Course Attendance Summary",
      desc: "Comprehensive attendance summary per course offering.",
      link: "/attendance/course-summary",
      btnText: "View Summary",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHeader
        title="Attendance Management"
        subtitle="Admin control panel for policies, reports, and session tracking."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Card key={i} title={c.title} className="flex flex-col justify-between">
            <p className="mb-4 text-sm text-slate-600">{c.desc}</p>
            <div>
              <Link to={c.link}>
                <Button variant="primary" className="w-full">
                  {c.btnText}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
