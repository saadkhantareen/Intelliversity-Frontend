/**
 * RoleSwitcher.jsx — A dropdown that lets users switch roles without logout.
 *
 * Only shown when the user has 2+ roles.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const roleLabels = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

export function RoleSwitcher() {
  const { roles, activeRole, switchRole } = useAuth();
  const navigate = useNavigate();

  // Don't show if user has only one role
  if (roles.length <= 1) return null;

  function handleSwitch(newRole) {
    switchRole(newRole);
    navigate(`/${newRole}/dashboard`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {roleLabels[activeRole] || activeRole}
          <span className="ml-1">{"\u25BC"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {roles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleSwitch(role)}
            className="flex items-center justify-between"
          >
            {roleLabels[role] || role}
            {role === activeRole && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
