import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children }) {
  const ref = useRef(null)

  // Older browsers without IntersectionObserver start as visible,
  // so we decide this once, when the component is created.
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const element = ref.current
    if (!element || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true) // called from a callback, which is the correct place
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