'use client'

import { useState } from 'react'

/* ───────────── Estética ─────────────
 * Dirección: "dulce protector" — soft pastel con carga emocional.
 * Colores: lavanda suave, melocotón, menta.
 * Tipografía: system-serif para títulos (onda carta familiar), sans para cuerpo.
 * Sensación: álbum de fotos familiar, no SaaS frío.
 * Referencia visual: tienda de regalos artesanal, no startup.
 * ──────────────────────────────────── */

/* ───────────── Planes ───────────── */
/* ───────────── Checkout Flow ───────────── */
async function handleCheckout(planId: string, price: number) {
  try {
    const email = (document.getElementById('checkout-email') as HTMLInputElement)?.value
    const name = (document.getElementById('checkout-name') as HTMLInputElement)?.value
    const familiarPhone = (document.getElementById('familiar-phone') as HTMLInputElement)?.value

    if (!email) {
      alert('Ingresa tu correo electrónico primero')
      return
    }

    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, email, name: name || email.split('@')[0], familiarPhone }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Error al crear checkout: ' + (data.error || 'desconocido'))
    }
  } catch (err) {
    alert('Error de conexión. Stripe no está configurado en modo test.')
    console.error(err)
  }
}

const PLANS = [
  {
    id: 'mensual',
    name: 'Mensual',
    price: 99,
    period: '/mes',
    desc: 'Empieza con calma, sin presiones',
    popular: false,
    savings: null,
    features: [
      '3 análisis de links cada día',
      '3 análisis de correos cada día',
      'Respuesta por WhatsApp en segundos',
      'Respuesta por correo en segundos',
      'Análisis con inteligencia artificial',
    ],
    cta: 'Elegir Mensual',
    gradient: 'from-amber-200/60 via-amber-50 to-white',
    border: 'border-amber-200/60',
    accent: 'text-amber-700',
    accentBg: 'bg-amber-100',
    accentBorder: 'border-amber-300',
    shadow: 'shadow-amber-200/30',
    checkBg: 'bg-amber-100',
    checkColor: 'text-amber-600',
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    price: 249,
    period: '/trimestre',
    desc: 'La opción que más familias eligen',
    popular: true,
    savings: 'Ahorras $48 comparado con el mensual',
    features: [
      'Todo lo del plan Mensual',
      '4 análisis de links cada día',
      '4 análisis de correos cada día',
      'Guía de configuración paso a paso',
      'Soporte directo por WhatsApp',
      'Link exclusivo para tu familiar',
    ],
    cta: 'Elegir Trimestral',
    gradient: 'from-sky-200/60 via-sky-50 to-white',
    border: 'border-sky-200/60',
    accent: 'text-sky-700',
    accentBg: 'bg-sky-100',
    accentBorder: 'border-sky-300',
    shadow: 'shadow-sky-200/30',
    checkBg: 'bg-sky-100',
    checkColor: 'text-sky-600',
  },
  {
    id: 'anual',
    name: 'Anual',
    price: 799,
    period: '/año',
    desc: 'Para protegerlos todo el año sin preocuparte',
    popular: false,
    savings: 'Ahorras $389 comparado con el mensual',
    features: [
      'Todo lo del plan Trimestral',
      '5 análisis de links cada día',
      '5 análisis de correos cada día',
      'Link exclusivo de WhatsApp',
      'Dashboard para ver la actividad',
      'Prioridad en el soporte',
    ],
    cta: 'Elegir Anual',
    gradient: 'from-emerald-200/60 via-emerald-50 to-white',
    border: 'border-emerald-200/60',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-100',
    accentBorder: 'border-emerald-300',
    shadow: 'shadow-emerald-200/30',
    checkBg: 'bg-emerald-100',
    checkColor: 'text-emerald-600',
  },
]

/* ───────────── FAQ ───────────── */
const FAQS = [
  {
    q: '¿Qué es Guardián?',
    a: 'Es como un ángel de la guarda para el celular de tus papás. Reciben un link sospechoso, lo reenvían a Guardián y en segundos les decimos si es seguro o es una estafa. Nada más.',
  },
  {
    q: '¿Para quién es esto?',
    a: 'Para hijos y nietos que quieren proteger a sus mayores. Tú lo configuras en 5 minutos, ellos solo reenvían mensajes. Así de simple.',
  },
  {
    q: '¿Cómo se configura?',
    a: 'Al contratar, te damos un link especial de WhatsApp y una guía con dibujos. Guardas el contacto en el celular de tu familiar, y listo. Sin apps raras, sin técnicos.',
  },
  {
    q: '¿Qué tipo de fraudes detecta?',
    a: 'Todo: sorteos falsos de Oxxo, Walmart, Liverpool; correos de BBVA o Banamex; apoyos del gobierno falsos; ofertas de trabajo desde casa; cualquier cosa que huela a estafa.',
  },
  {
    q: '¿Y si llega al límite de análisis?',
    a: 'Nunca lo dejamos sin proteger. Si llega al tope del día, le avisamos y al día siguiente puede seguir usando Guardián. Así el servicio se mantiene rápido para todos.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Claro, sin multas ni letras chiquitas. Cancelas desde tu correo y el servicio sigue hasta que termine el período que ya pagaste.',
  },
  {
    q: '¿El pago es seguro?',
    a: 'Sí, usamos Stripe, la misma plataforma que usan miles de tiendas en todo el mundo. No guardamos los datos de tu tarjeta.',
  },
]

/* ───────────── Cómo funciona ───────────── */
const STEPS = [
  {
    emoji: '📲',
    title: 'Tú lo configuras',
    desc: 'En 5 minutos guardas el contacto de Guardián en el celular de tu familiar. Te damos una guía con dibujos, imposible equivocarse.',
    detail: 'Sin apps, sin cuentas, sin complicaciones.',
  },
  {
    emoji: '↪️',
    title: 'Ellos reenvían',
    desc: 'Cuando les llegue algo raro, solo reenvían el mensaje a Guardián. Como harían con cualquier contacto de WhatsApp.',
    detail: 'No tienen que aprender nada nuevo.',
  },
  {
    emoji: '🛡️',
    title: 'Nosotros respondemos',
    desc: 'En segundos reciben un mensaje clarito: 🟢 Seguro, 🟡 Cuidado o 🔴 Estafa. Con explicación en español y qué hacer.',
    detail: 'Y si es estafa, les decimos exactamente a quién llamar.',
  },
]

/* ───────────── Componentes ───────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide text-amber-700 bg-amber-100 rounded-full">
            ❓ Preguntas frecuentes
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-800" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
            Todo lo que necesitas saber
          </h2>
          <p className="mt-2 text-gray-500 text-sm">Respuestas claras, sin letras chiquitas.</p>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-200 cursor-pointer ${
                open === i
                  ? 'border-amber-200 bg-white shadow-md shadow-amber-100/50'
                  : 'border-amber-100/60 bg-white/70 hover:border-amber-200/60 hover:bg-white'
              }`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center justify-between p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 pr-4 leading-snug">
                  {faq.q}
                </h3>
                <span className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                  open === i ? 'rotate-45' : ''
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </div>
              {open === i && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-count-up">
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan, i }: { plan: typeof PLANS[0]; i: number }) {
  return (
    <div
      className={`relative rounded-2xl border-2 p-6 sm:p-7 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
        plan.popular
          ? `${plan.border} ${plan.shadow} shadow-lg z-10 ${plan.gradient}`
          : `${plan.border} ${plan.gradient} hover:${plan.shadow}`
      }`}
      style={{ animationDelay: `${i * 100}ms` }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-400 to-sky-500 rounded-full shadow-md shadow-sky-200/50">
            ⭐ Más popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-800">{plan.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{plan.desc}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm text-gray-400 font-medium">$</span>
          <span className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight tabular-nums">
            {plan.price}
          </span>
          <span className="text-sm text-gray-400">{plan.period}</span>
        </div>
        {plan.savings && (
          <span className={`inline-block mt-1.5 text-xs font-semibold ${plan.accentBg} ${plan.accent} px-2.5 py-0.5 rounded-full`}>
            {plan.savings}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-7 flex-1 text-sm">
        {plan.features.map((f, j) => (
          <li key={j} className="flex items-start gap-2.5 text-gray-600">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full ${plan.checkBg} mt-0.5 shrink-0`}>
              <svg className={`w-3 h-3 ${plan.checkColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => handleCheckout(plan.id, plan.price)}
        className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-md active:scale-[0.97] ${
          plan.popular
            ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-200/50'
            : `bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900`
        }`}
      >
        {plan.cta}
      </button>
    </div>
  )
}

/* ───────────── Page ───────────── */
export default function PlanesPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [familiarPhone, setFamiliarPhone] = useState('')
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCheckout(planId: string, price: number) {
    if (!email) {
      alert('Primero ingresa tu correo en el formulario de abajo')
      return
    }

    setSelectedPlan({ id: planId, name: PLANS.find(p => p.id === planId)?.name || planId, price })
    setShowCheckoutModal(true)
  }

  async function confirmCheckout() {
    if (!selectedPlan || !email) return
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          email,
          name: name || email.split('@')[0],
          familiarPhone: familiarPhone || undefined,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error: ' + (data.error || 'desconocido'))
        setLoading(false)
      }
    } catch (err) {
      alert('Error de conexión. Stripe debe estar configurado.')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white font-['Inter',system-ui,sans-serif]">
      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 left-[10%] w-72 h-72 bg-amber-200/40 rounded-full blur-3xl" />
          <div className="absolute top-10 right-[15%] w-56 h-56 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-rose-200/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide text-amber-700 bg-amber-100 rounded-full">
            🛡️ Protege a tu familia
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-[1.1] tracking-tight" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
            Tu familia protegida por{' '}
            <span className="bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              menos de lo que cuesta un café
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            Por $3.30 al día, tus papás o abuelos tienen quien les revise los links sospechosos. 
            Sin apps, sin técnicos, sin estrés.
          </p>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pago único, sin sorpresas
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cancela cuando quieras
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagos seguros con Stripe
            </span>
          </div>
          {/* Email form — needed before checkout */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-4 shadow-lg shadow-amber-100/20">
              <p className="text-xs font-semibold text-gray-500 mb-3 text-center">
                Ingresa tu correo para contratar ↓
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="flex-1 px-4 py-3 rounded-xl text-sm border border-amber-200/60 bg-white/90 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Stripe procesa pagos. No guardamos tu tarjeta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 items-start">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} i={i} />
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-gray-400">
            Todos los planes incluyen configuración guiada y soporte en español.
            Pagos seguros con Stripe.
          </p>
        </div>
      </section>

      {/* ═══════ CÓMO FUNCIONA ═══════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-700 bg-sky-100 rounded-full">
              🎯 Así de fácil
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-800" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
              Tres pasos y listo
            </h2>
            <p className="mt-2 text-sm text-gray-500">Si sabes usar WhatsApp, ya sabes usar Guardián.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-amber-200/60 text-2xl shadow-sm shadow-amber-100/50">
                    {step.emoji}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">{i + 1}</span>
                  <h3 className="text-sm font-bold text-gray-700">{step.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                <p className="mt-1.5 text-xs text-sky-600 font-medium">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BENEFICIOS ═══════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-700 bg-emerald-100 rounded-full">
              ✨ Por qué funciona
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-800" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
              Más que detectar estafas
            </h2>
            <p className="mt-2 text-sm text-gray-500">Guardián está hecho a la medida de familias mexicanas.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { icon: '🤖', title: 'Entiende fraudes mexicanos', desc: 'Sabe reconocer estafas de bancos, sorteos y gobierno que solo pasan en México.' },
              { icon: '🔒', title: 'Privacidad total', desc: 'Solo vemos los links que nos mandan. No guardamos mensajes ni datos personales.' },
              { icon: '⚡', title: 'Responde al instante', desc: 'Mientras esperas en el banco, Guardián ya analizó el link.' },
              { icon: '💬', title: 'Soporte en español', desc: 'Si algo no funciona, te contestamos por WhatsApp. En español y sin rodeos.' },
            ].map((feat, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-xl bg-white border border-amber-100/60 hover:border-amber-200/60 hover:shadow-md hover:shadow-amber-100/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-sky-100 text-xl group-hover:scale-110 transition-transform duration-200 shrink-0">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-700">{feat.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{feat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIO ─────── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-700 bg-sky-100 rounded-full">
              💬 Familias como la tuya
            </span>
          </div>
          <div className="relative p-8 sm:p-10 rounded-2xl bg-white border border-amber-100/60 shadow-lg shadow-amber-100/20">
            {/* Decorative quote */}
            <div className="absolute -top-3 -left-2 text-5xl text-amber-200 select-none" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>&ldquo;</div>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed italic relative z-10">
              Mi mamá siempre caía en los sorteos falsos de Oxxo. Desde que tiene Guardián, me reenvía los links antes de hacer clic. Ya van tres estafas que evitamos.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-sky-300 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                C
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Carlos G.</p>
                <p className="text-xs text-gray-400">Hijo — Configuró Guardián a sus papás</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ─────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-amber-400 via-sky-400 to-emerald-400 shadow-xl shadow-amber-200/30 relative overflow-hidden">
            {/* Decorative dots */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
                  y este mes tiene un 25% de descuento
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/90 max-w-sm mx-auto leading-relaxed">
                solo por ser la primera vez, puedes probarlo durante todo un mes para que veas que si funciona
              </p>
              <div className="mt-8 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-5 py-3.5 rounded-xl text-sm text-gray-700 bg-white/95 border-0 outline-none focus:ring-4 focus:ring-white/30 placeholder:text-gray-400 mb-3 text-center"
                />
                <button
                  onClick={() => handleCheckout('mensual', 99)}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-bold text-sky-700 bg-white hover:bg-amber-50 transition-colors shadow-lg active:scale-[0.98]"
                >
                  Quiero el descuento — Sin riesgo
                </button>
              </div>
              <p className="mt-3 text-xs text-white/70">
                Sin compromiso. Cancela cuando quieras en un clic. Sin letras chiquitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <FAQ />

      {/* ═══════ FOOTER ─────── */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-amber-100/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">🛡️ Guardián</span>
          </div>
          <p className="text-xs text-gray-400 text-center">Anti-Fraude Digital — Protegiendo familias mexicanas.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/privacidad" className="hover:text-gray-600 transition-colors">Privacidad</a>
            <span>·</span>
            <a href="/terminos" className="hover:text-gray-600 transition-colors">Términos</a>
            <span>·</span>
            <span>hola@guardian.mx</span>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-5 pt-4 border-t border-amber-100/40 flex justify-center">
          <p className="text-[10px] text-gray-400">© {new Date().getFullYear()} Guardián. Hecho en 🇲🇽 México.</p>
        </div>
      </footer>

      {/* ═══════ CHECKOUT MODAL ═══════ */}
      {showCheckoutModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-amber-100 shadow-2xl p-6 animate-count-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Confirmar suscripción</h3>
              <button onClick={() => { setShowCheckoutModal(false); setLoading(false); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-5">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Plan {selectedPlan.name}</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">${selectedPlan.price} MXN <span className="text-sm font-normal text-gray-500">/{selectedPlan.id === 'anual' ? 'año' : 'mes'}</span></p>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-gray-600">Tu nombre</label>
                <input id="checkout-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Carlos García" className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-sky-400 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">WhatsApp de tu familiar (opcional)</label>
                <input id="familiar-phone" type="tel" value={familiarPhone} onChange={e => setFamiliarPhone(e.target.value)} placeholder="+52 55 1234 5678" className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-sky-400 mt-1" />
                <p className="text-[10px] text-gray-400 mt-1">Lo registramos para activar su número exclusivo</p>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center mb-4">
              Stripe procesa tu pago. No guardamos datos de tarjeta. Renovación automática.
            </p>

            <button
              onClick={confirmCheckout}
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Redirigiendo a Stripe...</>
              ) : (
                `Pagar $${selectedPlan.price} MXN con Stripe`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
