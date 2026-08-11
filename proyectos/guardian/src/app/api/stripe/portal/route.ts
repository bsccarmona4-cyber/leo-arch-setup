import { NextRequest, NextResponse } from 'next/server'
import { createPortalSession } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/db/supabase'

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      // Buscar por email
      const { email } = await request.json()
      if (!email) {
        return NextResponse.json({ error: 'Se requiere customerId o email' }, { status: 400 })
      }

      const db = getSupabaseAdmin()
      const { data: subs } = await db
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('email', email)
        .eq('status', 'active')
        .single()

      if (!subs || !(subs as any).stripe_customer_id) {
        return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
      }

      const session = await createPortalSession(
        (subs as any).stripe_customer_id,
        `${process.env.NEXT_PUBLIC_BASE_URL}/planes`
      )

      return NextResponse.json({ url: session.url }, { status: 200 })
    }

    const session = await createPortalSession(
      customerId,
      `${process.env.NEXT_PUBLIC_BASE_URL}/planes`
    )

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error('[stripe/portal]', error)
    return NextResponse.json({ error: 'Error al crear portal' }, { status: 500 })
  }
}
