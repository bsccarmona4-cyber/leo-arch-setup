import { Link, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ChevronLeft, Truck, Shield, Clock, Star, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { CURRENCY, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, formatMXN } from '../lib/stripe'
import { trackViewCart } from '../lib/analytics'

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = totalPrice + shipping
  const progressPct = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)

  useEffect(() => {
    if (items.length > 0) {
      trackViewCart(items, total)
    }
  }, [items.length])

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <ShoppingCart size={36} style={{ color: 'var(--rose)' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8, color: 'var(--dark)' }}>Tu carrito está vacío</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Aún no has agregado productos. ¡Explora nuestra tienda!</p>
            <Link to="/products" className="btn btn-primary">
              Ver Tienda <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Tu Carrito</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{items.length} producto{items.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/products" style={{ color: 'var(--rose)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={16} /> Seguir comprando
          </Link>
        </div>

        {/* Free shipping progress */}
        {totalPrice < FREE_SHIPPING_THRESHOLD && (
          <div style={{
            background: 'var(--rose-light)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <Truck size={18} style={{ color: 'var(--rose)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--dark)', fontWeight: 500 }}>
              ¡Te faltan {formatMXN(FREE_SHIPPING_THRESHOLD - totalPrice)} para envío gratis!
            </span>
            <div style={{
              flex: 1, height: 8, background: 'var(--white)', borderRadius: 4, overflow: 'hidden',
              minWidth: 100,
            }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--rose), var(--berry))',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{progressPct.toFixed(0)}%</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                gap: 16,
                padding: 16,
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)',
              }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--cream)',
                  flexShrink: 0,
                }}>
                  <img src={item.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{item.name}</h3>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--berry)' }}>{formatMXN(item.price)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '4px 8px' }}>
                      <button onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', display: 'flex' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', display: 'flex' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)',
            padding: 24,
            position: 'sticky',
            top: 100,
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Resumen</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{formatMXN(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                <span>Envío</span>
                <span style={{ fontWeight: shipping === 0 ? 600 : 400, color: shipping === 0 ? 'var(--success)' : 'var(--dark)' }}>
                  {shipping === 0 ? 'GRATIS' : formatMXN(shipping)}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--berry)' }}>{formatMXN(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
              Pagar Ahora <Lock size={16} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: 'var(--gray-400)', fontSize: '0.75rem' }}>
              <Shield size={14} /> Pago 100% seguro
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                <Truck size={14} /> Envíos a todo México
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                <Clock size={14} /> Entrega 3-7 días hábiles
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                <Shield size={14} /> Garantía de felicidad 30 días
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
