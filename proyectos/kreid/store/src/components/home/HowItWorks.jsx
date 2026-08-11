import { Heart, Clock, Flower2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './HowItWorks.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.075, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const steps = [
  {
    num: 1,
    icon: Heart,
    iconColor: 'var(--rose)',
    gradient: 'linear-gradient(135deg, var(--rose-light), var(--rose))',
    title: 'Limpia tu rostro',
    text: 'Comienza con tu rutina de limpieza habitual. Tu piel debe estar libre de maquillaje, cremas o impurezas para una mejor absorcion de la luz LED.',
  },
  {
    num: 2,
    icon: Clock,
    iconColor: 'var(--gold-dark)',
    gradient: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
    title: 'Usa la mascarilla 15 min',
    text: 'Coloca la mascarilla LED y selecciona el color segun tu necesidad. Relajate mientras la terapia actua. Solo 15 minutos al dia son suficientes.',
  },
  {
    num: 3,
    icon: Flower2,
    iconColor: '#6B8F6E',
    gradient: 'linear-gradient(135deg, var(--sage-light), var(--sage))',
    title: 'Resultados visibles',
    text: 'Despues de 4-6 semanas de uso constante notaras tu piel mas firme, luminosa y uniforme. Menos lineas de expresion y un glow natural.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.h2 variants={fadeInUp} custom={0}>Como Funciona</motion.h2>
          <motion.p variants={fadeInUp} custom={1}>Tres pasos simples para transformar tu rutina de skincare</motion.p>
        </motion.div>

        <div className="how-grid">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              className="how-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={i}
            >
              <div className="how-number" style={{ background: s.gradient }}>
                {s.num}
              </div>
              <div className="how-icon-badge">
                <s.icon size={22} style={{ color: s.iconColor }} />
              </div>
              <h4 className="how-title">{s.title}</h4>
              <p className="how-text">{s.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="how-cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          custom={3}
        >
          <Link to="/products/led-mask" className="btn btn-primary btn-lg">
            Comienza tu Transformacion
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
