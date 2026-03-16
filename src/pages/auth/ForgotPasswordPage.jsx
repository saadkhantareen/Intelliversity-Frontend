import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'

function ForgotPasswordPage() {
  const { config, university } = useTenant()
  const [email, setEmail]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSubmitted(true)
    } catch (err) {
      const errors = err.response?.data
      const message =
        errors?.email?.[0]?.detail ||
        errors?.detail ||
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
          Forgot Password
        </h1>

        {submitted ? (
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-4">
              If an account with that email exists, a reset link has been sent. Check your inbox.
            </p>
            <Link
              to="/login"
              style={{ color: config?.color }}
              className="text-sm font-medium hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-center mb-8">
              Enter your university email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                  placeholder="you@university.edu.pk"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: config?.color }}
                className="w-full text-white py-2 rounded-lg transition disabled:opacity-50 hover:opacity-90"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage