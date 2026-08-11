import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Mail, Loader2 } from 'lucide-react'
import Magnetic from '../effects/MagneticCursor'
import { ConfettiBurst } from '../DopamineEffects'
import { supabase } from '../../lib/supabase'
import './QuizSection.css'

/* ─── Product catalogue (mirrors Products.jsx) ─── */
const PRODUCTS = {
  'led-mask': {
    id: 'led-mask',
    name: 'Mascarilla LED 7 Colores',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=85',
    description: 'Experiencia LED profesional con 7 colores para mejorar la apariencia de lineas finas, imperfecciones y tono desigual desde casa.',
  },
  'roller-jade': {
    id: 'roller-jade',
    name: 'Rodillo Facial de Jade',
    price: 349,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=85',
    description: 'Rodillo de jade genuino para una apariencia menos hinchada. Brinda sensacion de frescura y mejora la absorcion de serum.',
  },
  'boots-compression': {
    id: 'boots-compression',
    name: 'Botas de Compresion Recovery',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=85',
    description: 'Compresion neumatica profesional para recuperacion muscular post-ejercicio y bienestar diario.',
  },
  'fascia-gun': {
    id: 'fascia-gun',
    name: 'Pistola de Masaje Fascia',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=85',
    description: 'Pensado para un momento de relajacion. Percusion suave que brinda una sensacion relajante y bienestar general.',
  },
  'thermometer-ir': {
    id: 'thermometer-ir',
    name: 'Termometro Infrarrojo Digital',
    price: 459,
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=500&q=85',
    description: 'Lectura instantanea sin contacto. Ideal para monitoreo de salud y bienestar diario.',
  },
}

/* ─── Recommendation bundles ─── */
const BUNDLES = {
  'bundle-led-roller': {
    id: 'bundle-led-roller',
    name: 'Bundle: Mascarilla LED + Rodillo Jade',
    price: 2348,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=85',
    description: 'El combo definitivo para tu rutina facial: experiencia LED avanzada mas el poder suavizante del jade.',
    crossSellId: 'thermometer-ir',
    linkIds: ['led-mask'],
  },
  'kit-bienestar': {
    id: 'kit-bienestar',
    name: 'Kit de Bienestar',
    price: 808,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=85',
    description: 'Rodillo Facial de Jade + Termometro Infrarrojo. Tu primer paso hacia el bienestar diario.',
    crossSellId: 'led-mask',
    linkIds: ['roller-jade'],
  },
}

/* ─── Cross-sell mapping ─── */
const CROSS_SELL_MAP = {
  'led-mask': 'roller-jade',
  'roller-jade': 'led-mask',
  'boots-compression': 'fascia-gun',
  'fascia-gun': 'boots-compression',
  'bundle-led-roller': 'thermometer-ir',
  'kit-bienestar': 'led-mask',
}

/* ─── Questions ─── */
const QUESTIONS = [
  {
    id: 'concern',
    label: 'Cuentame, que es lo que mas te gustaria mejorar?',
    options: [
      { value: 'lineas-finas', label: 'Lineas finas y signos de la edad' },
      { value: 'imperfecciones', label: 'Textura irregular e imperfecciones' },
      { value: 'firmeza', label: 'Firmeza y luminosidad' },
      { value: 'todo', label: 'Un poquito de todo' },
    ],
  },
  {
    id: 'budget',
    label: 'Que tanto quieres consentirte hoy?',
    options: [
      { value: 'economico', label: 'Algo ligero para empezar' },
      { value: 'medio', label: 'Un buen regalo para mi' },
      { value: 'premium', label: 'Lo mejor de lo mejor' },
    ],
  },
  {
    id: 'zone',
    label: 'En que parte de tu cuerpo te gustaria enfocarte?',
    options: [
      { value: 'rostro', label: 'En mi rostro' },
      { value: 'cuerpo', label: 'En mi cuerpo' },
      { value: 'ambos', label: 'En ambos' },
    ],
  },
  {
    id: 'age',
    label: 'En que momento de tu vida estas?',
    options: [
      { value: '20-30', label: 'Descubriendo mi estilo' },
      { value: '31-40', label: 'Consintiendo mi piel' },
      { value: '41+', label: 'Luciendo mi mejor version' },
    ],
  },
]

/* ─── Recommendation engine ─── */
function recommend(answers) {
  const { concern, budget, zone } = answers

  // R1: Lineas finas / Todo / Firmeza + Rostro/Ambos + Medio/Premium → LED Mask
  if (
    ['lineas-finas', 'todo', 'firmeza'].includes(concern) &&
    ['rostro', 'ambos'].includes(zone) &&
    ['medio', 'premium'].includes(budget)
  ) {
    return { productKey: 'led-mask', reason: 'La experiencia LED de 7 colores mejora visiblemente la apariencia de lineas finas y aporta una sensacion de firmeza. Con tu presupuesto, es la opcion con mejor relacion costo-beneficio a largo plazo.' }
  }

  // R2: Lineas finas / Todo + Rostro + Economico → Rodillo Jade
  if (
    ['lineas-finas', 'todo'].includes(concern) &&
    zone === 'rostro' &&
    budget === 'economico'
  ) {
    return { productKey: 'roller-jade', reason: 'El rodillo de jade es la entrada perfecta al cuidado facial. Minimiza la apariencia de lineas finas, ayuda a lograr un aspecto mas descansado y prepara tu piel para absorber mejor tus productos.' }
  }

  // R3: Imperfecciones + Rostro + Cualquiera → LED Mask
  if (concern === 'imperfecciones' && zone === 'rostro') {
    return { productKey: 'led-mask', reason: 'La luz azul de la mascarilla LED es conocida por ayudar a reducir las imperfecciones y lucir una piel mas uniforme. En pocas semanas veras tu piel con un aspecto mas limpio.' }
  }

  // R4: Firmeza / Todo + Cuerpo/Ambos + Cualquiera → Botas Compresion
  if (
    ['firmeza', 'todo'].includes(concern) &&
    ['cuerpo', 'ambos'].includes(zone)
  ) {
    return { productKey: 'boots-compression', reason: 'Las botas de compresion brindan bienestar y firmeza a tus piernas. Ideales para recuperacion post-ejercicio y reducir la retencion de liquidos.' }
  }

  // R5: Cualquiera + Cuerpo + Economico → Pistola Fascia
  if (zone === 'cuerpo' && budget === 'economico') {
    return { productKey: 'fascia-gun', reason: 'La pistola de masaje es la herramienta mas versatil para un momento de autocuidado. Disenada para brindar una sensacion relajante y lucir una piel mas tersa.' }
  }

  // R6: Cualquiera + Rostro/Ambos + Medio/Premium → Bundle LED + Rodillo
  if (
    ['rostro', 'ambos'].includes(zone) &&
    ['medio', 'premium'].includes(budget)
  ) {
    return { productKey: 'bundle-led-roller', reason: 'El bundle combina lo mejor de dos mundos: la potencia de la experiencia LED con la suavidad diaria del rodillo de jade. Tu rutina facial completa.' }
  }

  // Fallback
  return { productKey: 'kit-bienestar', reason: 'Creamos este kit especialmente para ti: rodillo de jade para cuidado facial diario y termometro infrarrojo para monitorear tu bienestar desde casa.' }
}

/* ─── Variants ─── */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

/* ─── Helpers ─── */
function formatMXN(price) {
  return `$${price.toLocaleString('es-MX')}`
}

/* ══════════════════════════════════════════════════
   QuizSection
   ══════════════════════════════════════════════════ */
export default function QuizSection() {
  const [step, setStep] = useState(0) // 0-3: questions, 4: capture, 5: result
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState({})
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null) // { productKey, reason, product, crossSellProduct }
  const [confettiActive, setConfettiActive] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)

  useEffect(() => { if (step === 5) setConfettiActive(true) }, [step])

  const totalSteps = 5 // 4 questions + 1 capture

  const product = useMemo(() => {
    if (!result) return null
    const p = PRODUCTS[result.productKey] || BUNDLES[result.productKey]
    if (!p) return null
    const crossSellKey = CROSS_SELL_MAP[result.productKey]
    const crossSell = PRODUCTS[crossSellKey] || null
    return { ...p, crossSell, reason: result.reason }
  }, [result])

  const progressPct = useMemo(() => {
    if (step >= totalSteps) return 100
    return Math.round((step / totalSteps) * 100)
  }, [step])

  const goNext = useCallback(() => {
    setDirection(1)
    if (step < totalSteps) {
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  const handleSelect = useCallback(
    (questionId, value) => {
      const next = { ...answers, [questionId]: value }
      setAnswers(next)
      // If last question answered, move to capture
      if (step === QUESTIONS.length - 1) {
        setDirection(1)
        setStep(QUESTIONS.length) // capture step
      } else {
        goNext()
      }
    },
    [answers, step, goNext]
  )

  const handleCaptureSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const trimmedEmail = email.trim()
      if (!trimmedEmail) return

      setMagicLinkLoading(true)

      // Enviar link mágico por correo (Supabase)
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
          },
        })
        if (error) throw error
      } catch {
        // Si falla Supabase, igual mostramos resultado (el link es asíncrono)
      }

      setMagicLinkSent(true)
      setMagicLinkLoading(false)

      const rec = recommend(answers)
      setResult(rec)

      // Persist to localStorage (sin WhatsApp)
      const entry = {
        answers,
        email: trimmedEmail,
        productKey: rec.productKey,
        reason: rec.reason,
        timestamp: new Date().toISOString(),
      }
      try {
        const stored = JSON.parse(localStorage.getItem('kreid_quiz_leads') || '[]')
        stored.push(entry)
        localStorage.setItem('kreid_quiz_leads', JSON.stringify(stored))
      } catch {
        // silently ignore storage errors
      }

      // Placeholder for future Shopify/Klaviyo integration
      if (typeof window !== 'undefined' && window.__kreidQuizLead) {
        window.__kreidQuizLead(entry)
      }

      goNext() // show result
    },
    [email, answers, goNext]
  )

  const currentQuestion = QUESTIONS[step] || null
  const isCaptureStep = step === QUESTIONS.length
  const isResultStep = step > QUESTIONS.length

  const handleReset = useCallback(() => {
    setStep(0)
    setDirection(1)
    setAnswers({})
    setEmail('')
    setMagicLinkSent(false)
    setMagicLinkLoading(false)
    setResult(null)
  }, [])

  return (
    <section className="quiz-section" id="quiz-section">
      <ConfettiBurst active={confettiActive} onFinish={() => setConfettiActive(false)} />
      <div className="quiz-container">
        {/* ─── Progress bar ─── */}
        <div className="quiz-progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="quiz-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <div className="quiz-progress-label">
          {!isResultStep && (
            <span className="quiz-progress-pct">{progressPct}%</span>
          )}
        </div>

        {/* ─── Steps ─── */}
        <AnimatePresence mode="wait" custom={direction}>
          {!isResultStep && (
            <motion.div
              key={isCaptureStep ? 'capture' : `q-${step}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="quiz-step"
            >
              {isCaptureStep ? (
                /* ─── Capture step ─── */
                <div className="quiz-capture">
                  <h2 className="quiz-question-label">Casi listo</h2>
                  <p className="quiz-capture-sub">
                    Estas a un paso de tu match perfecto. Dejanos tu correo y te enviamos un link magico para verificar tu cuenta y recibir tu codigo de descuento.
                  </p>

                  {magicLinkSent ? (
                    <div className="quiz-magiclink-sent">
                      <Mail size={40} style={{ color: 'var(--rose)', marginBottom: 12 }} />
                      <h3>Revisa tu correo</h3>
                      <p>Te enviamos un link magico a <strong>{email}</strong>. Haz clic en el enlace para verificar tu cuenta y recibiras tu codigo de descuento.</p>
                      <button type="button" className="quiz-back-btn" onClick={goNext} style={{ marginTop: 16 }}>
                        Ver mi resultado
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ) : (
                    <form className="quiz-capture-form" onSubmit={handleCaptureSubmit}>
                      <div className="quiz-field">
                        <label htmlFor="quiz-email" className="quiz-field-label">
                          Correo electronico <span className="quiz-field-required">*</span>
                        </label>
                        <input
                          id="quiz-email"
                          type="email"
                          className="quiz-input"
                          placeholder="tu@correo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div className="quiz-capture-actions">
                        <button type="button" className="quiz-back-btn" onClick={goBack}>
                          <ChevronLeft size={18} />
                          Atras
                        </button>
                        <Magnetic>
                          <button type="submit" className="quiz-submit-btn" disabled={magicLinkLoading}>
                            {magicLinkLoading ? (
                              <><Loader2 size={18} className="spin" /> Enviando...</>
                            ) : (
                              <>Ver mi resultado <ArrowRight size={18} /></>
                            )}
                          </button>
                        </Magnetic>
                      </div>
                    </form>
                  )}
                </div>
              ) : currentQuestion ? (
                /* ─── Question step ─── */
                <>
                  <h2 className="quiz-question-label">{currentQuestion.label}</h2>
                  <div className="quiz-gif-inline">
                    <img src="/hero-bg.gif" alt="" className="quiz-gif-img" />
                  </div>
                  <div className="quiz-options">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.value
                      return (
                        <Magnetic key={opt.value}>
                          <button
                            className={`quiz-option-btn ${isSelected ? 'quiz-option-selected' : ''}`}
                            onClick={() => handleSelect(currentQuestion.id, opt.value)}
                            type="button"
                          >
                            <span className="quiz-option-text">{opt.label}</span>
                            {isSelected && (
                              <span className="quiz-option-check">
                                <ChevronRight size={16} />
                              </span>
                            )}
                          </button>
                        </Magnetic>
                      )
                    })}
                  </div>

                  {step > 0 && (
                    <button type="button" className="quiz-back-btn quiz-back-btn-inline" onClick={goBack}>
                      <ChevronLeft size={18} />
                      Atras
                    </button>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Result page ─── */}
        <AnimatePresence>
          {isResultStep && product && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="quiz-result"
            >
              <div className="quiz-result-badge">
                <Sparkles size={14} />
                <span>Tu dispositivo ideal</span>
              </div>

              <div className="quiz-result-card">
                <div className="quiz-result-image-wrap">
                  <img src={product.image} alt={product.name} className="quiz-result-image" />
                </div>

                <div className="quiz-result-info">
                  <h3 className="quiz-result-name">{product.name}</h3>

                  <div className="quiz-result-prices">
                    <span className="quiz-result-price">{formatMXN(product.price)}</span>
                    {magicLinkSent && (
                      <span className="quiz-result-tag" style={{ color: 'var(--rose)', fontWeight: 600 }}>
                        Descuento enviado a tu correo
                      </span>
                    )}
                  </div>

                  <p className="quiz-result-reason">{product.reason}</p>

                  {magicLinkSent && (
                    <div className="quiz-magiclink-reminder" style={{
                      background: 'var(--rose-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem', color: 'var(--berry)', marginBottom: 16, lineHeight: 1.5
                    }}>
                      <Mail size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Revisa <strong>{email}</strong> — te enviamos un link para verificar tu cuenta y recibir tu codigo de descuento.
                    </div>
                  )}

                  <div className="quiz-result-actions">
                    <Magnetic>
                      <Link
                        to={product.linkIds ? `/products/${product.linkIds[0]}` : `/products/${product.id}`}
                        className="quiz-result-buy-btn"
                      >
                        Comprar ahora
                        <ArrowRight size={18} />
                      </Link>
                    </Magnetic>
                  </div>
                </div>
              </div>

              {/* ─── Cross-sell ─── */}
              {product.crossSell && (
                <div className="quiz-cross-sell">
                  <p className="quiz-cross-sell-title">Clientes como tu tambien compraron...</p>
                  <div className="quiz-cross-sell-card">
                    <img
                      src={product.crossSell.image}
                      alt={product.crossSell.name}
                      className="quiz-cross-sell-image"
                    />
                    <div className="quiz-cross-sell-info">
                      <p className="quiz-cross-sell-name">{product.crossSell.name}</p>
                      <p className="quiz-cross-sell-price">{formatMXN(product.crossSell.price)}</p>
                      <Link
                        to={`/products/${product.crossSell.id}`}
                        className="quiz-cross-sell-link"
                      >
                        Ver producto
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <button type="button" className="quiz-restart-btn" onClick={handleReset}>
                Repetir quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
