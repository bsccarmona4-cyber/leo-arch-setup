// 🏪 KREID — Stripe Checkout Session (Vercel Serverless)
// Endpoint: POST /api/create-checkout-session
// Mercado: México (MXN)

import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kreid.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Stripe key not configured' });

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

  try {
    const { line_items, shipping_cost, email, customer_name, success_url, cancel_url, shipping_address } = req.body;

    if (!line_items || line_items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    for (const item of line_items) {
      if (!item.price_data?.currency || !item.price_data?.unit_amount || !item.quantity) {
        return res.status(400).json({ error: 'Invalid line item structure' });
      }
    }

    if (!shipping_address || !shipping_address.line1 || !shipping_address.city || !shipping_address.state || !shipping_address.postal_code || !shipping_address.name) {
      return res.status(400).json({
        error: 'Dirección de envío requerida. Completa todos los campos: nombre, dirección, ciudad, estado y código postal.',
      });
    }

    console.log(`📦 Creando sesión de checkout para ${line_items.length} productos...`);
    console.log(`📍 Envío: ${shipping_address.name}, ${shipping_address.city}, ${shipping_address.state} ${shipping_address.postal_code}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      line_items,
      shipping_address_collection: {
        allowed_countries: ['MX'],
      },
      shipping_options: [
        shipping_cost && shipping_cost > 0
          ? {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: shipping_cost, currency: 'mxn' },
                display_name: 'Envío Estándar (3-7 días)',
                delivery_estimate: {
                  minimum: { unit: 'business_day', value: 3 },
                  maximum: { unit: 'business_day', value: 7 },
                },
              },
            }
          : {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: 0, currency: 'mxn' },
                display_name: 'Envío Gratis',
                delivery_estimate: {
                  minimum: { unit: 'business_day', value: 3 },
                  maximum: { unit: 'business_day', value: 7 },
                },
              },
            },
      ].filter(Boolean),
      success_url: success_url || `${req.headers.origin || 'https://kreid.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.origin || 'https://kreid.vercel.app'}/checkout`,
      metadata: {
        customer_name: customer_name || shipping_address?.name || '',
        source: 'kreid-beauty',
        shipping_name: shipping_address.name,
        shipping_line1: shipping_address.line1,
        shipping_city: shipping_address.city,
        shipping_state: shipping_address.state,
        shipping_zip: shipping_address.postal_code,
        shipping_country: shipping_address.country || 'MX',
      },
    });

    console.log(`✅ Sesión: ${session.id} — $${(session.amount_total / 100).toFixed(2)} MXN`);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('❌ Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}