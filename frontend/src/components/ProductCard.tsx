/**
 * ProductCard — the workhorse card used on the home rail, Daily Fresh grid and
 * the Little Sprouts catalogue. Cards tilt in 3D and glow on hover.
 */

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

import { Leaf, Seed } from '@/components/Illustrations'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/lib/api'
import { cx, formatCAD, useReducedMotion } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  /** Visual variant. */
  variant?: 'default' | 'kids' | 'fresh' | 'collector'
  onAdd?: (product: Product, origin: { x: number; y: number }) => void
  /** Small label rendered in the top-right corner. */
  badge?: string
  className?: string
  index?: number
}

export function ProductCard({
  product,
  variant = 'default',
  onAdd,
  badge,
  className,
  index = 0,
}: ProductCardProps) {
  const reduced = useReducedMotion()
  const cardRef = useRef<HTMLButtonElement>(null)
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  // 3D tilt: spring-damped pointer position normalised to -0.5..0.5
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 220, damping: 20 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 220, damping: 20 })
  const glareX = useTransform(px, [-0.5, 0.5], ['18%', '82%'])
  // Hooks must stay unconditional, so the glare gradient is derived up here.
  const glareBackground = useTransform(
    glareX,
    (x) => `radial-gradient(420px circle at ${x} 0%, rgba(255,255,255,0.55), transparent 62%)`,
  )

  function onPointerMove(event: React.PointerEvent) {
    if (reduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function resetTilt() {
    px.set(0)
    py.set(0)
  }

  async function handleAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setAdding(true)
    try {
      const rect = event.currentTarget.getBoundingClientRect()
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      if (onAdd) {
        onAdd(product, origin)
      } else {
        await addItem(product, { origin })
      }
    } finally {
      window.setTimeout(() => setAdding(false), 700)
    }
  }

  const soldOut = product.category === 'collector' && product.stock < 1
  const lowStock = product.category === 'collector' && product.stock > 0 && product.stock <= 15

  return (
    <motion.article
      className={cx('group relative h-full', className)}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={cardRef as unknown as React.Ref<HTMLDivElement>}
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        className={cx(
          'relative flex h-full flex-col overflow-hidden rounded-4xl bg-white p-5',
          'shadow-soft ring-1 ring-seed-200/70 transition-shadow duration-300',
          'group-hover:shadow-lift focus-within:shadow-lift',
          variant === 'kids' && 'ring-sunny-300/70',
          variant === 'collector' && 'ring-gold-400/30',
        )}
      >
        {/* Accent wash keyed to the product colour */}
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-[0.16] blur-2xl transition-opacity duration-500 group-hover:opacity-30"
          style={{ backgroundColor: product.accent }}
        />

        {/* Pointer-following glare */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: glareBackground,
            }}
          />
        )}

        <div className="relative flex items-start justify-between gap-3">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl text-3xl shadow-inner"
            style={{ backgroundColor: `${product.accent}1F` }}
            aria-hidden="true"
          >
            {product.emoji}
          </span>

          {badge && (
            <span className="rounded-full bg-seed-900/85 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-cream-100 uppercase">
              {badge}
            </span>
          )}
        </div>

        <h3 className="relative mt-4 text-lg leading-snug font-semibold text-balance text-seed-900">
          {product.name}
        </h3>

        <p className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-pretty text-seed-700/75">
          {product.description}
        </p>

        {/* Category-specific metadata */}
        <div className="relative mt-3 flex flex-wrap items-center gap-2 text-xs">
          {product.box_size && <MetaChip>{product.box_size}</MetaChip>}
          {product.seed_grow_guide && (
            <MetaChip>
              <Seed size={12} /> Real seed inside
            </MetaChip>
          )}
          {product.category === 'collector' && product.edition_size && (
            <MetaChip>Edition of {product.edition_size}</MetaChip>
          )}
          {lowStock && (
            <span className="rounded-full bg-plum-800/10 px-2.5 py-1 font-semibold text-plum-800">
              Only {product.stock} left
            </span>
          )}
        </div>

        <div className="relative mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="block text-xs text-seed-700/60">CAD</span>
            <span className="font-display text-2xl leading-none font-semibold text-seed-900">
              {formatCAD(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || adding}
            aria-label={
              soldOut
                ? `${product.name} is sold out`
                : `Add ${product.name} to cart, ${formatCAD(product.price)}`
            }
            className={cx(
              'relative inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold',
              'transition-all duration-200 focus-visible:outline-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-45',
              variant === 'collector'
                ? 'bg-gradient-to-br from-plum-800 to-plum-950 text-gold-300 hover:from-plum-700 hover:to-plum-900'
                : variant === 'kids'
                  ? 'bg-sunny-400 text-seed-900 hover:bg-sunny-500'
                  : 'bg-leaf-600 text-white hover:bg-leaf-700',
              !soldOut && 'hover:-translate-y-0.5 active:translate-y-0',
            )}
          >
            {soldOut ? 'Sold out' : adding ? 'Added ✓' : 'Add'}
            {!soldOut && !adding && <Leaf size={14} />}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-seed-100 px-2.5 py-1 font-medium text-seed-700">
      {children}
    </span>
  )
}

/** Placeholder card shown while the catalogue loads. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-4xl bg-white p-5 shadow-soft ring-1 ring-seed-200/60">
      <div className="h-14 w-14 animate-pulse rounded-2xl bg-seed-100" />
      <div className="mt-4 h-5 w-3/4 animate-pulse rounded-full bg-seed-100" />
      <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-seed-100" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded-full bg-seed-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 animate-pulse rounded-full bg-seed-100" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-seed-100" />
      </div>
      <div className="mt-auto flex items-end justify-between pt-5">
        <div className="h-7 w-20 animate-pulse rounded-full bg-seed-100" />
        <div className="h-10 w-20 animate-pulse rounded-full bg-seed-100" />
      </div>
    </div>
  )
}
