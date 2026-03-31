import { loadStripe } from '@stripe/stripe-js'

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

export const getStripe = () => {
  if (!stripePublicKey) {
    console.warn('Stripe public key not set. Payment features disabled.')
    return null
  }
  return loadStripe(stripePublicKey)
}

export const PRICES = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    topicsLimit: 8,
    historyDays: 30,
    features: ['Up to 8 topics', '30 days of history', 'Daily check-ins', 'Basic trends'],
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 6.99,
    yearlyPrice: 49.99,
    topicsLimit: 25,
    historyDays: Infinity,
    features: [
      'Up to 25 topics',
      'Full history',
      'Advanced trends & insights',
      'All teachings & content',
      'Priority support',
    ],
  },
}
