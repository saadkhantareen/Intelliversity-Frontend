import DashboardShell3 from "./DashboardShell";
import {
  IcGrid as IcGrid3, IcUsers as IcUsers3, IcBook as IcBook3,
  IcUpload,
  IcSettings, IcChart as IcChart3, IcTenant, IcArchive as IcArchive3,
  IcBell as IcBell3,
} from "./icons";
 
const ADMIN_CONFIG = {
  accent: "#d97706",                        // amber
  portal: "admin",
  label:  "Admin Portal",
  badge:  { bg: "#fef3c7", text: "#92400e" },
  sections: [
    {
      title: "Academics",
      items: [
        { label: "Departments",   to: "/departments",  Icon: IcArchive3 },
        { label: "Programs",      to: "/programs",     Icon: IcBook3 },
        { label: "Courses",       to: "/courses",      Icon: IcBook3 },
        { label: "Curriculum",    to: "/curriculum",   Icon: IcBook3 },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Dashboard",     to: "/dashboard",    Icon: IcGrid3 },
        { label: "Profile",       to: "/profile",      Icon: IcUsers3 },
        { label: "Users",         to: "/users",        Icon: IcUsers3 },
        { label: "Bulk Upload",   to: "/users/bulk-upload", Icon: IcUpload },
        { label: "Announcements", to: "/announcements",Icon: IcBell3 },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Analytics",     to: "/analytics",    Icon: IcChart3 },
        { label: "Tenants",       to: "/tenants",      Icon: IcTenant },
        { label: "Settings",      to: "/settings",     Icon: IcSettings },
      ],
    },
  ],
};
 
export default function AdminLayout() {
  return <DashboardShell3 config={ADMIN_CONFIG} />;
}