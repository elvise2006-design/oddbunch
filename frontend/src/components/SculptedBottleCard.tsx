/** SculptedBottleCard — the premium collector product card. */

import { motion } from 'framer-motion'
import { useState } from 'react'

import { SculptedBottle } from '@/components/SculptedBottle'
import { useCart } from '@/hooks/useCart'
import { api, SESSION_ID, type Product } from '@/lib/api'
import { BOTTLE_SHAPES } from '@/data/site'
import { cx, formatCAD, useReducedMotion } from '@/lib/utils'

const RARITY_STYLES: Record<string, { chip: string; glow: string; label: string }> = {
  Common: {
    chip: 'bg-white/10 text-cream-200 ring-white/20',
    glow: 'hover:shadow-[0_24px_70px_-24px_rgba(212,164,55,0.5)]',
    label: 'Common',
  },
  Rare: {
    chip: 'bg-sunny-400/20 text-sunny-300 ring-sunny-400/45',
    glow: 'hover:shadow-[0_24px_70px_-22px_rgba(247,148,29,0.7)]',
    label: 'Rare',
  },
  Legendary: {
    chip: 'bg-gold-400/20 text-gold-300 ring-gold-400/50',
    glow: 'hover:shadow-[0_24px_80px_-20px_rgba(212,164,55,0.95)]',
    label: 'Legendary',
  },
}

interface SculptedBottleCardProps {
  product: Product
  index?: number
  /** Whether this bottle is already on the collector's wishlist. */
  wished?: boolean
  onWishlistChange?: (productId: number, wished: boolean) => void
}

export function SculptedBottleCard({
  product,
  index = 0,
  wished = false,
  onWishlistChange,
}: SculptedBottleCardProps) {
  const reduced = useReducedMotion()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [wishBusy, setWishBusy] = useState(false)

  const shape = (product.bottle_shape ?? 'apple') as keyof typeof BOTTLE_SHAPES
  const rarity = RARITY_STYLES[product.rarity ?? 'Common'] ?? RARITY_STYLES.Common
  const shapeDef = BOTTLE_SHAPES[shape]
  const soldOut = product.stock < 1
  const lowStock = !soldOut && product.stock <= 15
  const remainingPct = product.edition_size
    ? Math.max(0, Math.min(100, (product.stock / product.edition_size) * 100))
    : 100

  async function handleAdd(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    setAdded(true)
    try {
      await addItem(product, {
        origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      })
      window.setTimeout(() => setAdded(false), 2000)
    } catch {
      setAdded(false)
    }
  }

  async function toggleWishlist() {
    setWishBusy(true)
    try {
      if (wished) {
        await api.removeWishlist(product.id, SESSION_ID)
      } else {
        await api.addWishlist(product.id, SESSION_ID)
      }
      onWishlistChange?.(product.id, !wished)
    } catch {
      // Leave the heart unchanged on failure; the wishlist refetches on reload.
    } finally {
      setWishBusy(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.09, 0.45), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-5xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-sm',
        'transition-shadow duration-300',
        rarity.glow,
      )}
    >
      {/* Holographic sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(115deg, transparent 25%, rgba(243,217,139,0.16) 44%, rgba(255,255,255,0.26) 50%, rgba(243,217,139,0.16) 56%, transparent 75%)',
          backgroundSize: '220% 100%',
          animation: 'shimmer 1.9s linear infinite',
        }}
      />
      {/* Fine foil lines */}
      <span aria-hidden="true" className="foil pointer-events-none absolute inset-0 opacity-30" />

      {/* Rarity + wishlist row */}
      <div className="relative z-10 flex items-start justify-between gap-3 p-5 pb-0">
        <span
          className={cx(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase ring-1',
            rarity.chip,
          )}
        >
          <span
            aria-hidden="true"
            className={cx(
              'h-1.5 w-1.5 rounded-full',
              product.rarity === 'Legendary'
                ? 'bg-gold-300'
                : product.rarity === 'Rare'
                  ? 'bg-sunny-300'
                  : 'bg-cream-200/70',
            )}
          />
          {rarity.label}
        </span>

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishBusy}
          aria-pressed={wished}
          aria-label={
            wished
              ? `Remove ${product.name} from your wishlist`
              : `Add ${product.name} to your wishlist`
          }
          className={cx(
            'grid h-9 w-9 place-items-center rounded-full transition-all duration-200',
            wished
              ? 'bg-gold-400/25 text-gold-300 ring-1 ring-gold-400/50'
              : 'bg-white/8 text-cream-200/70 ring-1 ring-white/15 hover:bg-white/15 hover:text-cream-100',
          )}
        >
          <motion.svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={wished ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            animate={wished ? { scale: [1, 1.3, 1] } : undefined}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          >
            <path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 5.8-8.5 11.3-8.5 11.3Z" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </div>

      {/* --- The bottle --- */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-6">
        {/* Radial pedestal glow behind the bottle */}
        <div
          aria-hidden="true"
          className="absolute h-56 w-56 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
          style={{ background: `radial-gradient(circle, ${shapeDef.liquid}, transparent 68%)` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-8 bottom-3 h-1.5 rounded-full bg-black/50 blur-md"
        />
        <SculptedBottle shape={shape} size={190} animated={!reduced} className="relative" />
      </div>

      {/* --- Details --- */}
      <div className="relative z-10 border-t border-white/10 p-5">
        <p className="text-[11px] font-bold tracking-[0.16em] text-gold-300/70 uppercase">
          {shapeDef.label} sculpt
          {product.edition_size ? ` · edition of ${product.edition_size}` : ''}
        </p>

        <h3 className="mt-2 font-display text-xl leading-snug font-semibold text-balance text-cream-50">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-pretty text-cream-200/70">
          {product.description}
        </p>

        {/* Stock counter */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-cream-200/65">
              {soldOut ? 'Edition closed' : `${product.stock} remaining`}
            </span>
            {lowStock && !soldOut && (
              <span className="font-semibold text-sunny-300">Almost gone</span>
            )}
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={cx(
                'h-full rounded-full',
                remainingPct > 40 ? 'bg-leaf-400' : remainingPct > 15 ? 'bg-sunny-400' : 'bg-red-400',
              )}
              initial={{ width: 0 }}
              whileInView={{ width: `${remainingPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <span className="block text-[11px] tracking-wide text-cream-200/50 uppercase">CAD</span>
            <span className="font-display text-2xl leading-none font-semibold text-gold-300">
              {formatCAD(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={
              soldOut
                ? `${product.name} is sold out`
                : `Add ${product.name} to your collection, ${formatCAD(product.price)}`
            }
            className={cx(
              'relative overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-45',
              soldOut
                ? 'bg-white/10 text-cream-200/60'
                : 'bg-gradient-to-r from-gold-400 to-gold-300 text-plum-950 hover:from-gold-300 hover:to-gold-400 hover:shadow-[0_10px_30px_-8px_rgba(212,164,55,0.8)]',
            )}
          >
            {soldOut ? 'Sold out' : added ? 'In your collection ✓' : 'Add to collection'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

/** Skeleton matching the collector card's footprint. */
export function SculptedBottleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-5xl border border-white/10 bg-white/[0.04]">
      <div className="flex items-start justify-between p-5">
        <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="flex h-[15rem] items-center justify-center">
        <div className="h-40 w-28 animate-pulse rounded-4xl bg-white/[0.06]" />
      </div>
      <div className="border-t border-white/10 p-5">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-1.5 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 flex items-end justify-between">
          <div className="h-7 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-11 w-36 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}
