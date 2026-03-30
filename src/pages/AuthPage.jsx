import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'
import { isSupabaseConfigured } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAppStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/')
      } else {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return
        }
        await signUp(email, password)
        toast.success('Check your email to confirm your account!')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleDemoMode() {
    // signIn with no credentials triggers demo mode
    signIn('', '')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-warm-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🌿</div>
        <h1 className="text-3xl font-semibold text-sage-800">Innermark</h1>
        <p className="text-warm-500 mt-1 text-sm">Your daily life check-in</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab toggle */}
        <div className="flex bg-warm-100 rounded-2xl p-1 mb-6">
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-white text-sage-700 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              className="input-field"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {!isSupabaseConfigured && (
          <div className="mt-4 text-center">
            <div className="text-xs text-warm-400 mb-2">— or —</div>
            <button
              onClick={handleDemoMode}
              className="btn-secondary w-full text-sm"
            >
              Try Demo Mode
            </button>
            <p className="text-xs text-warm-400 mt-2">No account needed · Uses sample data</p>
          </div>
        )}

        <p className="text-center text-xs text-warm-400 mt-6">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  )
}
