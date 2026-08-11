import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './FAQSection.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.075, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const faqs = [
  {
    q: 'Como funciona la experiencia de luz LED?',
    a: 'La luz LED emite longitudes de onda visibles que interactuan con la superficie de la piel. Es una experiencia de cuidado facial no invasiva. Muchas personas notan una mejora en la luminosidad y textura general de su piel con el uso constante. Cada color ofrece una experiencia sensorial y estetica diferente.',
  },
  {
    q: 'Cada cuanto debo usar la mascarilla LED?',
    a: 'Recomendamos usarla de 10 a 20 minutos al dia, de 3 a 5 veces por semana. La constancia es clave: los resultados visibles comienzan a notarse entre las 4 y 6 semanas de uso regular.',
  },
  {
    q: 'Es segura para todo tipo de piel?',
    a: 'Si, la experiencia de luz LED es no invasiva y segura para todo tipo de piel. No utiliza calor ni radiacion UV. Si tienes una condicion especifica de la piel, te recomendamos consultar con tu dermatologo antes de comenzar.',
  },
  {
    q: 'Cuanto tiempo tardan los envios?',
    a: 'Los envios dentro de Mexico toman de 5 a 10 dias habiles. Procesamos tu pedido en 24-48 horas y recibiras un numero de seguimiento por correo electronico.',
  },
  {
    q: 'Tienen garantia?',
    a: 'Todos nuestros dispositivos cuentan con 30 dias de garantia. Si no estas satisfecha con los resultados, te devolvemos tu dinero. Solo necesitas contactarnos y te guiamos en el proceso.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section className="faq-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <motion.h2 variants={fadeInUp} custom={0}>Preguntas Frecuentes</motion.h2>
          <motion.p variants={fadeInUp} custom={1}>Todo lo que necesitas saber sobre nuestra experiencia de luz LED</motion.p>
        </motion.div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className={`faq-item ${openIndex === i ? 'faq-open' : ''}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={i}
            >
              <button
                className="faq-trigger"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <span className="faq-question">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`faq-chevron ${openIndex === i ? 'faq-chevron-open' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    className="faq-answer-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <p className="faq-answer">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
