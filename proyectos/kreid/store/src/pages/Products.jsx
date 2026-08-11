import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, ChevronDown, ShoppingCart, Sparkles } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { trackSearch, trackAddToCart } from '../lib/analytics'

const allProducts = [
  { id: 'led-mask', name: 'Mascarilla LED 7 Colores', price: 1999, original_price: 2499, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', category: 'Luz LED', badge: 'Más Vendido' },
  { id: 'boots-compression', name: 'Botas de Compresión Recovery', price: 2499, original_price: 3299, rating: 4.5, reviews: 47, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', category: 'Movimiento', badge: 'Nuevo' },
  { id: 'roller-jade', name: 'Rodillo Facial de Jade', price: 349, original_price: null, rating: 4.9, reviews: 203, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80', category: 'Facial Tools', badge: 'Popular' },
  { id: 'thermometer-ir', name: 'Termómetro Infrarrojo Digital', price: 459, original_price: 599, rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&q=80', category: 'Bienestar', badge: 'Oferta' },
  { id: 'fascia-gun', name: 'Pistola de Masaje Fascia', price: 1299, original_price: 1699, rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80', category: 'Movimiento', badge: null },
  { id: 'organizer-magnetic', name: 'Organizador Magnético Nevera', price: 299, original_price: 399, rating: 4.3, reviews: 67, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', category: 'Hogar', badge: null },
  { id: 'microscope-kids', name: 'Microscopio Infantil 1200X', price: 599, original_price: null, rating: 4.4, reviews: 34, image: 'https://images.unsplash.com/photo-1581092335871-4c31532f5e1a?w=400&q=80', category: 'Kids', badge: 'Educativo' },
  { id: 'wrist-rest', name: 'Reposamuñecas Ergonómico', price: 249, original_price: 349, rating: 4.2, reviews: 112, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80', category: 'Oficina', badge: 'Oferta' },
]

const categories = ['Todos', 'Luz LED', 'Movimiento', 'Facial Tools', 'Bienestar', 'Hogar', 'Kids', 'Oficina']

export default function Products() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [sort, setSort] = useState('default')
  const { addItem } = useCart()

  useEffect(() => {
    if (search.length >= 2) {
      const debounce = setTimeout(() => trackSearch(search), 500)
      return () => clearTimeout(debounce)
    }
  }, [search])

  const formatMXN = (price) => {
    return `$${price.toLocaleString('es-MX')}`
  }

  let filtered = allProducts.filter(p => {
    if (category !== 'Todos' && p.category !== category) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating)

  const handleQuickAdd = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    trackAddToCart(product)
  }

  return (
    <div className="products-page" style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="section-header">
          <h1>✨ Todos los Productos</h1>
          <p>Belleza, bienestar y salud para todo México</p>
        </div>

        {/* ─── Filters ─── */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: category === c ? '2px solid var(--rose)' : '1px solid var(--gray-200)',
                  background: category === c ? 'var(--rose-light)' : 'var(--white)',
                  color: category === c ? 'var(--rose-dark)' : 'var(--gray-600)',
                  fontWeight: category === c ? 600 : 400,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: 'var(--white)',
                  minWidth: 200,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Sort */}
            <div style={{ position: 'relative' }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  padding: '10px 36px 10px 16px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  background: 'var(--white)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                  appearance: 'none',
                  color: 'var(--dark)',
                }}
              >
                <option value="default">Ordenar</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating">Mejor calificados</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* ─── Products Grid ─── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <Sparkles size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No encontramos productos con ese filtro</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(p => (
              <Link to={`/products/${p.id}`} key={p.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  {p.badge && <span className="product-badge">{p.badge}</span>}
                  <button className="quick-add-btn" onClick={(e) => handleQuickAdd(p, e)}>
                    <ShoppingCart size={16} />
                  </button>
                </div>
                <div className="product-info-pad">
                  <span className="product-card-category">{p.category}</span>
                  <h3>{p.name}</h3>
                  <div className="rating-row">
                    <div className="stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.floor(p.rating) ? '#C48BA8' : 'none'} color="#C48BA8" strokeWidth={1.5} />
                      ))}
                    </div>
                    <span className="rating-value">{p.rating}</span>
                    <span className="rating-count">({p.reviews})</span>
                  </div>
                  <div className="price-row">
                    <span className="price-current">{formatMXN(p.price)}</span>
                    {p.original_price && <span className="price-original">{formatMXN(p.original_price)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
