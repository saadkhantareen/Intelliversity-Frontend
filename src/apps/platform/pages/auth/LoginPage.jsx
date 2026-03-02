/**
 * LoginPage.jsx — Super Admin login page for the Intelliversity platform.
 *
 * Shown at the root domain (e.g., intelliversity.com or localhost:5173).
 * Used by the platform owner / super admin to log in and manage all tenants.
 *
 * Flow:
 *   1. Super admin enters email + password
 *   2. Calls login() → backend returns JWT + user with role "super_admin"
 *   3. Since there's only 1 role, auto-selects it → navigates to /dashboard
 *
 * No TenantContext is used here — the platform portal has no tenant.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
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

export default function PlatformLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Super admin has a single role (super_admin) — auto-selected by AuthContext
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          {/* Platform branding */}
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                I
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Intelliversity</CardTitle>
          <CardDescription>
            Super Admin Portal — Sign in to manage all universities
          </CardDescription>
        </CardHeader>

        <CardContent>
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
                placeholder="admin@intelliversity.com"
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

          <p className="text-center text-xs text-muted-foreground mt-6">
            This portal is for platform administrators only.
            <br />
            University users should access their institution's subdomain.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
