/** Small shared helpers: currency formatting, cart math, motion preferences. */

import { useEffect, useState } from 'react'

/** All prices in the catalogue are CAD. */
const CAD = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
})

export function formatCAD(value: number): string {
  return CAD.format(value)
}

/** Compact form for big counters: 182450 -> "182,450". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-CA').format(Math.round(value))
}

/** Free shipping threshold, in CAD. */
export const FREE_SHIPPING_THRESHOLD = 60
export const SHIPPING_FLAT_RATE = 7.95

export function shippingFor(subtotal: number): number {
  if (subtotal === 0) return 0
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Joins class names, dropping falsy values. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Tracks the user's `prefers-reduced-motion` setting reactively.
 * Decorative loops bail out early when this is true.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** Returns a random integer in [min, max] — used by the falling-seed mini-game. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Deterministic pseudo-random from a string seed, for stable decorative layouts. */
export function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash % 1000) / 1000
}
