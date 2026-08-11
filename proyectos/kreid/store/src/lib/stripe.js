import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// MXN — Moneda para México
export const CURRENCY = 'mxn'
export const SHIPPING_COST = 149  // $149 MXN envío estándar
export const FREE_SHIPPING_THRESHOLD = 999  // Envío gratis +$999 MXN

export function formatMXN(price) {
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
