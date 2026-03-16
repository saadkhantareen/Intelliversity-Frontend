import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const { config, university } = useTenant();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.edu\.[a-zA-Z]{2,}$/;

  const emailValid = emailRegex.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailValid) {
      toast.error("Enter a valid university email");
      return;
    }

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {}
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">

        <h1
          style={{ color: config?.color }}
          className="text-4xl text-center uppercase tracking-widest font-semibold mb-1"
        >
          {university}
        </h1>

        <h2
          style={{ color: config?.color }}
          className="text-2xl font-bold text-center mb-6"
        >
          {config?.label}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium pl-3 text-gray-700 mb-1">
              Email
            </label>
            

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"
              placeholder="you@university.edu.pk"
              required
            />

            {email && !emailValid && (
              <p className="text-sm text-red-500 mt-1 pl-3">
                Enter a valid university Email.
              </p>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <div className="flex justify-between items-center mb-1 px-3">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-red-400 font-bold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"
              placeholder="Enter your password"
              required
            />

          </div>


          {/* LOGIN BUTTON */}
          <div></div>
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: config?.color }}
            className="w-full text-white py-2 rounded-3xl transition disabled:opacity-50 hover:opacity-90"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;