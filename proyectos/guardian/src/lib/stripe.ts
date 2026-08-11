import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY!
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-03-31.basil' as any,
  typescript: true,
})

export const PLANS = {
  mensual: { priceId: 'price_mensual', name: 'Mensual', amount: 9900, currency: 'mxn' },
  trimestral: { priceId: 'price_trimestral', name: 'Trimestral', amount: 24900, currency: 'mxn' },
  anual: { priceId: 'price_anual', name: 'Anual', amount: 79900, currency: 'mxn' },
} as const

export type PlanId = keyof typeof PLANS

export async function createCheckoutSession(params: {
  planId: PlanId
  customerEmail: string
  customerName?: string
  successUrl: string
  cancelUrl: string
}) {
  const plan = PLANS[params.planId]

  // Buscar o crear customer
  const customers = await stripe.customers.list({ email: params.customerEmail, limit: 1 })
  let customer = customers.data[0]
  if (!customer) {
    customer = await stripe.customers.create({
      email: params.customerEmail,
      name: params.customerName,
      metadata: { plan: params.planId },
    })
  }

  // Crear sesión checkout
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    line_items: [{ price_data: {
      currency: plan.currency,
      product_data: {
        name: `Guardián ${plan.name}`,
        description: `Protección anti-fraude digital para tu familia`,
      },
      unit_amount: plan.amount,
      recurring: { interval: params.planId === 'anual' ? 'year' : 'month' },
    }, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { plan_id: params.planId },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })

  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function constructWebhookEvent(body: string, signature: string) {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}
