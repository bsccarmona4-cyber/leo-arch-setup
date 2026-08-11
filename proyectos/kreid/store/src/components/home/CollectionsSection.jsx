import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import './CollectionsSection.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const collections = [
  {
    id: 'rostro-radiante',
    name: 'Rostro Radiante',
    description: 'Tecnologia y rituales para una piel luminosa',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    products: [
      { name: 'LED Light Therapy Mask', price: '$1,999', link: '/products/led-mask' },
      { name: 'Rodillo Facial de Jade', price: '$349', link: '/products/roller-jade' },
    ],
  },
  {
    id: 'cuerpo-movimiento',
    name: 'Cuerpo en Movimiento',
    description: 'Recuperacion y cuidado para tu cuerpo activo',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    products: [
      { name: 'Botas de Compresion Recovery', price: '$2,499', link: '/products/boots-compression' },
      { name: 'Pistola de Masaje', price: '$899', link: '/products/massage-gun' },
    ],
  },
  {
    id: 'bienestar-diario',
    name: 'Bienestar Diario',
    description: 'Herramientas que cuidan de ti cada dia',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80',
    products: [
      { name: 'Termometro Infrarrojo', price: '$459', link: '/products/thermometer-ir' },
      { name: 'Reposamunecas Ergonomicos', price: '$249', link: '/products/wrist-rest' },
    ],
  },
]

export default function CollectionsSection() {
  return (
    <section className="collections-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.h2 variants={fadeInUp} custom={0}>Colecciones Pensadas Para Ti</motion.h2>
          <motion.p variants={fadeInUp} custom={1}>Encuentra lo que necesitas, desde el rostro hasta el bienestar</motion.p>
        </motion.div>

        <div className="collections-grid">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              className="collection-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={i}
            >
              <div className="collection-image-wrap">
                <img
                  src={col.image}
                  alt={col.name}
                  className="collection-image"
                  loading="lazy"
                />
                <div className="collection-image-overlay" />
                <div className="collection-image-content">
                  <h3 className="collection-name">{col.name}</h3>
                  <p className="collection-desc">{col.description}</p>
                </div>
              </div>

              <div className="collection-products">
                {col.products.map((prod, j) => (
                  <Link key={j} to={prod.link} className="collection-product-link">
                    <span className="collection-product-name">{prod.name}</span>
                    <span className="collection-product-price">{prod.price}</span>
                  </Link>
                ))}
              </div>

              <Link to="/products" className="collection-cta">
                Ver coleccion
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
