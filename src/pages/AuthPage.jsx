import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAppStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (mode === 'forgot') {
      if (!email) return
      setLoading(true)
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `https://getinnermark.com/reset-password`,
        })
        if (error) throw error
        toast.success('Password reset link sent! Check your email.')
        setMode('login')
      } catch (err) {
        toast.error(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
      return
    }

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
        if (password !== confirmPassword) {
          toast.error('Passwords do not match')
          return
        }
        await signUp(email, password, marketingConsent, firstName.trim() || null)
        toast.success('Check your email to confirm your account!')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleDemoMode() {
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

        {mode === 'forgot' ? (
          // Forgot password view
          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-warm-800">Reset your password</h2>
              <p className="text-sm text-warm-400 mt-1">We'll send a reset link to your email</p>
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
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-sm text-warm-400 hover:text-warm-600 mt-4"
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          // Login / signup view
          <>
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
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    className="input-field"
                    autoComplete="given-name"
                  />
                </div>
              )}
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    className="input-field pr-12"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    minLength={mode === 'signup' ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 text-lg select-none"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`input-field pr-12 ${confirmPassword && password !== confirmPassword ? 'border-red-300' : confirmPassword && password === confirmPassword ? 'border-sage-400' : ''}`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 text-lg select-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-sage-600 mt-1">✓ Passwords match</p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-sage-600 hover:text-sage-800"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {mode === 'signup' && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={e => setMarketingConsent(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setMarketingConsent(v => !v)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        marketingConsent
                          ? 'bg-sage-500 border-sage-500'
                          : 'bg-white border-warm-300'
                      }`}
                    >
                      {marketingConsent && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <span className="text-xs text-warm-500 leading-relaxed">
                    I'd like to receive occasional emails about tips, new features, and resources related to personal growth and integration. You can unsubscribe anytime.
                  </span>
                </label>
              )}

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
                <button onClick={handleDemoMode} className="btn-secondary w-full text-sm">
                  Try Demo Mode
                </button>
                <p className="text-xs text-warm-400 mt-2">No account needed · Uses sample data</p>
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-warm-400 mt-6">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  )
}
