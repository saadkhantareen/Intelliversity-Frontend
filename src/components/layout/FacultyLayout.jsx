import DashboardShell2 from "./DashboardShell";
import {
  IcGrid as IcGrid2, IcBook as IcBook2, IcClipboard as IcClipboard2,
  IcCalendar as IcCalendar2, IcUsers as IcUsers2, IcBell as IcBell2,
  IcMessage, IcChart as IcChart2,
} from "./icons";
 
const FACULTY_CONFIG = {
  accent: "#16a34a",                        // green
  portal: "faculty",
  label:  "Faculty Portal",
  badge:  { bg: "#dcfce7", text: "#166534" },
  sections: [
    {
      title: "Teaching",
      items: [
        { label: "Dashboard",     to: "/dashboard",    Icon: IcGrid2 },
        { label: "My Courses",    to: "/courses",      Icon: IcBook2 },
        { label: "Students",      to: "/students",     Icon: IcUsers2 },
        { label: "Grading",       to: "/grading",      Icon: IcClipboard2 },
        { label: "Attendance",    to: "/attendance",   Icon: IcCalendar2 },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Announcements", to: "/announcements",Icon: IcBell2 },
        { label: "Messages",      to: "/messages",     Icon: IcMessage },
        { label: "Reports",       to: "/reports",      Icon: IcChart2 },
      ],
    },
  ],
};
 
export default function FacultyLayout() {
  return <DashboardShell2 config={FACULTY_CONFIG} />;
}