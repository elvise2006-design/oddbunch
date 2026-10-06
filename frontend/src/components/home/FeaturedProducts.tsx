/** Featured products carousel — a snap-scrolling rail with arrow controls. */

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { Container, Reveal, Section, SectionTitle } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/States'
import { useAsync } from '@/hooks/useAsync'
import { api, type Product } from '@/lib/api'
import { cx } from '@/lib/utils'

export function FeaturedProducts() {
  const { data, loading, error, reload } = useAsync<Product[]>(
    () => api.listProducts({ featured: true, sort: 'featured', limit: 8 }),
    [],
  )

  const railRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [canScroll, setCanScroll] = useState({ left: false, right: false })

  /** Recomputes arrow availability + the progress bar as the rail scrolls. */
  const syncScrollState = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const max = rail.scrollWidth - rail.clientWidth
    setProgress(max > 0 ? rail.scrollLeft / max : 0)
    setCanScroll({
      left: rail.scrollLeft > 8,
      right: rail.scrollLeft < max - 8,
    })
  }, [])

  useEffect(() => {
    syncScrollState()
    const rail = railRef.current
    if (!rail) return
    const observer = new ResizeObserver(syncScrollState)
    observer.observe(rail)
    window.addEventListener('resize', syncScrollState)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncScrollState)
    }
  }, [data, syncScrollState])

  function scrollBy(direction: 1 | -1) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * (rail.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <Section id="featured" aria-labelledby="featured-title" className="bg-cream-50">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionTitle
              align="left"
              eyebrow="This season"
              title={<span id="featured-title">Picked for right now</span>}
              lede="A rotating shelf across all three collections — the packs people keep coming back to."
            />
          </Reveal>

          {/* Rail controls */}
          {!loading && !error && (
            <Reveal delay={0.1} direction="up">
              <div className="flex items-center gap-3">
                <RailButton direction="left" disabled={!canScroll.left} onClick={() => scrollBy(-1)} />
                <RailButton direction="right" disabled={!canScroll.right} onClick={() => scrollBy(1)} />
              </div>
            </Reveal>
          )}
        </div>

        <div className="relative mt-10">
          {/* Mobile fade edges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-cream-50 to-transparent lg:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-cream-50 to-transparent lg:hidden"
          />

          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && <ErrorState message={error} onRetry={reload} className="mx-auto max-w-xl" />}

          <AnimatePresence mode="wait">
            {!loading && !error && data && data.length === 0 && (
              <EmptyState
                title="Nothing featured yet"
                message="Mark a product as featured in the database and it will appear here."
              />
            )}
          </AnimatePresence>

          {!loading && !error && data && data.length > 0 && (
            <div
              ref={railRef}
              onScroll={syncScrollState}
              className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
              role="region"
              aria-label="Featured products, scroll horizontally"
              tabIndex={0}
            >
              {data.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[calc((100%-3*1.25rem)/4)]"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    variant={
                      product.category === 'kids'
                        ? 'kids'
                        : product.category === 'collector'
                          ? 'collector'
                          : 'fresh'
                    }
                    badge={
                      product.category === 'collector'
                        ? (product.rarity ?? undefined)
                        : product.category === 'kids'
                          ? 'Seed inside'
                          : undefined
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {!loading && !error && data && data.length > 2 && (
            <div className="mt-4 hidden items-center gap-4 lg:flex">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-seed-200/70">
                <motion.div
                  className="h-full rounded-full bg-leaf-500"
                  style={{ width: `${Math.max(12, progress * 100)}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-xs font-medium text-seed-700/60 tabular-nums">
                {data.length} featured
              </span>
            </div>
          )}
        </div>

        {/* Category shortcut tiles */}
        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-seed-700/70">Browse the full range:</span>
            <RailLink to="/little-sprouts" emoji="🌱" label="Little Sprouts" />
            <RailLink to="/daily-fresh" emoji="🍎" label="Daily Fresh" />
            <RailLink to="/rare-collection" emoji="💀" label="The Rare Collection" />
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

function RailButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Scroll products left' : 'Scroll products right'}
      className={cx(
        'grid h-11 w-11 place-items-center rounded-full bg-white text-seed-800 shadow-soft ring-1 ring-seed-200',
        'transition-all hover:-translate-y-0.5 hover:bg-leaf-50 hover:text-leaf-700',
        'disabled:pointer-events-none disabled:opacity-35',
      )}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d={direction === 'left' ? 'M12 4L6 10l6 6' : 'M8 4l6 6-6 6'}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function RailLink({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-seed-800 shadow-soft ring-1 ring-seed-200 transition-all hover:-translate-y-0.5 hover:ring-leaf-300 hover:text-leaf-800"
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </Link>
  )
}
