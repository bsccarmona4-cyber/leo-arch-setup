import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CHARS = '!<>-_\\/[]{}—=+*^?#________'

export default function ScrambleText({
  text = 'Precision Beauty Technology',
  as: Tag = 'h2',
  style: customStyle = {},
  ...props
}) {
  const ref = useRef(null)
  const [display, setDisplay] = useState('')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame
    let progress = 0
    const length = text.length

    const update = () => {
      let output = ''
      const full = Math.floor(progress * length)

      for (let i = 0; i < length; i++) {
        if (i < full) {
          output += text[i]
        } else if (i === full) {
          output += CHARS[Math.floor(Math.random() * CHARS.length)]
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }
      setDisplay(output)

      if (progress < 1) {
        progress += 0.03
        frame = requestAnimationFrame(update)
      } else {
        setDisplay(text)
      }
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          progress = 0
          frame = requestAnimationFrame(update)
        },
        once: true,
      })
    })

    return () => {
      ctx.revert()
      cancelAnimationFrame(frame)
    }
  }, [text])

  return (
    <Tag
      ref={ref}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        lineHeight: 'calc(1 + 0.3 / 2.5rem)',
        minHeight: '1.2em',
        ...customStyle,
      }}
      {...props}
    >
      {display || text}
    </Tag>
  )
}
