import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Mail,
  Lock,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import PortalNotFound from "@/pages/errors/PortalNotFound";
import { getRecaptchaToken } from '@/services/recaptcha.service'


export default function LoginPage() {
  const { tenant, isTenantLoading, error } = useTenant();
  const { login, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isTenantLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading portal...</p>
      </div>
    );
  }

  // If the API failed, render this INSTEAD of redirecting
  if (error) {
    return <PortalNotFound />;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.edu\.[a-zA-Z]{2,}$/;

  const emailValid = emailRegex.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailValid) {
      toast.error("Enter a valid university email");
      return;
    }
    
    try {
      const recaptchaToken = await getRecaptchaToken('login')
      await login({ email, password, recaptcha_token: recaptchaToken })
      navigate('/dashboard')
    } catch (error) {
      // error already shown via toast in AuthContext
    }

   
  };

  const bgImage = tenant?.page_asset?.background_image_url;
  // "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
  const logoUrl = tenant?.logo_url;
  // Fallbacks applied in case of empty strings in tenant payload
  const universityName = tenant?.university_name || "Grand Horizon University";
  const portalName = tenant?.portal_name || "Student & Faculty Access Portal";
  const tagline =
    tenant?.page_asset?.metadata?.tagline ||
    "Your centralized hub for academic resources, course management, and campus communications.";
  const taglineColor = tenant?.page_asset?.metadata?.tagline_color || "#e0e7ff";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-12 lg:p-[4rem] relative bg-background">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
      </div>

      {/* Main Card */}
      <div
        className="relative z-10 w-full max-w-6xl h-full min-h-[600px] flex flex-col md:flex-row bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ borderRadius: "var(--border-radius)" }}
      >
        {/* Left Side - University Info & Branding */}
        <div
          className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {/* Subtle gradient overlay to add depth directly to the primary brand color */}
          <div
            className="absolute inset-0 z-0 mix-blend-multiply opacity-50"
            style={{
              background:
                "linear-gradient(to bottom right, var(--color-primary), #000000)",
            }}
          ></div>

          {/* Decorative shapes */}
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: "var(--color-accent)" }}
          ></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="University Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <GraduationCap className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2
                className="text-2xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {universityName}
              </h2>
            </div>
          </div>

          <div className="relative z-10 my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-blue-50 mb-6 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Secure Authentication</span>
            </div>

            <h1
              className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {portalName.charAt(0).toUpperCase() + portalName.slice(1)} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                Access Portal
              </span>
            </h1>

            <p
              className="text-lg max-w-md leading-relaxed"
              style={{ color: taglineColor }}
            >
              {tagline}
            </p>

            <div className="mt-12 space-y-5">
              <div className="flex items-center gap-4 text-blue-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">
                  Interactive AI-based Dashboards
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">
                  Real-time GPA/CGPA Predictions
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">24/7 AskAI support access</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm mt-8 flex justify-between items-center opacity-70">
            <span>
              © {new Date().getFullYear()} {universityName}.
            </span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          {/* Mobile Header (only visible on small screens) */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2
                className="text-xl font-bold tracking-tight"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {universityName}
              </h2>
              <p
                className="text-xs font-bold tracking-wide uppercase"
                style={{ color: "var(--color-primary)" }}
              >
                Portal Login
              </p>
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <h2
                className="text-3xl font-bold mb-3"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Welcome back
              </h2>
              <p
                className="text-base"
                style={{ color: "var(--color-text-muted)" }}
              >
                Please enter your university credentials to access your
                dashboard.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  University Email or ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      className="h-5 w-5"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ color: "var(--color-text)" }}
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ color: "var(--color-text)" }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 border-slate-300 rounded cursor-pointer"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm cursor-pointer"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all group disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {isAuthLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Having trouble logging in? <br className="sm:hidden" />{" "}
                  Contact{" "}
                  <a
                    href="#"
                    className="font-medium hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    IT Support Services
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

