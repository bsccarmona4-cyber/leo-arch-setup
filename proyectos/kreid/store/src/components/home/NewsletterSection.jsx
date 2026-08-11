import { useState } from 'react'
import { Mail, ArrowRight, Check, Flower2 } from 'lucide-react'
import { motion } from 'framer-motion'
import './NewsletterSection.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.075, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-glow" />

      <div className="container newsletter-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <Flower2 size={48} className="newsletter-icon" />

          <motion.h2 className="newsletter-headline" variants={fadeInUp} custom={0}>
            Lista para transformar tu piel
          </motion.h2>

          <motion.p className="newsletter-subtitle" variants={fadeInUp} custom={1}>
            Suscribete y recibe 10% OFF en tu primera compra. Ademas, tips de
            skincare y promociones exclusivas directamente en tu correo.
          </motion.p>

          {subscribed ? (
            <motion.div
              className="newsletter-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check size={20} />
              Gracias por suscribirte. Revisa tu correo.
            </motion.div>
          ) : (
            <motion.form
              className="newsletter-form"
              onSubmit={handleSubmit}
              variants={fadeInUp}
              custom={2}
            >
              <div className="newsletter-input-wrap">
                <Mail size={18} className="newsletter-mail-icon" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
              </div>
              <button type="submit" className="btn btn-primary newsletter-btn">
                Suscribirme
                <ArrowRight size={18} />
              </button>
            </motion.form>
          )}

          <p className="newsletter-disclaimer">
            Sin spam. Solo contenido valioso para tu skincare. Puedes darte de
            baja en cualquier momento.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
