/**
 * Botanical SVG illustrations.
 *
 * Everything the site draws is vector or CSS — no external image requests — so
 * the demo renders identically offline.
 */

import { motion, motionValue, useTransform, type MotionValue } from 'framer-motion'

import { cx, useReducedMotion } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

interface SeedProps {
  size?: number
  color?: string
  /** Slow rotation + bob when true. */
  animated?: boolean
  className?: string
}

/** A glossy teardrop-shaped seed with a highlight. */
export function Seed({ size = 28, color = '#7D5A3F', animated = false, className }: SeedProps) {
  const reduced = useReducedMotion()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cx(animated && !reduced && 'animate-float-slow', className)}
      style={animated && !reduced ? { animationDelay: `${(size % 7) * 0.4}s` } : undefined}
    >
      {/* Body: an asymmetric teardrop, wider at the top. */}
      <path
        d="M16 2.5c4.7 4.1 7.6 8.7 7.6 13.2C23.6 23 20.2 29.5 16 29.5S8.4 23 8.4 15.7C8.4 11.2 11.3 6.6 16 2.5Z"
        fill={color}
      />
      {/* Left highlight for a wet, three-dimensional look. */}
      <path
        d="M16 6.2c-3 2.9-4.8 6.2-4.8 9.4 0 2.6 1 5.4 2.6 7.4"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Seam */}
      <path
        d="M17.5 4.6c-3.2 5-4.6 10.3-4.6 15.6"
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Leaf
// ---------------------------------------------------------------------------

interface LeafProps {
  size?: number
  color?: string
  animated?: boolean
  className?: string
  flip?: boolean
}

/** A pointed leaf with a central vein and two side veins. */
export function Leaf({ size = 34, color = '#4F9E4A', animated = false, flip = false, className }: LeafProps) {
  const reduced = useReducedMotion()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cx(
        animated && !reduced && 'animate-float-slow',
        flip && 'scale-x-[-1]',
        className,
      )}
    >
      <path
        d="M38 3C22 3.6 8.6 9.4 5.4 20.2c-1.8 6.3 2.6 12.6 9 14.2C24 36.6 38 22 38 3Z"
        fill={color}
      />
      <path
        d="M36 5C24 10 14.6 17.6 8 30.6"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M27 11.5c-.6 4-1.6 7.6-3 11M20.5 16c-2.6 1.4-4.6 2.8-6.6 4.6M30.5 8.6c-.4 2.4-.8 4.4-1.2 6.2"
        stroke="rgba(255,255,255,0.32)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Sprout (the wiggling Little Sprouts icon)
// ---------------------------------------------------------------------------

interface SproutProps {
  size?: number
  animated?: boolean
  className?: string
}

/**
 * A seed with two leaves that wiggle. This is the signature motion of the
 * Little Sprouts brand block.
 */
export function Sprout({ size = 56, animated = true, className }: SproutProps) {
  const reduced = useReducedMotion()
  const wiggle = animated && !reduced

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {/* Soil mound */}
      <ellipse cx="32" cy="55" rx="19" ry="5.5" fill="#7D5A3F" opacity="0.9" />
      <ellipse cx="32" cy="53.6" rx="19" ry="5.5" fill="#9C7350" />

      {/* Stem — grows upward with a slight S-curve */}
      <motion.path
        d="M32 54c0-9 0-14-1-19"
        stroke="#3B7F38"
        strokeWidth="3.4"
        strokeLinecap="round"
        animate={wiggle ? { rotate: [-2.5, 2.5, -2.5] } : undefined}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '32px', originY: '54px' }}
      />

      {/* Left leaf */}
      <motion.g
        animate={wiggle ? { rotate: [-7, 7, -7], scaleX: [1, 1.06, 1] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '31px', originY: '38px' }}
      >
        <path d="M31 39c-8.6 0-13-4.6-13-9.6C25 29.4 31 33 31 39Z" fill="#4F9E4A" />
        <path d="M31 39c-4.6-1-8.6-3.4-11-6.6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round" />
      </motion.g>

      {/* Right leaf */}
      <motion.g
        animate={wiggle ? { rotate: [7, -7, 7], scaleX: [1, 1.06, 1] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.18 }}
        style={{ originX: '33px', originY: '33px' }}
      >
        <path d="M33 34c8.6 0 13-4.6 13-9.6C39 24.4 33 28 33 34Z" fill="#6FB96A" />
        <path d="M33 34c4.6-1 8.6-3.4 11-6.6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round" />
      </motion.g>

      {/* Seed still tucked at the base of the stem */}
      <ellipse cx="32" cy="50.5" rx="4.2" ry="3.2" fill="#5F4431" transform="rotate(-12 32 50.5)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Drifting particles (hero background)
// ---------------------------------------------------------------------------

interface DriftingSeedsProps {
  count?: number
  /** Pointer-driven parallax, as motion values so no re-render is needed. */
  offsetX?: MotionValue<number>
  offsetY?: MotionValue<number>
}

/**
 * A field of leaves and seeds falling behind the hero. Renders as a decorative
 * (aria-hidden) layer and is skipped entirely under reduced-motion.
 */
export function DriftingSeeds({ count = 16, offsetX, offsetY }: DriftingSeedsProps) {
  const reduced = useReducedMotion()
  if (reduced) return null

  // Deterministic layout so the field does not reshuffle on every render.
  const items = Array.from({ length: count }, (_, i) => {
    const seed = (i * 137.508) % 100 // golden-angle spread
    return {
      id: i,
      left: (i * 61.8) % 100,
      delay: -((i * 3.7) % 22),
      duration: 16 + ((i * 7) % 12),
      size: 16 + ((i * 5) % 22),
      isLeaf: i % 3 !== 0,
      hue: seed,
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        // Outer div = pointer parallax, inner div = the fall. Two separate
        // transforms, because Framer cannot keyframe `y` and a parallax offset
        // on the same element.
        <DriftingParticle key={item.id} item={item} offsetX={offsetX} offsetY={offsetY} />
      ))}
    </div>
  )
}

interface ParticleItem {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  isLeaf: boolean
  hue: number
}

function DriftingParticle({
  item,
  offsetX,
  offsetY,
}: {
  item: ParticleItem
  offsetX?: MotionValue<number>
  offsetY?: MotionValue<number>
}) {
  // Hooks run per-particle; `count` is constant so the hook order is stable.
  // Larger particles read as "nearer" and therefore move further.
  const depth = item.size / 14
  const ZERO = motionValue(0)
  const px = useTransform(offsetX ?? ZERO, (v) => v * depth)
  const py = useTransform(offsetY ?? ZERO, (v) => v * depth * 0.6)

  return (
    <motion.div className="absolute top-0 will-change-transform" style={{ left: `${item.left}%`, x: px, y: py }}>
      <motion.div
        initial={{ y: '-12vh', opacity: 0 }}
        animate={{ y: '112vh', opacity: [0, 1, 1, 0], rotate: 420 }}
        transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'linear' }}
      >
        <div style={{ opacity: 0.45 + (item.size / 60) * 0.5 }}>
          {item.isLeaf ? (
            <Leaf size={item.size} animated={false} color={item.hue > 50 ? '#4F9E4A' : '#6FB96A'} />
          ) : (
            <Seed
              size={item.size * 0.62}
              animated={false}
              color={item.hue > 50 ? '#9C7350' : '#B9916A'}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Wavy divider
// ---------------------------------------------------------------------------

interface WaveDividerProps {
  /** Fill colour of the section below the wave. */
  fill?: string
  className?: string
  flip?: boolean
}

/** The organic wavy SVG seam used between hero and the next section. */
export function WaveDivider({ fill = '#FAF6EA', className, flip = false }: WaveDividerProps) {
  return (
    <div className={cx('pointer-events-none w-full leading-[0]', className)} aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={cx('block h-[60px] w-full sm:h-[90px]', flip && 'rotate-180')}
      >
        <path
          d="M0 44c120 0 180-38 300-38s150 46 300 46 210-52 360-52 240 58 480 58v62H0V44Z"
          fill={fill}
        />
        {/* A thinner highlight wave layered on top for depth. */}
        <path
          d="M0 70c160 14 240-28 400-28s200 44 340 44 220-40 340-40 200 34 360 34v40H0V70Z"
          fill="rgba(255,255,255,0.45)"
        />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Blob shapes
// ---------------------------------------------------------------------------

interface BlobProps {
  color: string
  className?: string
  /** 0–1 opacity multiplier. */
  opacity?: number
}

/** Soft organic background blob built from a radial gradient. */
export function Blob({ color, className, opacity = 0.5 }: BlobProps) {
  return (
    <div
      aria-hidden="true"
      className={cx('blob pointer-events-none absolute', className)}
      style={{ background: `radial-gradient(circle at 35% 30%, ${color}, transparent 72%)`, opacity }}
    />
  )
}
