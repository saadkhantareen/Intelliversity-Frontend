import DashboardShell from './DashboardShell';
import { useTenant } from '@/features/tenant';
import {
  IcGrid as IcGrid3,
  IcUsers as IcUsers3,
  IcBook as IcBook3,
  IcUpload,
  IcSettings,
  IcChart as IcChart3,
  IcTenant,
  IcArchive as IcArchive3,
  IcBell as IcBell3,
} from '@/shared/components/icons';

const ADMIN_CONFIG = {
  accent: 'var(--brand-primary)',
  portal: 'admin',
  label: 'Admin Portal',
  badge: { bg: 'var(--brand-accent)', text: 'var(--brand-surface)' },
  sections: [
    {
      title: 'Management',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid3 },
        { label: 'Policies', to: '/policies', Icon: IcSettings },
        { label: "Profile", to: "/profile", Icon: IcGrid3 },

      ],
    },
    {
      title: 'Academics',
      items: [
        {
          label: 'Departments',
          to: '/academics/departments',
          Icon: IcArchive3,
        },
        { label: 'Programs', to: '/academics/programs', Icon: IcArchive3 },
        { label: 'Courses', to: '/academics/courses', Icon: IcBook3 },
        { label: 'Curriculum', to: '/academics/curriculums', Icon: IcBook3 },
        {
          label: 'Academic Years',
          to: '/academics/academic-years',
          Icon: IcArchive3,
        },
        { label: 'Terms', to: '/academics/terms', Icon: IcArchive3 },
        { label: 'Batches', to: '/academics/batches', Icon: IcUsers3 },
        { label: 'Student', to: '/users/students/', Icon: IcBook3 },
        { label: 'Faculty', to: '/users/faculty/', Icon: IcBook3 },
      ],
    },
    {
      title: 'Enrollments',
      items: [
        { label: 'Course Offering', to: '/enrollments/course-offerings', Icon: IcBook3 },
        { label: 'Faculty Assignment', to: '/enrollments/faculty-assignments', Icon: IcUsers3 },
        { label: 'Student Enrollment', to: '/enrollments/student-enrollments', Icon: IcUsers3 },
      ],
    },
    {
      title: 'Examination',
      items: [
        { label: 'Assessment Types', to: '/examinations/assessment-types', Icon: IcChart3 },
        { label: 'Assessment Policies', to: '/examinations/assessment-policies', Icon: IcChart3 },
        { label: 'Grade Policies', to: '/examinations/grade-policies', Icon: IcChart3 },
        { label: 'Grade Scales', to: '/examinations/grade-scales', Icon: IcChart3 },
      ],
    },
  ],
};

export default function AdminLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...ADMIN_CONFIG,
    accent: branding?.theme_config?.colors?.primary || ADMIN_CONFIG.accent,
  };

  return <DashboardShell config={resolvedConfig} />;
}
