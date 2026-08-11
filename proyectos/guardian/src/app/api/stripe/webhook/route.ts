import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/db/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  try {
    const event = await constructWebhookEvent(body, signature)
    const db = getSupabaseAdmin()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const customerEmail = session.customer_details?.email || session.customer_email
        const customerId = session.customer
        const planId = session.metadata?.plan_id || 'mensual'
        const stripeSessionId = session.id

        // Actualizar intent en DB
        await db.from('subscription_intents')
          .update({
            status: 'completed',
            stripe_customer_id: customerId,
            completed_at: new Date().toISOString(),
          } as any)
          .eq('stripe_session_id', stripeSessionId)

        // Crear suscripción activa
        await db.from('subscriptions').upsert({
          stripe_session_id: stripeSessionId,
          stripe_customer_id: customerId,
          email: customerEmail,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          created_at: new Date().toISOString(),
        } as any)

        console.log(`✅ Nueva suscripción: ${customerEmail} — ${planId}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const customerId = sub.customer
        const status = sub.status // active, past_due, canceled, etc.

        await db.from('subscriptions')
          .update({ status, updated_at: new Date().toISOString() } as any)
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subDel = event.data.object as any
        const customerIdDel = subDel.customer

        await db.from('subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() } as any)
          .eq('stripe_customer_id', customerIdDel)
        console.log(`❌ Suscripción cancelada: ${customerIdDel}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        console.log(`💰 Pago recibido: ${invoice.id} — ${invoice.amount_paid / 100} ${invoice.currency}`)
        break
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as any
        const customerEmailFail = failedInvoice.customer_email
        console.log(`⚠️ Pago falló: ${customerEmailFail}`)
        // Aquí enviarías email de "tu pago falló, actualiza tarjeta"
        break
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[stripe/webhook]', error)
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }
}
