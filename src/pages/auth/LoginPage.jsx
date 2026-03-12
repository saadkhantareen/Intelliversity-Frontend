import { useTenant } from '../../context/TenantContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function LoginPage() {
  const { config, university } = useTenant()
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (error) {
      // error already shown via toast in AuthContext
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
          {config?.label}
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Sign in to continue
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: config?.color }}
            className="w-full text-white py-2 rounded-lg transition disabled:opacity-50 hover:opacity-90"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage