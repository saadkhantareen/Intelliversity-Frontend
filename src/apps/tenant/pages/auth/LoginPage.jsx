/**
 * LoginPage.jsx — The login page for a university portal.
 *
 * Automatically shows the university's branding (name, logo, colors)
 * from TenantContext. Multi-role flow after login:
 *   1 role → go straight to dashboard
 *   Multiple roles → navigate to /select-role
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useTenant } from "../../../../hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const navigate = useNavigate();

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading university portal...</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const roles = await login(email, password);

      if (roles.length === 1) {
        navigate("/");
      } else {
        navigate("/select-role");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {tenant?.logo && (
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="h-16 mx-auto mb-4"
            />
          )}
          <CardTitle className="text-2xl">
            {tenant?.name || "University"} Portal
          </CardTitle>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
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
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
