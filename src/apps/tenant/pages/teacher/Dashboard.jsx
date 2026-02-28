/**
 * Teacher Dashboard — The home page for Teachers/Faculty.
 * Shows their assigned classes, pending attendance, grading tasks.
 */

import { useAuth } from "../../../../hooks/useAuth";
import { useTenant } from "../../../../hooks/useTenant";
import { RoleSwitcher } from "../../components/RoleSwitcher";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {tenant?.name} — Teacher Dashboard
          </h1>
          <p className="text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <button onClick={logout} className="text-red-500 text-sm">
            Logout
          </button>
        </div>
      </div>
      <p>Build your teacher UI here: classes, attendance, grading...</p>
    </div>
  );
}
