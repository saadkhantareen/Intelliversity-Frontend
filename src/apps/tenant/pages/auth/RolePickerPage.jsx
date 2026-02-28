/**
 * RolePickerPage.jsx — Shown when a user has MULTIPLE roles.
 *
 * User sees cards for each role and picks which "hat" to wear.
 * After picking, activeRole is set and they're redirected to their dashboard.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roleConfig = {
  admin: {
    label: "University Admin",
    description: "Manage users, courses, departments, and settings",
    icon: "\u{1F3DB}\u{FE0F}",
  },
  teacher: {
    label: "Teacher",
    description: "Manage your classes, attendance, and grading",
    icon: "\u{1F469}\u{200D}\u{1F3EB}",
  },
  student: {
    label: "Student",
    description: "View courses, results, attendance, and AI assistant",
    icon: "\u{1F393}",
  },
};

export default function RolePickerPage() {
  const { roles, switchRole } = useAuth();
  const navigate = useNavigate();

  function handleRoleSelect(role) {
    switchRole(role);
    navigate("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
      <p className="text-gray-500 mb-8">
        You have multiple roles. Continue as:
      </p>

      <div className="grid gap-4 w-full max-w-lg">
        {roles.map((role) => {
          const config = roleConfig[role] || {
            label: role,
            description: "",
            icon: "\u{1F464}",
          };

          return (
            <Card
              key={role}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleRoleSelect(role)}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <span className="text-4xl">{config.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{config.label}</h3>
                  <p className="text-gray-500 text-sm">{config.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Continue
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
