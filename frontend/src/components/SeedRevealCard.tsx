/**
 * SeedRevealCard — the interactive "Peel & Reveal" demo.
 *
 * A tetra pack illustration with a peel-here sticker zone. Clicking (or dragging)
 * the sticker peels it back along an animated corner fold, revealing the real seed
 * and the fruit's growing guide underneath.
 */

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState } from 'react'

import { Leaf, Seed, Sprout } from '@/components/Illustrations'
import type { Product } from '@/lib/api'
import { cx, useReducedMotion } from '@/lib/utils'

interface SeedRevealCardProps {
  product: Product
  /** Rendered under the pack when revealed. */
  children?: React.ReactNode
  className?: string
}

/** Sticker origin for the peel fold, as a percentage of the pack face. */
const STICKER = { x: 50, y: 38, w: 62, h: 26 }

export function SeedRevealCard({ product, children, className }: SeedRevealCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()

  // Drag the sticker away from its corner to peel it.
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const springX = useSpring(dragX, { stiffness: 320, damping: 30 })
  const springY = useSpring(dragY, { stiffness: 320, damping: 30 })
  const start = useRef({ x: 0, y: 0 })

  function onDragStart() {
    start.current = { x: springX.get(), y: springY.get() }
  }

  function onDrag(_: unknown, info: { offset: { x: number; y: number } }) {
    dragX.set(start.current.x + info.offset.x)
    dragY.set(start.current.y + info.offset.y)
  }

  function onDragEnd() {
    // Past ~26% of the pack width in either direction, the sticker lets go.
    if (Math.abs(springX.get()) > 34 || Math.abs(springY.get()) > 26) {
      setRevealed(true)
    }
    dragX.set(0)
    dragY.set(0)
  }

  function peel() {
    setRevealed(true)
  }

  function reset() {
    setRevealed(false)
    dragX.set(0)
    dragY.set(0)
  }

  const guide = parseGuide(product.seed_grow_guide)

  return (
    <div
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-4xl bg-white p-5 shadow-soft ring-1 ring-sunny-300/60',
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        aria-hidden="true"
        className="absolute -top-14 -left-14 h-40 w-40 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: product.accent }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg leading-snug font-semibold text-balance text-seed-900">
            {product.name}
          </h3>
          <p className="mt-1 text-xs font-medium tracking-wide text-sunny-600 uppercase">
            {product.fruit_type} · seed sealed inside
          </p>
        </div>
        <button
          type="button"
          onClick={revealed ? reset : peel}
          className={cx(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            revealed
              ? 'bg-seed-100 text-seed-700 hover:bg-seed-200'
              : 'bg-sunny-400 text-seed-900 hover:bg-sunny-500',
          )}
          aria-label={revealed ? `Hide the seed on ${product.name}` : `Peel the sticker on ${product.name}`}
        >
          {revealed ? 'Cover it up' : 'Peel here'}
        </button>
      </div>

      {/* --- The pack --- */}
      <div className="relative mt-4 flex justify-center">
        <TetraPack
          product={product}
          revealed={revealed}
          stickerStyle={reduced ? undefined : { x: springX, y: springY }}
          onStickerClick={peel}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          hovered={hovered}
        />
      </div>

      {/* --- Revealed content --- */}
      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
          >
            <div className="mt-5 rounded-3xl bg-leaf-50 p-4 ring-1 ring-leaf-200">
              <div className="flex items-center gap-3">
                <motion.span
                  initial={{ scale: 0.4, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft"
                >
                  <Seed size={26} color="#7D5A3F" />
                </motion.span>
                <div>
                  <p className="font-display text-base font-semibold text-leaf-800">
                    There it is — a {product.fruit_type} seed
                  </p>
                  <p className="text-xs text-leaf-700/75">
                    Viable, dried, and ready for a pot.
                  </p>
                </div>
              </div>

              {guide && <GrowGuide guide={guide} fruitType={product.fruit_type} accent={product.accent} />}
              {children}
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mt-4 flex items-center justify-center gap-2 text-center text-xs text-seed-700/70"
          >
            <motion.span
              animate={reduced ? undefined : { y: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              👆
            </motion.span>
            Drag the sticker up and to the left, or tap "Peel here"
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tetra pack illustration
// ---------------------------------------------------------------------------

interface TetraPackProps {
  product: Product
  revealed: boolean
  stickerStyle?: { x: MotionValue<number>; y: MotionValue<number> }
  onStickerClick: () => void
  onDragStart: () => void
  onDrag: (event: unknown, info: { offset: { x: number; y: number } }) => void
  onDragEnd: () => void
  hovered: boolean
}

function TetraPack({
  product,
  revealed,
  stickerStyle,
  onStickerClick,
  onDragStart,
  onDrag,
  onDragEnd,
  hovered,
}: TetraPackProps) {
  const reduced = useReducedMotion()

  return (
    <div className="relative w-full max-w-[190px]">
      {/* Soft shadow beneath the pack */}
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 h-4 rounded-full bg-seed-900/12 blur-md"
      />

      <motion.svg
        viewBox="0 0 160 210"
        className="relative w-full drop-shadow-md"
        fill="none"
        role="img"
        aria-label={`${product.name} juice pack illustration`}
        animate={reduced || !hovered ? undefined : { rotateY: [-6, 6, -6], y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformPerspective: 700 }}
      >
        <defs>
          <linearGradient id={`pack-${product.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor={product.accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={product.accent} />
          </linearGradient>
          <clipPath id={`packclip-${product.id}`}>
            {/* Gable-top carton silhouette. */}
            <path d="M34 52h92a6 6 0 0 1 6 6v124a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V58a6 6 0 0 1 6-6Z" />
          </clipPath>
        </defs>

        {/* Carton body */}
        <path
          d="M34 52h92a6 6 0 0 1 6 6v124a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V58a6 6 0 0 1 6-6Z"
          fill={`url(#pack-${product.id})`}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
        />

        {/* Gable top with crimped seal */}
        <path d="M28 52 46 26h68l18 26H28Z" fill={product.accent} />
        <path d="M28 52h104" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
        <g clipPath={`url(#packclip-${product.id})`}>
          <rect x="28" y="52" width="104" height="7" fill="rgba(0,0,0,0.10)" />
          {/* Left specular highlight down the pack face */}
          <rect x="34" y="60" width="12" height="118" rx="6" fill="rgba(255,255,255,0.28)" />
          {/* Label band */}
          <rect x="28" y="104" width="104" height="46" fill="rgba(255,255,255,0.85)" />
          <text
            x="80"
            y="122"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#33251C"
            fontFamily="Fredoka, sans-serif"
          >
            {product.fruit_type.toUpperCase()}
          </text>
          <text x="80" y="140" textAnchor="middle" fontSize="9" fill="#5F4431" opacity="0.8">
            Seedling &amp; Vine
          </text>
        </g>

        {/* Straw */}
        <g transform="rotate(12 120 60)">
          <rect x="116" y="20" width="9" height="62" rx="4.5" fill="#F472B6" />
          <rect x="116" y="20" width="9" height="22" rx="4.5" fill="#EC4899" />
          <rect x="116" y="26" width="9" height="4" fill="rgba(255,255,255,0.55)" />
        </g>
      </motion.svg>

      {/* --- The peelable sticker, positioned over the pack face --- */}
      <AnimatePresence>
        {!revealed && (
          <motion.button
            type="button"
            key="sticker"
            onClick={onStickerClick}
            draggable={!reduced}
            drag
            dragElastic={0.85}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            style={{
              ...stickerStyle,
              left: `${STICKER.x}%`,
              top: `${STICKER.y}%`,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -32, opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            aria-label="Peel the sticker to reveal the hidden seed"
            className="absolute cursor-grab touch-none rounded-2xl bg-white/95 px-2 py-1.5 shadow-lift ring-2 ring-dashed ring-sunny-500/70 active:cursor-grabbing"
          >
            <span className="flex items-center gap-1.5 text-[10px] leading-tight font-bold tracking-wide text-sunny-600 uppercase">
              <Leaf size={13} color="#F7941D" />
              Peel here
            </span>
            {/* Corner fold cue */}
            <span
              aria-hidden="true"
              className="absolute right-0 bottom-0 h-4 w-4 rounded-tl-lg bg-sunny-300"
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Revealed seed sits exactly where the sticker was peeled from */}
      <AnimatePresence>
        {revealed && (
          <div
            className="pointer-events-none absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${STICKER.x}%`, top: `${STICKER.y}%` }}
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.12 }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-50 shadow-soft ring-1 ring-leaf-300"
            >
              <Seed size={26} animated color="#5F4431" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Growing guide
// ---------------------------------------------------------------------------

interface GrowGuide {
  title: string
  depth?: string
  sun?: string
  days?: string
  tips: string[]
}

/** Parses the backend's plain-text `seed_grow_guide` into labelled fields. */
function parseGuide(raw: string | null): GrowGuide | null {
  if (!raw) return null
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return null

  const guide: GrowGuide = { title: lines[0], tips: [] }

  for (const line of lines.slice(1)) {
    const [rawKey, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (!value) continue
    const key = rawKey.trim().toLowerCase()

    if (key.startsWith('soil')) guide.depth = value
    else if (key.startsWith('sunlight')) guide.sun = value
    else if (key.startsWith('sprouts')) guide.days = value
    else guide.tips.push(line)
  }

  return guide
}

function GrowGuide({ guide, fruitType, accent }: { guide: GrowGuide; fruitType: string; accent: string }) {
  const rows = [
    guide.depth && { label: 'Soil depth', value: guide.depth, emoji: '🪴' },
    guide.sun && { label: 'Sunlight', value: guide.sun, emoji: '☀️' },
    guide.days && { label: 'Time to sprout', value: guide.days, emoji: '⏱️' },
  ].filter(Boolean) as { label: string; value: string; emoji: string }[]

  return (
    <div className="mt-4">
      <p className="flex items-center gap-2 font-display text-sm font-semibold text-leaf-800">
        <Sprout size={22} animated />
        How to grow your {fruitType}
      </p>

      <dl className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + index * 0.07, duration: 0.35 }}
            className="flex gap-2.5 rounded-2xl bg-white/80 px-3 py-2"
          >
            <span aria-hidden="true" className="text-base leading-6">
              {row.emoji}
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] font-bold tracking-wide text-leaf-700 uppercase">
                {row.label}
              </dt>
              <dd className="text-[13px] leading-snug text-seed-800">{row.value}</dd>
            </div>
          </motion.div>
        ))}
      </dl>

      {guide.tips.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {guide.tips.map((tip, index) => (
            <motion.li
              key={tip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.06 }}
              className="flex gap-2 text-[13px] leading-snug text-leaf-900/80"
            >
              <span aria-hidden="true" className="mt-0.5 text-leaf-500">
                ✦
              </span>
              {tip}
            </motion.li>
          ))}
        </ul>
      )}

      <p
        className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: accent }}
      >
        <Seed size={12} /> Real horticultural guidance, not a guess
      </p>
    </div>
  )
}
