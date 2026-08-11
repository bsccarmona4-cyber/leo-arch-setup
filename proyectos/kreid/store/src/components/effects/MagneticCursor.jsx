import { useRef, useCallback } from 'react'

/**
 * Magnetic wrapper — los hijos se "jalan" hacia el cursor al hacer hover.
 * Uso: <Magnetic><button>Comprar</button></Magnetic>
 */
export default function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null)

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }, [strength])

  const handleLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
    el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
    setTimeout(() => {
      if (el) el.style.transition = ''
    }, 400)
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: 'inline-flex', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
