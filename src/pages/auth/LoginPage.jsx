import { useTenant } from '../../context/TenantContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const { config, university } = useTenant()
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
         await login({ email, password })
    navigate('/dashboard')
    } catch (error) {
        
    }
   
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">

        {/* University Name */}
        <p 
          style={{ color: config?.color }}
          className="text-center uppercase tracking-widest text-sm font-semibold mb-1"
        >
          {university}
        </p>

        {/* Portal Label */}
        <h1 
          style={{ color: config?.color }}
          className="text-3xl font-bold text-center mb-2"
        >
          {config?.label}
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Sign in to continue
        </p>

       

        {/* Form */}
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
              style={{ outlineColor: config?.color }}
              placeholder="Enter your email"
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
              style={{ outlineColor: config?.color }}
              placeholder="Enter your password"
              required
            />
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
// ```

// ---

// **Result:**
// ```
// student.nust.localhost      → Blue   🔵
// faculty.nust.localhost      → Green  🟢
// registration.nust.localhost → Yellow 🟡