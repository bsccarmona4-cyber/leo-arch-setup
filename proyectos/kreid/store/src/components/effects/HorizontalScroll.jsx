import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const slides = [
  {
    title: 'Rostro Radiante',
    subtitle: 'Tecnologia para tu piel',
    desc: 'Desde experiencia con luz LED hasta rodillos de jade. Herramientas profesionales para consentir tu rostro en casa.',
    color: 'var(--rose)',
  },
  {
    title: 'Cuerpo en Movimiento',
    subtitle: 'Recuperacion y bienestar',
    desc: 'Botas de compresion, pistolas de masaje y todo lo que necesitas para sentirte bien despues del ejercicio.',
    color: 'var(--berry)',
  },
  {
    title: 'Ritual Personal',
    subtitle: 'Tu momento, tus reglas',
    desc: 'Cada mujer es unica. Encuentra el dispositivo que se adapta a tu estilo de vida, no al reves.',
    color: 'var(--gold)',
  },
  {
    title: 'Bienestar Diario',
    subtitle: 'Bienestar y comodidad',
    desc: 'Termometros infrarrojos, reposamunecas ergonomicos y accesorios que hacen tu dia a dia mas facil.',
    color: 'var(--rose)',
  },
]

export default function HorizontalScroll() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const ctx = gsap.context(() => {
      const totalWidth = track.scrollWidth
      const viewportW = window.innerWidth
      const distance = -(totalWidth - viewportW)

      gsap.fromTo(
        track,
        { x: 0 },
        {
          x: distance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${totalWidth - viewportW}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--gray-900)',
        position: 'relative',
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          height: '100%',
          width: `${slides.length * 100}vw`,
          willChange: 'transform',
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 24,
              padding: '0 10vw',
              color: 'var(--white)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: slide.color,
              }}
            >
              {slide.subtitle}
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 700,
                lineHeight: 'calc(1 + 0.3 / clamp(2rem, 5vw, 4rem))',
                textAlign: 'center',
                maxWidth: 640,
                color: 'var(--white)',
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--gray-400)',
                textAlign: 'center',
                maxWidth: 480,
              }}
            >
              {slide.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
