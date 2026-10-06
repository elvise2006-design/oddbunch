/** Shared layout + motion primitives used across every page. */

import { motion, useInView, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cx } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SectionTitle
// ---------------------------------------------------------------------------

interface SectionTitleProps {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  align?: 'left' | 'center'
  className?: string
  /** Dot colour for the eyebrow pill. */
  accent?: string
  as?: 'h1' | 'h2' | 'h3'
}

/** Consistent section heading: eyebrow pill, big display title, optional lede. */
export function SectionTitle({
  eyebrow,
  title,
  lede,
  align = 'center',
  className,
  accent = '#4F9E4A',
  as: Tag = 'h2',
}: SectionTitleProps) {
  return (
    <div
      className={cx(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className={cx(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase',
            'bg-white/80 ring-1 ring-seed-300/60',
          )}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
          {eyebrow}
        </motion.span>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay: 0.06 }}
      >
        <Tag className="text-balance text-3xl leading-[1.08] font-semibold text-seed-900 sm:text-4xl lg:text-5xl">
          {title}
        </Tag>
      </motion.div>

      {lede && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className={cx(
            'text-pretty max-w-2xl text-base leading-relaxed text-seed-700/80 sm:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {lede}
        </motion.p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reveal — generic scroll-triggered entrance
// ---------------------------------------------------------------------------

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'

interface RevealProps {
  children: ReactNode
  className?: string
  direction?: RevealDirection
  delay?: number
  duration?: number
  /** Distance in px. */
  distance?: number
  once?: boolean
  as?: 'div' | 'li' | 'section' | 'article' | 'span'
}

const OFFSETS: Record<RevealDirection, { x: number; y: number; scale: number }> = {
  up: { x: 0, y: 1, scale: 1 },
  down: { x: 0, y: -1, scale: 1 },
  left: { x: 1, y: 0, scale: 1 },
  right: { x: -1, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.9 },
  none: { x: 0, y: 0, scale: 1 },
}

/**
 * Wraps children in a motion element that fades/slides/scales into view.
 * `direction` maps to the travel axis; `distance` scales the px offset.
 */
export function Reveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 26,
  once = true,
  as = 'div',
}: RevealProps) {
  const offset = OFFSETS[direction]
  const MotionTag = motion[as]

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x * distance,
      y: offset.y * distance,
      scale: offset.scale,
    },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-70px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

// ---------------------------------------------------------------------------
// Stagger container — cascades <Reveal>-style children
// ---------------------------------------------------------------------------

interface StaggerProps {
  children: ReactNode
  className?: string
  gap?: number
  delay?: number
  as?: 'div' | 'ul' | 'ol' | 'section'
}

export function Stagger({ children, className, gap = 0.1, delay = 0, as = 'div' }: StaggerProps) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-70px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </MotionTag>
  )
}

/** Child of <Stagger>. Uses the parent's variant name. */
export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  )
}

// ---------------------------------------------------------------------------
// Section — consistent vertical rhythm + optional tinted background
// ---------------------------------------------------------------------------

interface SectionProps extends React.ComponentPropsWithoutRef<'section'> {
  children: ReactNode
  id?: string
  /** Removes the default vertical padding (for flush sections). */
  flush?: boolean
}

export function Section({
  children,
  className,
  id,
  flush = false,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cx('relative', !flush && 'py-20 sm:py-24 lg:py-28', className)}
      {...rest}
    >
      {children}
    </section>
  )
}

/** Standard max-width content wrapper. */
export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'narrow'
}) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-5 sm:px-8',
        size === 'default' && 'max-w-6xl',
        size === 'wide' && 'max-w-7xl',
        size === 'narrow' && 'max-w-3xl',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AnimatedCounter
// ---------------------------------------------------------------------------

interface AnimatedCounterProps {
  /** Final value. */
  value: number
  /** How long the count-up takes, in ms. */
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  /** Rendered below the number. */
  label?: string
  decimals?: number
}

/**
 * Counts up from zero the first time it scrolls into view.
 * Under `prefers-reduced-motion` it renders the final value immediately.
 */
export function AnimatedCounter({
  value,
  duration = 1900,
  prefix = '',
  suffix = '',
  className,
  label,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const display = useCountUp(value, inView, duration)

  return (
    <div className={cx('flex flex-col items-center gap-1.5', className)}>
      <span
        ref={ref}
        className="font-display text-4xl leading-none font-semibold tabular-nums sm:text-5xl"
      >
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </span>
      {label && <span className="text-center text-sm font-medium opacity-75">{label}</span>}
    </div>
  )
}

/** Drives a 0 → target count with an ease-out curve over `duration` ms. */
function useCountUp(target: number, active: boolean, duration: number): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    if (prefersReduced()) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      // easeOutExpo: fast start, long gentle settle.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, duration])

  return value
}

function prefersReduced(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
