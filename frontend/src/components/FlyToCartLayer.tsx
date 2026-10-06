/**
 * FlyToCartLayer — the "add to cart" flight animation.
 *
 * When an item is added, a mini fruit token arcs from the clicked button to the
 * cart icon in the navbar. The token is positioned with a fixed layer + keyframes
 * so it is unaffected by the page's scroll containers.
 */

import { AnimatePresence, motion } from 'framer-motion'

import { CART_ANCHOR_ID } from '@/components/flightConstants'
import { useCart } from '@/hooks/useCart'
import { useEffect, useState } from 'react'
import { cx } from '@/lib/utils'

interface Flight {
  id: number
  emoji: string
  accent: string
  from: { x: number; y: number }
  to: { x: number; y: number }
}

/** Resolves the cart icon's centre in viewport coordinates. */
function cartTarget(): { x: number; y: number } | null {
  const el = document.getElementById(CART_ANCHOR_ID)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

export function FlyToCartLayer() {
  const { flyEvent, clearFlyEvent } = useCart()
  const [flights, setFlights] = useState<Flight[]>([])

  useEffect(() => {
    if (!flyEvent) return

    const to = cartTarget()
    if (!to) {
      // Navbar not mounted (shouldn't happen) — skip the flight quietly.
      clearFlyEvent()
      return
    }

    const flight: Flight = {
      id: flyEvent.id,
      emoji: flyEvent.product.emoji,
      accent: flyEvent.product.accent,
      from: flyEvent.origin,
      to,
    }

    setFlights((current) => [...current, flight])
    window.setTimeout(() => {
      setFlights((current) => current.filter((f) => f.id !== flight.id))
    }, 820)
    window.setTimeout(clearFlyEvent, 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyEvent])

  return (
    <div className="pointer-events-none fixed inset-0 z-100" aria-hidden="true">
      <AnimatePresence>
        {flights.map((flight) => (
          <motion.div
            key={flight.id}
            initial={{ x: flight.from.x, y: flight.from.y, scale: 0.4, opacity: 0, rotate: 0 }}
            animate={{
              // Control points create the arc: up first, then across.
              x: [flight.from.x, flight.from.x, flight.to.x],
              y: [flight.from.y, flight.from.y - 90, flight.to.y],
              scale: [0.4, 1.25, 0.35],
              opacity: [0, 1, 1, 0],
              rotate: [0, 25, 320],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.78, ease: [0.32, 0, 0.4, 1], times: [0, 0.28, 1] }}
            className="absolute top-0 left-0"
            style={{ translateX: '-50%', translateY: '-50%' }}
          >
            <span
              className={cx(
                'grid h-11 w-11 place-items-center rounded-2xl text-2xl shadow-lift ring-2 ring-white',
              )}
              style={{ backgroundColor: flight.accent }}
            >
              {flight.emoji}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
