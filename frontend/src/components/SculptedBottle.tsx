/**
 * Sculpted glass bottles for The Rare Collection.
 *
 * Each bottle is a distinct inline SVG silhouette (skull, apple, dragon fruit,
 * pear, crescent moon, hedgehog) so nothing depends on external imagery.
 * The `fillRatio` prop animates the liquid level for a "just poured" feel.
 */

import { motion } from 'framer-motion'

import { BOTTLE_SHAPES } from '@/data/site'
import type { BottleShape } from '@/lib/api'
import { cx, useReducedMotion } from '@/lib/utils'

interface BottleProps {
  shape: BottleShape
  size?: number
  /** Liquid level, 0–1 from the bottom. */
  fillRatio?: number
  className?: string
  /** Gentle float + tilt; disabled under reduced motion. */
  animated?: boolean
}

export function SculptedBottle({
  shape,
  size = 180,
  fillRatio = 0.78,
  className,
  animated = true,
}: BottleProps) {
  const reduced = useReducedMotion()
  const def = BOTTLE_SHAPES[shape] ?? BOTTLE_SHAPES.apple
  const float = animated && !reduced

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 150"
      fill="none"
      role="img"
      aria-label={`${def.label} sculpted glass bottle`}
      className={cx('overflow-visible', className)}
      animate={float ? { y: [0, -7, 0], rotate: [-1.2, 1.2, -1.2] } : undefined}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={float ? { scale: 1.05, rotate: 0 } : undefined}
    >
      <defs>
        {/* Glass body gradient: light on the left, deeper on the right. */}
        <linearGradient id={`glass-${shape}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor={def.glass} stopOpacity="0.75" />
          <stop offset="100%" stopColor={def.glass} stopOpacity="0.95" />
        </linearGradient>
        {/* Vertical fade used to mask the liquid to the bottle silhouette. */}
        <linearGradient id={`fade-${shape}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </linearGradient>
        <clipPath id={`clip-${shape}`}>
          <path d={SILHOUETTES[shape].body} />
        </clipPath>
      </defs>

      {/* Cast shadow on the "shelf" */}
      <ellipse cx="60" cy="143" rx="34" ry="5.5" fill="#000" opacity="0.22" />

      {/* --- Liquid, clipped to the bottle body and animated on mount --- */}
      <g clipPath={`url(#clip-${shape})`}>
        <motion.rect
          x="0"
          y="150"
          width="120"
          fill={def.liquid}
          initial={{ height: 0 }}
          animate={{ height: 150 * fillRatio, y: 150 - 150 * fillRatio }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          opacity="0.94"
        />
        {/* Meniscus shimmer line at the liquid surface */}
        <motion.line
          x1="0"
          x2="120"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.6"
          initial={{ y1: 150, y2: 150 }}
          animate={{ y1: 150 - 150 * fillRatio, y2: 150 - 150 * fillRatio }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>

      {/* --- Glass outline + sheen --- */}
      <path
        d={SILHOUETTES[shape].body}
        fill={`url(#glass-${shape})`}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={SILHOUETTES[shape].sheen}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* --- Shape-specific detailing --- */}
      <ShapeDetails shape={shape} />

      {/* Neck + stopper, drawn last so it overlaps the body edge */}
      <path
        d={SILHOUETTES[shape].neck}
        fill={`url(#glass-${shape})`}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.8"
      />
      <rect
        x={SILHOUETTES[shape].stopperX}
        y="2"
        width={SILHOUETTES[shape].stopperW}
        height="11"
        rx="3.5"
        fill="#2A0B22"
        stroke="#E3D5F0"
        strokeWidth="1.2"
      />
    </motion.svg>
  )
}

/**
 * Silhouette paths per bottle shape, in a 120 x 150 viewBox.
 * `body` is the glass volume, `neck` the lip, `sheen` the specular highlight.
 */
const SILHOUETTES: Record<
  BottleShape,
  { body: string; neck: string; sheen: string; stopperX: number; stopperW: number }
> = {
  // A skull: wide cranium, narrowed cheekbones, flat jaw.
  skull: {
    body: 'M60 20c-24 0-42 17-42 40 0 14 4 22 9 29 4 6 5 10 5 17 0 12 12 20 28 20s28-8 28-20c0-7 1-11 5-17 5-7 9-15 9-29 0-23-18-40-42-40Z',
    neck: 'M50 8h20v12H50z',
    sheen: 'M40 42c-4 8-4 20-1 30',
    stopperX: 48,
    stopperW: 24,
  },
  // An apple: two lobes with a dimple top and a tapered base.
  apple: {
    body: 'M60 34c-9-7-24-6-31 3-8 10-7 32 2 50 6 12 15 22 22 25 3 1 5 1 7 0 7-3 16-13 22-25 9-18 10-40 2-50-7-9-22-10-31-3Z',
    neck: 'M54 20h12v15H54z',
    sheen: 'M44 46c-4 10-3 24 1 36',
    stopperX: 53,
    stopperW: 14,
  },
  // A dragon fruit: an egg body with spikes radiating outward.
  dragon: {
    body: 'M60 26c-19 0-33 17-33 40 0 24 15 46 33 46s33-22 33-46c0-23-14-40-33-40Z',
    neck: 'M52 12h16v15H52z',
    sheen: 'M45 52c-4 11-2 24 2 33',
    stopperX: 51,
    stopperW: 18,
  },
  // A pear: a small rounded crown over a wide teardrop base.
  pear: {
    body: 'M60 30c-9 0-15 8-15 18 0 8 3 12-2 19-6 8-10 18-10 29 0 18 12 28 27 28s27-10 27-28c0-11-4-21-10-29-5-7-2-11-2-19 0-10-6-18-15-18Z',
    neck: 'M54 14h12v17H54z',
    sheen: 'M50 58c-4 10-6 20-5 28',
    stopperX: 53,
    stopperW: 14,
  },
  // A crescent moon: two offset circles subtracted to form the crescent.
  moon: {
    body: 'M60 22c-22 0-40 20-40 48s18 48 40 48c-13-9-20-25-20-48s7-39 20-48Z',
    neck: 'M30 24h12v12H30z',
    sheen: 'M46 40c-5 10-6 24-2 36',
    stopperX: 29,
    stopperW: 14,
  },
  // A blackberry: a lumpy cluster with a leaf cap on top.
  hedgehog: {
    body: 'M60 38c-16 0-30 14-30 33 0 20 13 37 30 37s30-17 30-37c0-19-14-33-30-33Z',
    neck: 'M54 26h12v14H54z',
    sheen: 'M44 62c-3 9-2 18 1 25',
    stopperX: 53,
    stopperW: 14,
  },
}

/** Per-shape extra line art: eyes, stems, spikes, drupelets. */
function ShapeDetails({ shape }: { shape: BottleShape }) {
  switch (shape) {
    case 'skull':
      return (
        <g>
          {/* Eye sockets */}
          <ellipse cx="47" cy="62" rx="9" ry="11" fill="#2A0B22" opacity="0.92" />
          <ellipse cx="73" cy="62" rx="9" ry="11" fill="#2A0B22" opacity="0.92" />
          {/* Nasal cavity */}
          <path d="M60 74l-4.5 7h9L60 74Z" fill="#2A0B22" opacity="0.8" />
          {/* Teeth */}
          <rect x="48" y="95" width="24" height="11" rx="2.5" fill="#2A0B22" opacity="0.85" />
          <path d="M54 95v11M60 95v11M66 95v11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          {/* Cranium seam */}
          <path d="M60 20v20" stroke="rgba(42,11,34,0.4)" strokeWidth="1.4" />
        </g>
      )
    case 'apple':
      return (
        <g>
          {/* Pressed stem */}
          <path d="M60 32c0-8 3-13 8-16" stroke="#5F4431" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* Single leaf on the stem */}
          <path d="M68 17c8-3 14 0 15 6-6 4-13 3-15-6Z" fill="#4F9E4A" />
          {/* Bottom calyx */}
          <path d="M60 112c-4 3-9 3-13 0 4-2 9-2 13 0Zm0 0c4 3 9 3 13 0-4-2-9-2-13 0Z" fill="#5F4431" opacity="0.5" />
        </g>
      )
    case 'dragon':
      return (
        <g stroke="#F9A8D4" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95">
          {SPIKES.map((s, i) => (
            <path key={i} d={s} />
          ))}
        </g>
      )
    case 'pear':
      return (
        <g>
          <path d="M60 30c1-8 5-13 11-15" stroke="#5F4431" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M70 16c7-4 13-1 14 5-6 4-12 3-14-5Z" fill="#4F9E4A" />
          {/* Speckles, the classic Williams pear look */}
          {SPECKLES.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.5" fill="#9C7350" opacity="0.4" />
          ))}
        </g>
      )
    case 'moon':
      return (
        <g>
          {/* Star inlay */}
          <path d="M42 56l3.2 7 7 3.2-7 3.2L42 76l-3.2-6.6L32 66.2l6.8-3.2L42 56Z" fill="#E3D5F0" opacity="0.75" />
          {/* Rind texture dashes */}
          <path
            d="M30 44h6M26 62h7M28 80h6"
            stroke="#F7941D"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      )
    case 'hedgehog':
      return (
        <g>
          {/* Bristles */}
          <g stroke="#3B0F5E" strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
            {BRISTLES.map((b, i) => (
              <path key={i} d={b} />
            ))}
          </g>
          {/* Leaf cap */}
          <path d="M60 26c-9-6-19-4-22 4 8 6 17 5 22-4Z" fill="#4F9E4A" />
          {/* Druplet dimples */}
          {DRUPLETS.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.4" fill="#1D0818" opacity="0.45" />
          ))}
        </g>
      )
    default:
      return null
  }
}

// Wrapper so each bottle can render its own details without prop drilling.

/** Dragon-fruit spikes radiating from the body outline. */
const SPIKES = [
  'M60 24v-9', 'M46 30l-4-9', 'M74 30l4-9',
  'M36 44l-8-6', 'M84 44l8-6', 'M28 62H17', 'M92 62h11',
  'M32 82l-9 4', 'M88 82l9 4', 'M42 100l-6 8', 'M78 100l6 8',
]

/** Hedgehog bristle stubs around the blackberry cluster. */
const BRISTLES = [
  'M42 48l-6-3', 'M60 42v-7', 'M78 48l6-3',
  'M36 64l-7 0', 'M84 64h7', 'M38 84l-6 4', 'M82 84l6 4',
  'M48 100l-4 6', 'M72 100l4 6',
]

/** Williams-pear speckles. */
const SPECKLES: [number, number][] = [
  [46, 66], [58, 62], [70, 68], [42, 82], [54, 88], [66, 84], [76, 92], [50, 106], [68, 104],
]

/** Blackberry druplet dimples. */
const DRUPLETS: [number, number][] = [
  [48, 58], [62, 55], [74, 62], [44, 74], [58, 78], [72, 76], [52, 94], [68, 92],
]
