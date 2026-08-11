import { Sparkles, Truck, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import './BenefitsSection.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.075, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const benefits = [
  {
    icon: Sparkles,
    iconColor: 'var(--rose)',
    bg: 'var(--rose-light)',
    title: 'Para todas',
    text: 'Productos desde $249 hasta $2,499. Hay algo para cada presupuesto, tipo de piel y edad. Porque la belleza no tiene un solo precio.',
  },
  {
    icon: Truck,
    iconColor: 'var(--gold-dark)',
    bg: 'var(--gold-light)',
    title: 'Envio a todo Mexico',
    text: 'Entregas en 5 a 10 dias habiles a cualquier rincon del pais. Logistica clara, seguimiento en tiempo real y empaque discreto.',
  },
  {
    icon: ShieldCheck,
    iconColor: '#6B8F6E',
    bg: 'var(--sage-light)',
    title: 'Elige con confianza',
    text: 'Nuestro quiz personalizado te ayuda a encontrar tu dispositivo ideal en segundos. Ademas, todos nuestros productos tienen garantia de 30 dias.',
  },
]

export default function BenefitsSection() {
  return (
    <section className="benefits-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.h2 variants={fadeInUp} custom={0}>Por que comprar en KREID</motion.h2>
          <motion.p variants={fadeInUp} custom={1}>Hacemos que encontrar y comprar tus herramientas de belleza sea simple, seguro y accesible</motion.p>
        </motion.div>

        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="benefit-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={i}
            >
              <div className="benefit-icon-circle" style={{ background: b.bg }}>
                <b.icon size={28} style={{ color: b.iconColor }} />
              </div>
              <h4 className="benefit-title">{b.title}</h4>
              <p className="benefit-text">{b.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
