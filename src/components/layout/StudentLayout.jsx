import DashboardShell from "./DashboardShell";
import {
  IcGrid,      // For Dashboard
  IcClipboard, // For Registration Card
  IcArchive,   // For Fees (or use a currency icon if available)
  IcChart,     // For Result Card
  IcBell,      // For Profile (or use a User icon if available)
  IcBook,      // For SoS
} from "./icons";

const STUDENT_CONFIG = {
  accent: "#00a191",                         // Matching the teal color in your image
  portal: "student",
  label:  "Student Portal",
  badge:  { bg: "#dbeafe", text: "#1e40af" },
  sections: [
    {
      title: "Main Menu",
      items: [
        { label: "Dashboard",         to: "/dashboard",         Icon: IcGrid },
        { label: "View Courses",      to: "/courses",           Icon: IcBook },
        { label: "Registration Card", to: "/registration",      Icon: IcClipboard },
        { label: "Fees",              to: "/fees",              Icon: IcArchive },
        { label: "Result Card",       to: "/results",           Icon: IcChart },
        { label: "Profile",           to: "/profile",           Icon: IcBell },
        { label: "SoS",               to: "/sos",               Icon: IcBook },
      ],
    },
  ],
};

export default function StudentLayout() {
  return <DashboardShell config={STUDENT_CONFIG} />;
}