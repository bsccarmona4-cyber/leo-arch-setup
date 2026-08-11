import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, PLANS, type PlanId } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/db/supabase'
import { z } from 'zod'

const bodySchema = z.object({
  planId: z.enum(['mensual', 'trimestral', 'anual']),
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  familiarPhone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { planId, email, name, familiarPhone } = parsed.data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await createCheckoutSession({
      planId: planId as PlanId,
      customerEmail: email,
      customerName: name,
      successUrl: `${baseUrl}/planes/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/planes?canceled=true`,
    })

    // Guardar intent en DB antes del pago
    const db = getSupabaseAdmin()
    await db.from('subscription_intents').insert({
      stripe_session_id: session.id,
      email,
      plan_id: planId,
      familiar_phone: familiarPhone || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    } as any)

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error('[stripe/create-checkout]', error)
    return NextResponse.json({ error: 'Error al crear checkout' }, { status: 500 })
  }
}
