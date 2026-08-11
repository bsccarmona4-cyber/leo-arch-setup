import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import './Testimonials.css'

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
    <div className="t-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? 'var(--gold)' : 'none'}
          color="var(--gold)"
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function Testimonials({ testimonials }) {
  return (
    <section className="testimonials-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.h2 variants={fadeInUp} custom={0}>Lo Que Dicen Nuestras Clientes</motion.h2>
          <motion.p variants={fadeInUp} custom={1}>Mujeres de todas las edades confian en KREID para su belleza y bienestar</motion.p>
        </motion.div>

        <div className="t-grid">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="t-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={i}
            >
              <div className="t-author">
                <div className="t-avatar">{t.avatar}</div>
                <div>
                  <h4 className="t-name">{t.name}</h4>
                  <span className="t-location">{t.location}</span>
                </div>
              </div>
              <StarRating rating={t.rating} />
              <p className="t-quote">&ldquo;{t.text}&rdquo;</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
