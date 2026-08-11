import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FRAMES = 60
const CANVAS_ID = 'scrub-canvas'

export default function ScrubCanvas() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const products = [
      { name: 'LED Light Therapy Mask', hue: 320 },
      { name: 'Rodillo Facial de Jade', hue: 160 },
      { name: 'Botas de Compresion', hue: 220 },
    ]

    // Dibujar frame — secuencia de varios productos
    const drawFrame = (progress) => {
      const w = canvas.width / window.devicePixelRatio
      const h = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, w, h)

      const prodIdx = Math.floor(progress * products.length) % products.length
      const nextIdx = (prodIdx + 1) % products.length
      const fraction = (progress * products.length) % 1

      const hue = products[prodIdx].hue + (products[nextIdx].hue - products[prodIdx].hue) * fraction

      // Gradiente animado entre productos
      const gradient = ctx.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, `hsl(${hue}, 50%, 40%)`)
      gradient.addColorStop(0.5, `hsl(${hue - 20}, 60%, 55%)`)
      gradient.addColorStop(1, `hsl(${hue - 40}, 70%, 30%)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      // Nombre del producto
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = '600 18px Inter, sans-serif'
      ctx.textAlign = 'center'
      const currentProduct = fraction < 0.5 ? products[prodIdx].name : products[nextIdx].name
      ctx.fillText(currentProduct, w / 2, h / 2 - 10)
      ctx.font = '400 13px Inter, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText(`Frame ${Math.round(progress * FRAMES)} / ${FRAMES}`, w / 2, h / 2 + 20)
    }

    // GSAP ScrollTrigger scrub
    const ctxGsap = gsap.context(() => {
      ScrollTrigger.create({
        trigger: canvas,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.4,
        onUpdate: (self) => {
          drawFrame(self.progress)
        },
      })
      drawFrame(0)
    })

    return () => {
      ctxGsap.revert()
      window.removeEventListener('resize', resize)
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '200vh',
        background: 'var(--gray-900)',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          id={CANVAS_ID}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </section>
  )
}
