import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'

function ResetPasswordPage() {
  const { config, university } = useTenant()
  const { uidb64, token } = useParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading]             = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.resetPassword(uidb64, token, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      const errors = err.response?.data
      const message =
        errors?.detail ||
        errors?.non_field_errors?.[0]?.detail ||
        errors?.new_password?.[0]?.detail ||
        'Something went wrong'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">

        <p
          style={{ color: config?.color }}
          className="text-center uppercase tracking-widest text-sm font-semibold mb-1"
        >
          {university}
        </p>

        <h1
          style={{ color: config?.color }}
          className="text-3xl font-bold text-center mb-2"
        >
          Reset Password
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
              placeholder="Min 8 chars, uppercase, number, special char"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
              placeholder="Repeat your new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: config?.color }}
            className="w-full text-white py-2 rounded-lg transition disabled:opacity-50 hover:opacity-90"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              style={{ color: config?.color }}
              className="text-sm hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage