import { useState } from 'react'
import { PLANS } from '../../lib/stripe'
import toast from 'react-hot-toast'
import useAppStore from '../../store/useAppStore'

export default function PremiumPrompt({ onClose }) {
  const [billingCycle, setBillingCycle] = useState('yearly') // monthly | yearly
  const [loading, setLoading] = useState(false)
  const { user } = useAppStore()

  async function handleUpgrade() {
    setLoading(true)
    try {
      // In a real implementation, call your backend to create a Stripe Checkout session
      // For now, show a helpful message
      toast.success('Redirecting to checkout... (Stripe not configured in demo mode)')
      // Real implementation:
      // const session = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId: PRICES[billingCycle], userId: user.id })
      // }).then(r => r.json())
      // window.location.href = session.url
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg animate-slide-up"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-200" />
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-warm-800">✨ Go Premium</h2>
              <p className="text-sm text-warm-400">Unlock the full Innermark experience</p>
            </div>
            <button onClick={onClose} className="text-warm-300 hover:text-warm-500 text-2xl leading-none">×</button>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-5">
            {[
              { icon: '🎯', text: 'Up to 25 topics (vs 8 free)' },
              { icon: '📊', text: 'Full history — no 30-day limit' },
              { icon: '📈', text: 'Advanced trends and patterns' },
              { icon: '💡', text: 'Full insights and teachings library' },
              { icon: '🔔', text: 'Reliable daily reminders' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm text-warm-700">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex bg-warm-100 rounded-2xl p-1 mb-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-warm-800 shadow-sm'
                  : 'text-warm-400'
              }`}
            >
              Monthly
              <span className="block text-xs font-normal text-warm-400">$6.99 / month</span>
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-warm-800 shadow-sm'
                  : 'text-warm-400'
              }`}
            >
              Yearly
              <span className="block text-xs font-normal text-warm-400">$49.99 / year</span>
              <span className="absolute -top-2 -right-1 bg-sage-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                Save 40%
              </span>
            </button>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary w-full text-base mb-3"
          >
            {loading ? 'Loading...' : (
              billingCycle === 'yearly'
                ? 'Start for $49.99 / year'
                : 'Start for $6.99 / month'
            )}
          </button>

          <button onClick={onClose} className="btn-ghost w-full text-sm text-warm-400">
            Maybe later
          </button>

          <p className="text-center text-xs text-warm-300 mt-3">
            Cancel anytime · Secure payment via Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
