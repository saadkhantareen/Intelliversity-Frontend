import { useTenant } from '@/features/tenant';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Mail, Lock, GraduationCap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import PortalNotFound from '@/app/pages/errors/PortalNotFound';
import { getRecaptchaToken } from '../api/recaptcha.service';

export default function LoginPage() {
  const { tenant, isTenantLoading, error } = useTenant();
  const { login, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    e.preventDefault();
    if (!emailValid) {
      toast.error('Enter a valid university email');
      return;
    }

    try {
      const recaptchaToken = await getRecaptchaToken('login');
      await login({ email, password, recaptcha_token: recaptchaToken });
      navigate('/dashboard');
    } catch (error) {
      // error already shown via toast in AuthContext
    }
  };

  const bgImage = tenant?.page_asset?.background_image_url;
  // "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
  const logoUrl = tenant?.logo_url;
  // Fallbacks applied in case of empty strings in tenant payload
  const universityName = tenant?.university_name || 'Grand Horizon University';
  const portalName = tenant?.portal_name || 'Student & Faculty Access Portal';
  const tagline =
    tenant?.page_asset?.metadata?.tagline ||
    'Your centralized hub for academic resources, course management, and campus communications.';
  const taglineColor = tenant?.page_asset?.metadata?.tagline_color || 'var(--brand-surface)';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative bg-background">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
      </div>

      {/* Main Card */}
      <div
        className="relative z-10 w-full max-w-6xl min-h-[600px] h-auto max-h-[95vh] flex flex-col md:flex-row bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ borderRadius: 'var(--border-radius)' }}
      >
        {/* Left Side - University Info & Branding */}
        <div
          className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden text-white"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          {/* Subtle gradient overlay to add depth directly to the primary brand color */}
          <div
            className="absolute inset-0 z-0 mix-blend-multiply opacity-50"
            style={{
              background:
                'linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))',
            }}
          ></div>

          {/* Decorative shapes */}
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          ></div>

          <div className="relative z-10 flex items-center gap-4">
            {/* 1. Solid white background for the container to blend with JPG/solid logos */}
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${universityName} Logo`}
                  /* 2. Removed p-2 so the logo fills the space and blends perfectly */
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Fallback styling if no logo exists */
                <div
                  className="w-full h-full bg-white/10 backdrop-blur-md flex items-center justify-center"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <div>
              <h2
                /* 3. Added 'uppercase' to force COMSATS */
                className="text-5xl font-bold tracking-tight text-white uppercase"
                style={{ fontFamily: 'var(--brand-font-heading)' }}
              >
                {universityName}
              </h2>
            </div>
          </div>

          <div className="relative z-10 my-auto">
            <h1
              className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white"
              style={{ fontFamily: 'var(--brand-font-heading)' }}
            >
              {portalName.charAt(0).toUpperCase() + portalName.slice(1)} <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--brand-accent), var(--brand-surface))',
                }}
              >
                Access Portal
              </span>
            </h1>

            <p
              className="text-lg max-w-md leading-relaxed"
              style={{ color: taglineColor, opacity: 0.9 }}
            >
              {tagline}
            </p>

            <div className="mt-12 space-y-5">
              <div className="flex items-center gap-4" style={{ color: 'var(--brand-surface)' }}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Interactive AI-based Dashboards</span>
              </div>
              <div className="flex items-center gap-4" style={{ color: 'var(--brand-surface)' }}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Real-time GPA/CGPA Predictions</span>
              </div>
              <div className="flex items-center gap-4" style={{ color: 'var(--brand-surface)' }}>
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
          className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative overflow-y-auto"
          style={{ backgroundColor: 'var(--brand-surface)' }}
        >
          {/* Mobile Header (only visible on small screens) */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2
                className="text-xl font-bold tracking-tight"
                style={{
                  color: 'var(--brand-text)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                {universityName}
              </h2>
              <p
                className="text-xs font-bold tracking-wide uppercase"
                style={{ color: 'var(--brand-primary)' }}
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
                  color: 'var(--brand-text)',
                  fontFamily: 'var(--brand-font-heading)',
                }}
              >
                Welcome back
              </h2>
              <p className="text-base" style={{ color: 'var(--brand-text-muted)' }}>
                Please enter your university credentials to access your dashboard.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--brand-text)' }}
                >
                  University Email or ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" style={{ color: 'var(--brand-text-muted)' }} />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-400 shadow-md rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ color: 'var(--brand-text)' }}
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
                    style={{ color: 'var(--brand-text)' }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: 'var(--brand-text-muted)' }} />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-400 border-size shadow-md rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ color: 'var(--brand-text)' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all group disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: 'var(--brand-primary)' }}
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
                <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                  Having trouble logging in? <br className="sm:hidden" /> Contact{' '}
                  <a
                    href="#"
                    className="font-medium hover:underline"
                    style={{ color: 'var(--brand-primary)' }}
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
