import { Link } from 'react-router-dom'
import { Sparkles, Heart, Shield, Compass, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Magnetic from '../effects/MagneticCursor'
import ScrambleText from '../effects/ScrambleText'
import './HeroSection.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const categories = [
  { id: 'rostro', label: 'Rostro', icon: Sparkles, color: 'var(--rose)', bg: 'rgba(196, 139, 168, 0.12)' },
  { id: 'cuerpo', label: 'Cuerpo', icon: Heart, color: 'var(--berry)', bg: 'rgba(139, 34, 82, 0.1)' },
  { id: 'bienestar', label: 'Bienestar', icon: Shield, color: '#6B8F6E', bg: 'rgba(107, 143, 110, 0.1)' },
  { id: 'descubrir', label: 'Descubrir', icon: Compass, color: 'var(--gold-dark)', bg: 'rgba(212, 175, 55, 0.1)' },
]

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-bg-image" />
      <div className="hero-overlay" />

      <div className="hero-container container">
        <motion.div
          className="hero-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.p className="hero-welcome" variants={fadeInUp} custom={0}>
            Bienvenida a tu espacio de belleza
          </motion.p>

          <motion.h1 className="hero-headline" variants={fadeInUp} custom={1}>
            <ScrambleText as="span" text="Belleza sin" />
            <br />
            <span className="hero-headline-accent">
              <ScrambleText as="span" text="complicaciones" />
            </span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={fadeInUp} custom={2}>
            Herramientas de belleza para cada edad, cada tipo de piel, cada presupuesto.
          </motion.p>

          {/* Category grid */}
          <motion.div className="hero-categories" variants={fadeInUp} custom={3}>
            {categories.map((cat) => (
              <Link key={cat.id} to="/products" className="hero-cat-card">
                <div className="hero-cat-icon" style={{ background: cat.bg }}>
                  <cat.icon size={22} style={{ color: cat.color }} />
                </div>
                <div className="hero-cat-text">
                  <span className="hero-cat-label">{cat.label}</span>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.div className="hero-actions" variants={fadeInUp} custom={4}>
            <Magnetic>
              <Link to="/products" className="btn btn-primary btn-lg">
                Explorar tienda
                <ChevronRight size={18} />
              </Link>
            </Magnetic>
            <Magnetic>
              <a href="#quiz-section" className="btn btn-outline-light btn-lg">
                Descubre tu dispositivo ideal
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
