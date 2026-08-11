import { motion } from 'framer-motion'
import { AnimatedCounter } from '../DopamineEffects'
import './SocialProof.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const stats = [
  { value: 500, label: 'Clientes felices', prefix: '+', suffix: '' },
  { value: 4.8, label: 'Estrellas promedio', prefix: '', suffix: ' ★' },
  { value: 32, label: 'Estados de Mexico', prefix: '', suffix: '' },
  { value: 30, label: 'Dias de garantia', prefix: '', suffix: '' },
]

export default function SocialProof() {
  return (
    <section className="social-proof-section">
      <div className="container">
        <motion.div
          className="social-proof-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="social-proof-item"
              variants={fadeInUp}
              custom={i}
            >
              <span className="social-proof-value">
                {stat.prefix}
                <AnimatedCounter target={stat.value} prefix="" suffix="" duration={2000} />
                {stat.suffix}
              </span>
              <span className="social-proof-label">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
