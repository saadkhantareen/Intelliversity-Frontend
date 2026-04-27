import DashboardShell from "./DashboardShell";
import {
  IcGrid, IcBook, IcClipboard, IcChart,
  IcCalendar, IcArchive, IcBell, IcGraduation, IcUsers,
} from "./icons";
 
const STUDENT_CONFIG = {
  accent: "#2563eb",                        // blue — change per brand
  portal: "student",
  label:  "Student Portal",
  badge:  { bg: "#dbeafe", text: "#1e40af" },
  sections: [
    {
      title: "Learning",
      items: [
        { label: "Dashboard",     to: "/dashboard",    Icon: IcGrid },
        { label: "Profile",       to: "/profile",      Icon: IcUsers },
        { label: "My Courses",    to: "/courses",      Icon: IcBook },
        { label: "Assignments",   to: "/assignments",  Icon: IcClipboard },
        { label: "Grades",        to: "/grades",       Icon: IcChart },
        { label: "Schedule",      to: "/schedule",     Icon: IcCalendar },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Library",       to: "/library",      Icon: IcArchive },
        { label: "Announcements", to: "/announcements",Icon: IcBell },
        { label: "Transcript",    to: "/transcript",   Icon: IcGraduation },
      ],
    },
  ],
};
 
export default function StudentLayout() {
  return <DashboardShell config={STUDENT_CONFIG} />;
}
 
 