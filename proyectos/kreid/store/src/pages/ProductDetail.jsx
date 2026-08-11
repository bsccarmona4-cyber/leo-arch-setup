import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, Truck, Shield, Check, Minus, Plus, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { trackViewItem, trackAddToCart } from '../lib/analytics'

const productData = {
  'led-mask': {
    id: 'led-mask', name: 'Mascarilla LED 7 Colores', price: 1999, original_price: 2499, rating: 4.8, reviews: 128,
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    ],
    category: 'Luz LED', badge: 'Más Vendido',
    description: 'Mascarilla LED con 7 colores para una experiencia de cuidado facial profesional en casa. Luz roja (apariencia juvenil), azul (limpieza profunda), verde (tono uniforme), amarillo (luminosidad), cian (calmante), purpura (renovacion), blanco (full spectrum). Resultados visibles en 4-6 semanas usando 10-20 minutos al dia.',
    features: ['7 Colores LED', 'Control Remoto', 'Temporizador 10-20 min', 'Material Silicona', 'USB Recargable', 'Uso Facial Completo'],
    reviews_list: [
      { user: 'María G.', rating: 5, text: 'Mi piel esta radiante despues de un mes. Noto menos lineas finas.' },
      { user: 'Ana L.', rating: 5, text: 'Me encanta. La uso 15 min diarios y mi piel se ve mucho mejor.' },
      { user: 'Carmen R.', rating: 4, text: 'Buena calidad. Los resultados son graduales pero se notan.' },
    ],
    stock: true, sku: 'KRD-LED-001', shipping_days: '3-7'
  },
  'boots-compression': {
    id: 'boots-compression', name: 'Botas de Compresión Recovery', price: 2499, original_price: 3299, rating: 4.5, reviews: 47,
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80',
    ],
    category: 'Movimiento', badge: 'Nuevo',
    description: 'Sistema de compresion neumatica para piernas que brinda una sensacion de bienestar. 3 modos de presion y 2 intensidades. Ideal para despues del ejercicio, ayuda a lograr una apariencia mas descansada.',
    features: ['3 Modos de Presión', '2 Niveles de Intensidad', 'Cobertura Completa Piernas', 'Control Remoto', 'Plegable y Portable', 'Bienestar Diario'],
    reviews_list: [
      { user: 'Luis M.', rating: 5, text: 'Después de correr maratón, esto es salvavidas. Recuperación mucho más rápida.' },
      { user: 'Diana P.', rating: 4, text: 'Muy cómodas. La presión es ajustable y se siente increíble.' },
      { user: 'Roberto S.', rating: 4, text: 'Buena inversión para entrenamiento serio. Material de calidad.' },
    ],
    stock: true, sku: 'KRD-REC-002', shipping_days: '5-10'
  },
  'roller-jade': {
    id: 'roller-jade', name: 'Rodillo Facial de Jade', price: 349, original_price: null, rating: 4.9, reviews: 203,
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    ],
    category: 'Facial Tools', badge: 'Popular',
    description: 'Rodillo facial de jade natural 100%. Para una apariencia mas descansada y sensacion de frescura. Uso diario para una piel con aspecto mas firme y luminoso. Incluye dos cabezales: grande para rostro y pequeno para contorno de ojos.',
    features: ['Jade Natural 100%', 'Doble Cabezal', 'Efecto Deshinchante', 'Sensacion de Frescura', 'Aspecto Firme y Luminoso', 'Uso Diario'],
    reviews_list: [
      { user: 'Sofía H.', rating: 5, text: 'Me cambió la rutina de skincare. Mi rostro se ve más definido.' },
      { user: 'Valentina R.', rating: 5, text: 'La calidad del jade es excelente. Se siente fresquito en la cara.' },
      { user: 'Gabriela T.', rating: 5, text: 'Perfecto para despertar la cara por las mañanas. Muy recomendado.' },
      { user: 'Fernanda L.', rating: 4, text: 'Buen producto, el cabezal pequeño es ideal para ojeras.' },
    ],
    stock: true, sku: 'KRD-FAC-003', shipping_days: '2-5'
  },
  'thermometer-ir': {
    id: 'thermometer-ir', name: 'Termómetro Infrarrojo Digital', price: 459, original_price: 599, rating: 4.6, reviews: 89,
    images: [
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
      'https://images.unsplash.com/photo-1631556159902-aa009f5f15b3?w=600&q=80',
    ],
    category: 'Bienestar', badge: 'Oferta',
    description: 'Termómetro infrarrojo digital sin contacto. Medición instantánea en 1 segundo. Ideal para toda la familia: frente, objeto y ambiente. Pantalla LCD retroiluminada con alarma de fiebre. Precisión profesional ±0.2°C.',
    features: ['Sin Contacto', 'Medición 1 Seg.', 'Pantalla LCD Retroiluminada', 'Alarma de Fiebre', 'Memoria 25 Lecturas', 'Precisión ±0.2°C'],
    reviews_list: [
      { user: 'Laura V.', rating: 5, text: 'Muy práctico con bebés en casa. Mide rápido sin despertarlos.' },
      { user: 'Pedro R.', rating: 4, text: 'Funciona bien, preciso. La pantalla se ve muy clara.' },
      { user: 'Mónica S.', rating: 4, text: 'Buen precio-calidad. Lo uso diario con mi familia.' },
    ],
    stock: true, sku: 'KRD-SAL-004', shipping_days: '3-5'
  },
  'fascia-gun': {
    id: 'fascia-gun', name: 'Pistola de Masaje Fascia', price: 1299, original_price: 1699, rating: 4.7, reviews: 156,
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80',
    ],
    category: 'Movimiento', badge: null,
    description: 'Pistola de masaje de percusion con 4 cabezales intercambiables, 5 velocidades y bateria de larga duracion. Silenciosa y potente. Pensada para un momento de relajacion y bienestar despues del ejercicio.',
    features: ['4 Cabezales', '5 Velocidades', 'Ultra Silenciosa', 'Batería 6hrs', 'Pantalla LED', 'Maletín Incluido'],
    reviews_list: [
      { user: 'Carlos M.', rating: 5, text: 'Increíble para después del gym. Afloja todos los nudos musculares.' },
      { user: 'Andrea F.', rating: 5, text: 'La uso para mi espalda y hombros. Me ha ayudado mucho con la tensión.' },
      { user: 'Jorge L.', rating: 4, text: 'Buena potencia y no hace tanto ruido. Las 5 velocidades son útiles.' },
    ],
    stock: true, sku: 'KRD-REC-005', shipping_days: '3-7'
  },
  'organizer-magnetic': {
    id: 'organizer-magnetic', name: 'Organizador Magnético Nevera', price: 299, original_price: 399, rating: 4.3, reviews: 67,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
    ],
    category: 'Hogar', badge: null,
    description: 'Organizador magnético ultra-fuerte para nevera. 3 compartimentos con imanes de neodimio. Almacena especias, condimentos, utensilios y más. Ahorra espacio en tu cocina con estilo moderno. Capacidad de carga hasta 5 kg.',
    features: ['Imanes Neodimio', '3 Compartimentos', 'Carga 5 kg', 'Acero Inoxidable', 'Fácil Instalación', 'No Daña Superficies'],
    reviews_list: [
      { user: 'Claudia N.', rating: 5, text: 'Mi cocina luce más ordenada. Los imanes son muy fuertes.' },
      { user: 'Ricardo G.', rating: 4, text: 'Buen producto, práctico. Le caben bastantes especias.' },
      { user: 'Elena M.', rating: 4, text: 'Buena calidad del acero. Se ve elegante en la nevera.' },
    ],
    stock: true, sku: 'KRD-HOG-006', shipping_days: '3-7'
  },
  'microscope-kids': {
    id: 'microscope-kids', name: 'Microscopio Infantil 1200X', price: 599, original_price: null, rating: 4.4, reviews: 34,
    images: [
      'https://images.unsplash.com/photo-1581092335871-4c31532f5e1a?w=600&q=80',
      'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600&q=80',
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80',
    ],
    category: 'Kids', badge: 'Educativo',
    description: 'Microscopio infantil con aumentos de 100X a 1200X. Incluye kit de preparación completo: portaobjetos, cubreobjetos, pinzas y muestras preparadas. Iluminación LED ajustable. Ideal para jóvenes científicos a partir de 6 años. Estimula la curiosidad y el aprendizaje STEM.',
    features: ['100X-1200X Aumentos', 'Kit de Preparación', 'Iluminación LED', 'Fácil de Usar', 'Edad 6+', 'STEM Learning'],
    reviews_list: [
      { user: 'Patricia A.', rating: 5, text: 'A mi hijo le encanta. Pasa horas explorando todo lo que encuentra.' },
      { user: 'Luis Enrique', rating: 4, text: 'Buena calidad para ser infantil. Se ve muy nítido.' },
      { user: 'Martha D.', rating: 4, text: 'Excelente regalo. Viene con todo lo necesario para empezar.' },
    ],
    stock: true, sku: 'KRD-KID-007', shipping_days: '3-7'
  },
  'wrist-rest': {
    id: 'wrist-rest', name: 'Reposamuñecas Ergonómico', price: 249, original_price: 349, rating: 4.2, reviews: 112,
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
      'https://images.unsplash.com/photo-1611532735949-6448e94b74d9?w=600&q=80',
      'https://images.unsplash.com/photo-1611532736040-5ee5d44b3c50?w=600&q=80',
    ],
    category: 'Oficina', badge: 'Oferta',
    description: 'Reposamuñecas ergonómico de gel con memoria. Diseñado para prevenir lesiones por esfuerzo repetitivo (RSI). Base antideslizante, superficie suave y fresca. Compatible con teclados mecánicos y de membrana. Ideal para largas jornadas de trabajo.',
    features: ['Gel con Memoria', 'Base Antideslizante', 'Superficie Fresca', 'Ergonómico', 'Previene RSI', 'Universal'],
    reviews_list: [
      { user: 'Diego H.', rating: 5, text: 'Mis muñecas dejaron de doler después de usarlo una semana.' },
      { user: 'Sara V.', rating: 4, text: 'Muy cómodo. La textura del gel es agradable al tacto.' },
      { user: 'Oscar T.', rating: 4, text: 'Buena calidad. Se mantiene en su lugar y ayuda a aligerar la presion.' },
    ],
    stock: true, sku: 'KRD-OFI-008', shipping_days: '2-5'
  },
}

// Format MXN price
const formatMXN = (price) => {
  return `$${price.toLocaleString('es-MX')}`
}

// Savings percentage
const calcSavings = (price, original) => {
  if (!original) return null
  const pct = Math.round((1 - price / original) * 100)
  return pct
}

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const p = productData[id]

  if (!p) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ marginBottom: 16 }}>Producto no encontrado</h2>
        <p style={{ marginBottom: 24, color: 'var(--gray-500)' }}>
          El producto que buscas no está disponible o la URL es incorrecta.
        </p>
        <Link to="/products" className="btn btn-primary">Ver Todos los Productos</Link>
      </div>
    )
  }

  const prevImage = () => setSelectedImage(prev => (prev === 0 ? p.images.length - 1 : prev - 1))
  const nextImage = () => setSelectedImage(prev => (prev === p.images.length - 1 ? 0 : prev + 1))

  // Track product view
  useEffect(() => {
    trackViewItem(p)
  }, [p.id])

  const handleAdd = () => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.images[0], quantity })
    trackAddToCart(p, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const savings = calcSavings(p.price, p.original_price)

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/products">Productos</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{p.category}</span>
        </div>

        <Link to="/products" className="back-link">
          <ChevronLeft size={16} /> Volver a Productos
        </Link>

        <div className="product-detail-grid">
          {/* ─── Gallery ─── */}
          <div className="detail-gallery-col">
            <div className="gallery-overlay-wrap">
              <img src={p.images[selectedImage]} alt={p.name} className="gallery-main-img" />
              {p.badge && <span className="product-badge gallery-badge">{p.badge}</span>}

              <button className="gallery-arrow gallery-arrow-left" onClick={prevImage} aria-label="Anterior">
                <ChevronLeft size={22} />
              </button>
              <button className="gallery-arrow gallery-arrow-right" onClick={nextImage} aria-label="Siguiente">
                <ChevronRight size={22} />
              </button>

              <div className="gallery-dots-bar">
                {p.images.map((_, i) => (
                  <span
                    key={i}
                    className={`g-dot ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="gallery-thumbnails">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${p.name} vista ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* ─── Product Info ─── */}
          <div className="product-detail-info">
            {/* Meta top */}
            <div className="detail-meta-top">
              {p.badge && <span className={`badge ${p.badge === 'Más Vendido' ? 'badge-rose' : p.badge === 'Oferta' ? 'badge-gold' : p.badge === 'Nuevo' ? 'badge-sage' : p.badge === 'Popular' ? 'badge-rose' : p.badge === 'Educativo' ? 'badge-sage' : 'badge-rose'}`}>{p.badge}</span>}
              <span className="detail-category">{p.category}</span>
              <span className="detail-sku">SKU: {p.sku}</span>
            </div>

            <h1 className="detail-product-name">{p.name}</h1>

            {/* Rating */}
            <div className="rating-row">
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill={i < Math.floor(p.rating) ? '#F59E0B' : 'none'} color="#F59E0B" strokeWidth={1.5} />
                ))}
              </div>
              <span className="rating-value">{p.rating}</span>
              <span className="rating-count">({p.reviews} reseñas)</span>
            </div>

            {/* Price */}
            <div className="detail-price-row">
              <span className="detail-price">{formatMXN(p.price)}</span>
              {p.original_price && (
                <>
                  <span className="price-original">{formatMXN(p.original_price)}</span>
                  {savings && <span className="detail-savings">Ahorras {savings}%</span>}
                </>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="detail-actions">
              <div className="qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <button className={`btn btn-primary btn-lg detail-add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
                <ShoppingCart size={18} /> {added ? '✓ Agregado' : 'Agregar al Carrito'}
              </button>
            </div>

            {/* Shipping & Guarantee */}
            <div className="detail-meta">
              <div className="detail-meta-item">
                <Truck size={16} className="meta-icon-rose" />
                Envío a todo México — De 3 a 7 días hábiles
              </div>
              <div className="detail-meta-item">
                <Shield size={16} className="meta-icon-rose" />
                Garantía de satisfacción de 30 días
              </div>
              <div className="detail-meta-item">
                <Clock size={16} className="meta-icon-rose" />
                Envío en {p.shipping_days} días hábiles
              </div>
            </div>

            {/* Stock */}
            <div className="stock-row">
              <span className="stock-dot" />
              <span className="stock-text">En existencia</span>
              <span className="stock-shipping">— Envío rápido desde CDMX</span>
            </div>

            {/* Description */}
            <p className="detail-desc">{p.description}</p>

            {/* Features */}
            <div className="detail-features">
              <h3 className="detail-section-title">
                <Sparkles size={16} /> Características
              </h3>
              <div className="features-grid">
                {p.features.map((f, i) => (
                  <div key={i} className="feature-item">
                    <Check size={14} className="check-berry" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="detail-reviews-horizontal">
              <h3 className="detail-section-title">
                <Star size={16} fill="var(--gold)" color="var(--gold)" /> Reseñas de Clientes
              </h3>
              <div className="reviews-horizontal-list">
                {p.reviews_list.map((r, i) => (
                  <div key={i} className="review-horizontal-item">
                    <div className="review-horiz-header">
                      <div className="review-horiz-avatar">{r.user[0]}</div>
                      <div>
                        <span className="review-horiz-name">{r.user}</span>
                        <div className="stars" style={{ marginTop: 2 }}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={9} fill={j < r.rating ? '#F59E0B' : 'none'} color="#F59E0B" strokeWidth={1.5} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="review-horiz-text">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Inline styles for ProductDetail page 💄 ─── */}
        <style>{`
          .product-detail-page {
            padding: 32px 0 64px;
            min-height: 100vh;
          }

          /* Breadcrumb */
          .detail-breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            color: var(--gray-400);
            margin-bottom: 8px;
          }
          .detail-breadcrumb a {
            color: var(--rose);
          }
          .detail-breadcrumb a:hover {
            text-decoration: underline;
          }
          .breadcrumb-sep {
            color: var(--gray-300);
          }
          .breadcrumb-current {
            color: var(--gray-500);
          }

          /* Back link */
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.85rem;
            color: var(--rose);
            margin-bottom: 20px;
            transition: var(--transition);
          }
          .back-link:hover {
            color: var(--rose-dark);
            gap: 8px;
          }

          /* Grid layout */
          .product-detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
            align-items: start;
          }

          /* ── Gallery Column ── */
          .detail-gallery-col {
            position: sticky;
            top: 24px;
          }

          .gallery-overlay-wrap {
            position: relative;
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--gray-100);
            aspect-ratio: 1 / 1;
          }

          .gallery-main-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.3s ease;
          }

          .gallery-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 2;
          }

          .gallery-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(4px);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--dark);
            cursor: pointer;
            transition: var(--transition);
            z-index: 2;
            box-shadow: var(--shadow-sm);
          }
          .gallery-arrow:hover {
            background: var(--white);
            box-shadow: var(--shadow-md);
          }
          .gallery-arrow-left { left: 12px; }
          .gallery-arrow-right { right: 12px; }

          .gallery-dots-bar {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 2;
          }
          .g-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.45);
            cursor: pointer;
            transition: var(--transition);
            border: 2px solid rgba(255,255,255,0.6);
          }
          .g-dot.active {
            background: var(--rose);
            border-color: var(--rose);
            transform: scale(1.2);
          }

          /* Thumbnails */
          .gallery-thumbnails {
            display: flex;
            gap: 10px;
            margin-top: 12px;
          }
          .gallery-thumb {
            width: 72px;
            height: 72px;
            border-radius: var(--radius-sm);
            overflow: hidden;
            border: 2px solid var(--gray-200);
            cursor: pointer;
            padding: 0;
            background: var(--gray-100);
            transition: var(--transition);
            flex-shrink: 0;
          }
          .gallery-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .gallery-thumb.active {
            border-color: var(--rose);
            box-shadow: 0 0 0 2px var(--rose-glow);
          }
          .gallery-thumb:hover {
            border-color: var(--rose);
          }

          /* ── Info Column ── */
          .detail-meta-top {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 12px;
          }
          .detail-category {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--gray-400);
          }
          .detail-sku {
            font-size: 0.72rem;
            color: var(--gray-400);
            font-family: monospace;
          }

          .detail-product-name {
            font-size: 1.8rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 12px;
            color: var(--dark);
          }

          .detail-price-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          .detail-price {
            font-size: 2rem;
            font-weight: 800;
            color: var(--berry);
          }
          .detail-savings {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--success);
            background: #DCFCE7;
            padding: 2px 10px;
            border-radius: 100px;
          }

          /* Actions */
          .detail-actions {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }

          .qty-selector {
            display: flex;
            align-items: center;
            gap: 0;
            border: 1.5px solid var(--gray-200);
            border-radius: var(--radius-md);
            overflow: hidden;
            background: var(--white);
          }
          .qty-selector button {
            width: 44px;
            height: 44px;
            border: none;
            background: var(--cream);
            color: var(--dark);
            font-size: 1rem;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .qty-selector button:hover:not(:disabled) {
            background: var(--rose-light);
            color: var(--rose-dark);
          }
          .qty-selector button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          .qty-selector span {
            min-width: 48px;
            text-align: center;
            font-weight: 600;
            font-size: 1.05rem;
            color: var(--dark);
          }

          .detail-add-btn {
            flex: 1;
            min-width: 200px;
          }
          .detail-add-btn.added {
            background: var(--success) !important;
            box-shadow: none !important;
          }

          /* Meta info */
          .detail-meta {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
            padding: 16px 20px;
            background: var(--cream);
            border-radius: var(--radius-md);
            border: 1px solid var(--gray-200);
          }
          .detail-meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85rem;
            color: var(--gray-600);
          }
          .meta-icon-rose {
            color: var(--rose);
            flex-shrink: 0;
          }

          /* Stock */
          .stock-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
          }
          .stock-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--success);
            display: inline-block;
            flex-shrink: 0;
          }
          .stock-text {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--success);
          }
          .stock-shipping {
            font-size: 0.8rem;
            color: var(--gray-400);
          }

          /* Description */
          .detail-desc {
            font-size: 0.95rem;
            line-height: 1.7;
            color: var(--gray-600);
            margin-bottom: 24px;
          }

          /* Features */
          .detail-features {
            margin-bottom: 28px;
          }
          .detail-section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--dark);
          }
          .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .feature-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: var(--gray-700);
            padding: 8px 12px;
            background: var(--gray-50);
            border-radius: var(--radius-sm);
          }
          .check-berry {
            color: var(--berry);
            flex-shrink: 0;
          }

          /* ── Reviews ── */
          .detail-reviews-horizontal {
            margin-top: 12px;
          }
          .reviews-horizontal-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .review-horizontal-item {
            background: var(--white);
            border: 1px solid var(--gray-100);
            border-radius: var(--radius-md);
            padding: 16px 18px;
            transition: var(--transition);
          }
          .review-horizontal-item:hover {
            border-color: var(--rose-light);
            box-shadow: var(--shadow-sm);
          }
          .review-horiz-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
          }
          .review-horiz-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--rose-light), var(--rose));
            color: var(--white);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
            flex-shrink: 0;
          }
          .review-horiz-name {
            font-weight: 600;
            font-size: 0.85rem;
            color: var(--dark);
          }
          .review-horiz-text {
            font-size: 0.88rem;
            color: var(--gray-600);
            line-height: 1.5;
            font-style: italic;
          }

          /* ── Responsive ── */
          @media (max-width: 900px) {
            .product-detail-grid {
              grid-template-columns: 1fr;
              gap: 32px;
            }
            .detail-gallery-col {
              position: static;
            }
            .detail-product-name {
              font-size: 1.4rem;
            }
            .detail-price {
              font-size: 1.6rem;
            }
            .features-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .product-detail-page {
              padding: 16px 0 48px;
            }
            .gallery-thumbnails {
              gap: 6px;
            }
            .gallery-thumb {
              width: 56px;
              height: 56px;
            }
            .detail-actions {
              flex-direction: column;
            }
            .detail-add-btn {
              width: 100%;
              min-width: 0;
            }
            .detail-meta {
              padding: 12px 16px;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
