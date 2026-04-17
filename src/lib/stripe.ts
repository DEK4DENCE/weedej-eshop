import Stripe from 'stripe'

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined
}

export function getStripe(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  const instance = new Stripe(key, {
    apiVersion: '2025-03-31.basil',
    typescript: true,
  })
  if (process.env.NODE_ENV !== 'production') globalForStripe.stripe = instance
  return instance
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  return secret
}

/** @deprecated use getStripe() */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})
