/**
 * LoginPage.jsx — The login page for a university portal.
 *
 * Two-step flow on one page:
 *   Step 1: Email + Password → submit → backend returns user + roles
 *   Step 2: If multiple roles → show role picker cards inline
 *           If single role → auto-navigate to dashboard
 *
 * Automatically shows the university's branding (name, logo, colors)
 * from TenantContext.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useTenant } from "../../../../hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const roleConfig = {
  admin: {
    label: "University Admin",
    description: "Manage users, courses, departments, and settings",
    icon: "🏛️",
  },
  teacher: {
    label: "Teacher",
    description: "Manage your classes, attendance, and grading",
    icon: "👩‍🏫",
  },
  student: {
    label: "Student",
    description: "View courses, results, attendance, and AI assistant",
    icon: "🎓",
  },
};

const dashboardMap = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export default function LoginPage() {
  // --- Step state ---
  const [step, setStep] = useState("credentials"); // "credentials" | "pick-role"
  const [availableRoles, setAvailableRoles] = useState([]);

  // --- Form state ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, switchRole } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const navigate = useNavigate();

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading university portal...</p>
      </div>
    );
  }

  // --- Step 1: Submit credentials ---
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const roles = await login(email, password);

      if (roles.length === 1) {
        // Single role → go straight to dashboard
        navigate(dashboardMap[roles[0]] || "/", { replace: true });
      } else {
        // Multiple roles → show inline role picker (step 2)
        setAvailableRoles(roles);
        setStep("pick-role");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  // --- Step 2: Pick a role ---
  function handleRoleSelect(role) {
    switchRole(role);
    navigate(dashboardMap[role] || "/", { replace: true });
  }

  // --- Go back to credentials from role picker ---
  function handleBackToLogin() {
    setStep("credentials");
    setAvailableRoles([]);
    setError("");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          {tenant?.logo && (
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="h-16 mx-auto mb-2"
            />
          )}
          <CardTitle className="text-2xl">
            {tenant?.name || "University"} Portal
          </CardTitle>
          <CardDescription>
            {step === "credentials"
              ? "Sign in to your account"
              : "You have multiple roles. Continue as:"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ============ STEP 1: CREDENTIALS ============ */}
          {step === "credentials" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* ============ STEP 2: ROLE PICKER ============ */}
          {step === "pick-role" && (
            <div className="space-y-3">
              {availableRoles.map((role) => {
                const config = roleConfig[role] || {
                  label: role,
                  description: "",
                  icon: "👤",
                };

                return (
                  <Card
                    key={role}
                    className="cursor-pointer hover:border-primary hover:shadow-sm transition-all"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <span className="text-3xl">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-muted-foreground text-sm truncate">
                          {config.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-sm text-muted-foreground hover:text-foreground mt-2"
              >
                ← Back to login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
