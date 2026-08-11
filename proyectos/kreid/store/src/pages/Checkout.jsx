import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ChevronLeft, Package, Shield, Clock } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { formatMXN, CURRENCY, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '../lib/stripe'
import { trackBeginCheckout, trackPurchase } from '../lib/analytics'

export default function Checkout() {
  const { items, totalPrice } = useCart()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [purchaseTracked, setPurchaseTracked] = useState(false)
  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  })

  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = totalPrice + shipping

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    const checkoutItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))
    trackBeginCheckout(checkoutItems, total)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    if (!purchaseTracked) {
      trackPurchase('pending_' + Date.now(), items, total, shipping)
      setPurchaseTracked(true)
    }

    try {
      const lineItems = items.map(item => ({
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      }))

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems,
          customer_email: form.email,
          shipping: { name: form.name, address: `${form.address}, ${form.city}, ${form.state}, ${form.zip}` },
          metadata: { source: 'kreid-web' },
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL received:', data)
        alert('Error al procesar el pago. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Error al conectar con el sistema de pago.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Checkout</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Completa tus datos para pagar</p>
          </div>
          <Link to="/cart" style={{ color: 'var(--rose)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={16} /> Volver al carrito
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Shipping form */}
          <form onSubmit={handleSubmit} style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)',
            padding: 32,
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24 }}>Información de envío</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@correo.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'var(--gray-50)',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="María García"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'var(--gray-50)',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="55 1234 5678"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'var(--gray-50)',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Calle y número"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'var(--gray-50)',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="Toluca"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'var(--gray-50)',
                      fontFamily: 'inherit',
                      transition: 'var(--transition)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    placeholder="Edo. México"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'var(--gray-50)',
                      fontFamily: 'inherit',
                      transition: 'var(--transition)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }}>
                    CP
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    required
                    placeholder="50000"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'var(--gray-50)',
                      fontFamily: 'inherit',
                      transition: 'var(--transition)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--rose)'; e.target.style.background = 'var(--white)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 24, justifyContent: 'center', opacity: processing ? 0.7 : 1 }}
            >
              {processing ? 'Procesando...' : `Pagar ${formatMXN(total)}`}
              <Lock size={18} />
            </button>

            <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: 12 }}>
              Pago procesado de forma segura por Stripe
            </p>
          </form>

          {/* Order summary sidebar */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)',
            padding: 24,
            position: 'sticky',
            top: 100,
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Tu pedido</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--cream)',
                    flexShrink: 0,
                  }}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Cant: {item.quantity}</p>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--berry)' }}>{formatMXN(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatMXN(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                <span>Envío</span>
                <span style={{ fontWeight: shipping === 0 ? 600 : 400, color: shipping === 0 ? 'var(--success)' : 'var(--dark)' }}>
                  {shipping === 0 ? 'GRATIS' : formatMXN(shipping)}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--berry)', fontSize: '1.1rem' }}>{formatMXN(total)}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                <Shield size={14} /> Pago 100% seguro con Stripe
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                <Package size={14} /> Envíos a todo México
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                <Clock size={14} /> Entrega 3-7 días hábiles
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
