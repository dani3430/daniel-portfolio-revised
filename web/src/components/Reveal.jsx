'use client'

import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children }) {
  const ref = useRef(null)

  // Older browsers without IntersectionObserver start as visible.
  // The "typeof window" check keeps this safe while Next.js builds the page on the server.
  const [visible, setVisible] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window),
  )

  useEffect(() => {
    const element = ref.current
    if (!element || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect() // animate only once
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
      {children}
    </div>
  )
}