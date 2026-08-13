import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenant } from '@/features/tenant';
import { authService } from '../api/auth.service';
import toast from 'react-hot-toast';

function ResetPasswordPage() {
  const { config, university } = useTenant();
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const primary = config?.color || '#4f46e5'; // fallback (indigo)

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.resetPassword(uidb64, token, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      const message =
        errors?.detail ||
        errors?.non_field_errors?.[0]?.detail ||
        errors?.new_password?.[0]?.detail ||
        'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-6">
            <p
              style={{ color: primary }}
              className="uppercase tracking-widest text-xs font-semibold mb-2"
            >
              {university}
            </p>

            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>

            <p className="text-gray-400 text-sm mt-1">Create a new secure password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 
                         focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: '#e5e7eb',
                  outlineColor: primary,
                  boxShadow: `0 0 0 2px ${primary}20`,
                }}
                placeholder="Enter new password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 
                         focus:outline-none focus:ring-2 transition"
                style={{
                  boxShadow: `0 0 0 2px ${primary}20`,
                }}
                placeholder="Re-enter password"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: primary }}
              className="w-full text-white py-2.5 rounded-xl font-medium 
                       shadow-md hover:opacity-90 transition-all duration-200 
                       disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200"></div>
              OR
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Back link */}
            <div className="text-center">
              <Link
                to="/login"
                style={{ color: primary }}
                className="text-sm font-medium hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Use at least 8 characters with a mix of letters, numbers & symbols.
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
