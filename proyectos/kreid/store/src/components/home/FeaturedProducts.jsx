import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { MouseSpotlight } from '../DopamineEffects'
import './FeaturedProducts.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.075, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

function StarRating({ rating }) {
  return (
    <div className="fp-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < Math.floor(rating) ? 'var(--rose)' : 'none'}
          color="var(--rose)"
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

const formatMXN = (price) => `$${price.toLocaleString('es-MX')}`

export default function FeaturedProducts({ products, onQuickAdd }) {
  return (
    <section className="featured-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.h2 variants={fadeInUp} custom={0}>Productos Destacados</motion.h2>
          <motion.p variants={fadeInUp} custom={1}>Lo mas vendido en KREID Beauty and Health</motion.p>
        </motion.div>

        <div className="fp-grid">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={i}
            >
              <MouseSpotlight strength={12}>
              <Link to={`/products/${p.id}`} className="fp-card">
                <div className="fp-image-wrap">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <button
                    className="fp-quick-add"
                    onClick={(e) => onQuickAdd && onQuickAdd(p, e)}
                    aria-label="Agregar al carrito"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
                <div className="fp-info">
                  <span className="fp-category">{p.category}</span>
                  <h3 className="fp-name">{p.name}</h3>
                  <div className="fp-rating">
                    <StarRating rating={p.rating} />
                    <span className="fp-rating-val">{p.rating}</span>
                    <span className="fp-rating-count">({p.reviews})</span>
                  </div>
                  <div className="fp-price-row">
                    <span className="fp-price">{formatMXN(p.price)}</span>
                    {p.original_price && (
                      <span className="fp-original">{formatMXN(p.original_price)}</span>
                    )}
                  </div>
                </div>
              </Link>
              </MouseSpotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
