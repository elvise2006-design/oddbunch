/** The Rare Collection — premium dark theme, collector's shelf, wishlist. */

import { motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'

import { SculptedBottle } from '@/components/SculptedBottle'
import { SculptedBottleCard, SculptedBottleCardSkeleton } from '@/components/SculptedBottleCard'
import { EmptyState, ErrorState } from '@/components/States'
import { Container, Reveal, Section } from '@/components/ui'
import { BOTTLE_SHAPES } from '@/data/site'
import { useAsync } from '@/hooks/useAsync'
import { useCart } from '@/hooks/useCart'
import { api, type BottleShape, type Product, type WishlistEntry } from '@/lib/api'
import { cx, formatCAD } from '@/lib/utils'

type RarityFilter = 'All' | 'Common' | 'Rare' | 'Legendary'

export default function RareCollection() {
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('All')

  const { data, loading, error, reload } = useAsync<Product[]>(
    () => api.listProducts({ category: 'collector', sort: 'rarity' }),
    [],
  )

  const wishlist = useAsync<WishlistEntry[]>(() => api.getWishlist(), [])
  const [wishOverrides, setWishOverrides] = useState<Record<number, boolean>>({})

  const wishedIds = useMemo(() => {
    const ids = new Set((wishlist.data ?? []).map((entry) => entry.product_id))
    // Local toggles take precedence over the server list until the next fetch.
    for (const [id, wished] of Object.entries(wishOverrides)) {
      if (wished) ids.add(Number(id))
      else ids.delete(Number(id))
    }
    return ids
  }, [wishlist.data, wishOverrides])

  const handleWishlistChange = useCallback((productId: number, wished: boolean) => {
    setWishOverrides((current) => ({ ...current, [productId]: wished }))
  }, [])

  const products = useMemo(() => {
    if (!data) return []
    if (rarityFilter === 'All') return data
    return data.filter((product) => product.rarity === rarityFilter)
  }, [data, rarityFilter])

  const collectionValue = (data ?? []).reduce((sum, product) => sum + product.price, 0)
  const editionCounts = useMemo(() => {
    const counts: Record<string, number> = { Common: 0, Rare: 0, Legendary: 0 }
    for (const product of data ?? []) {
      if (product.rarity) counts[product.rarity] = (counts[product.rarity] ?? 0) + 1
    }
    return counts
  }, [data])

  return (
    <div data-theme="dark" className="bg-plum-950">
      <HeroBanner products={data ?? []} />

      {/* --- The collection grid --- */}
      <Section aria-labelledby="collection-title" className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,33,87,0.35),transparent_60%)]"
        />

        <Container className="relative">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-gold-300 uppercase ring-1 ring-white/12">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                  The full run
                </span>
                <h2
                  id="collection-title"
                  className="mt-4 text-balance text-3xl leading-tight font-semibold text-cream-50 sm:text-4xl"
                >
                  Six shapes, and no more coming
                </h2>
                <p className="mt-3 max-w-xl text-pretty leading-relaxed text-cream-200/70">
                  Each mould is retired when its edition sells out. No reissues, no restocks — the
                  shelf gets rarer whether you buy from it or not.
                </p>
              </div>
            </Reveal>

            {/* Rarity filter */}
            <Reveal delay={0.1}>
              <div
                role="group"
                aria-label="Filter by rarity"
                className="flex flex-wrap gap-2 rounded-full bg-white/6 p-1.5 ring-1 ring-white/10"
              >
                {(['All', 'Common', 'Rare', 'Legendary'] as RarityFilter[]).map((option) => {
                  const count = option === 'All' ? (data?.length ?? 0) : editionCounts[option] ?? 0
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRarityFilter(option)}
                      aria-pressed={rarityFilter === option}
                      className={cx(
                        'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                        rarityFilter === option
                          ? 'bg-gradient-to-r from-gold-400 to-gold-300 text-plum-950'
                          : 'text-cream-200/70 hover:bg-white/8 hover:text-cream-50',
                      )}
                    >
                      {option}
                      <span className="ml-1.5 text-xs opacity-60 tabular-nums">{count}</span>
                    </button>
                  )
                })}
              </div>
            </Reveal>
          </div>

          <div className="mt-12">
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <SculptedBottleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && products.length === 0 && (
              <EmptyState
                emoji="🍾"
                title="No bottles at this rarity"
                message="Try a different filter to see the rest of the run."
              />
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <SculptedBottleCard
                  key={product.id}
                  product={product}
                  index={index}
                  wished={wishedIds.has(product.id)}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>
          </div>

          {/* --- Collector's shelf --- */}
          <Reveal delay={0.15}>
            <CollectorShelf
              products={data ?? []}
              wishlist={wishlist.data ?? []}
              loading={wishlist.loading}
              error={wishlist.error}
              onRetry={wishlist.reload}
              collectionValue={collectionValue}
            />
          </Reveal>

          {/* --- The moulding process --- */}
          <Reveal delay={0.2}>
            <ProcessNote />
          </Reveal>
        </Container>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------

function HeroBanner({ products }: { products: Product[] }) {
  const hero = products.find((product) => product.slug === 'skull-edition-grape-elixir') ?? products[0]
  const legendaries = products.filter((product) => product.rarity === 'Legendary').length
  const totalEdition = products.reduce((sum, product) => sum + (product.edition_size ?? 0), 0)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-plum-900 via-plum-950 to-plum-950 pt-28 pb-20 sm:pt-36 lg:pt-44">
      {/* Starfield-ish specks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold-300"
            style={{
              left: `${(i * 53.7) % 97}%`,
              top: `${(i * 31.3) % 92}%`,
              width: 1 + ((i * 3) % 3),
              height: 1 + ((i * 3) % 3),
            }}
            animate={{ opacity: [0.15, 0.85, 0.15] }}
            transition={{
              duration: 2.5 + (i % 5),
              delay: i * 0.22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-plum-700/30 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gold-400/12 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase ring-1 ring-gold-400/35"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" aria-hidden="true" />
              Edition of {totalEdition || 4_000} bottles, ever
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mt-6 text-balance text-4xl leading-[1.04] font-semibold text-cream-50 sm:text-6xl"
            >
              The Rare
              <br />
              <span className="shimmer-text">Collection</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-cream-200/75"
            >
              Fruit juice poured into glass moulded into the fruit itself. A skull. An apple. A
              spiked dragon fruit. Each bottle is a small sculpture that happens to be{' '}
              {hero?.rarity === 'Legendary' ? '18% ABV' : 'beverage-grade'} — and when the edition
              closes, it does not come back.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-9 flex flex-wrap gap-x-10 gap-y-5"
            >
              {[
                { value: products.length, label: 'sculpts in the run' },
                { value: legendaries, label: 'legendary editions' },
                { value: '0', label: 'planned reissues' },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block font-display text-3xl leading-none font-semibold text-gold-300 tabular-nums">
                    {stat.value}
                  </span>
                  <span className="mt-1.5 block text-sm text-cream-200/60">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.a
              href="#collection-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-300 px-7 py-3.5 text-base font-semibold text-plum-950 shadow-[0_16px_44px_-16px_rgba(212,164,55,0.85)] transition-all hover:-translate-y-0.5"
            >
              View the collection
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </motion.a>
          </div>

          {/* Hero bottle */}
          {hero && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex flex-col items-center"
            >
              <div
                aria-hidden="true"
                className="absolute h-80 w-80 rounded-full opacity-50 blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${BOTTLE_SHAPES[(hero.bottle_shape ?? 'skull') as BottleShape].liquid}, transparent 68%)`,
                }}
              />
              <SculptedBottle
                shape={(hero.bottle_shape ?? 'skull') as BottleShape}
                size={280}
                animated
                className="relative"
              />
              <p className="relative mt-4 text-center text-xs font-bold tracking-[0.2em] text-gold-300/70 uppercase">
                {hero.rarity} &middot; {hero.edition_size} bottles
              </p>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  )
}

// ---------------------------------------------------------------------------

function CollectorShelf({
  products,
  wishlist,
  loading,
  error,
  onRetry,
  collectionValue,
}: {
  products: Product[]
  wishlist: WishlistEntry[]
  loading: boolean
  error: string | null
  onRetry: () => void
  collectionValue: number
}) {
  const { itemCount } = useCart()
  const [ownedSlugs, setOwnedSlugs] = useState<string[]>(['apple-classic-cider-rose', 'pear-teardrop-saison'])

  const owned = products.filter((product) => ownedSlugs.includes(product.slug))
  const wishlisted = wishlist.filter((entry) => entry.product?.category === 'collector')

  function toggleOwned(slug: string) {
    setOwnedSlugs((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    )
  }

  return (
    <div className="mt-20 rounded-5xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-cream-200/80 uppercase ring-1 ring-white/12">
            Your shelf
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
            Collector profile
          </h2>
          <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-cream-200/70">
            A demo shelf. Tap a bottle to add or remove it from your collection, and mark bottles you
            are hunting for with the heart.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="rounded-2xl bg-white/6 px-5 py-3 text-center ring-1 ring-white/10">
            <span className="block text-[11px] font-bold tracking-wide text-cream-200/55 uppercase">
              Owned
            </span>
            <span className="font-display text-2xl leading-none font-semibold text-gold-300 tabular-nums">
              {owned.length}
            </span>
          </div>
          <div className="rounded-2xl bg-white/6 px-5 py-3 text-center ring-1 ring-white/10">
            <span className="block text-[11px] font-bold tracking-wide text-cream-200/55 uppercase">
              Shelf value
            </span>
            <span className="font-display text-2xl leading-none font-semibold text-gold-300 tabular-nums">
              {formatCAD(owned.reduce((sum, p) => sum + p.price, 0) || collectionValue * 0.4)}
            </span>
          </div>
          <div className="rounded-2xl bg-white/6 px-5 py-3 text-center ring-1 ring-white/10">
            <span className="block text-[11px] font-bold tracking-wide text-cream-200/55 uppercase">
              In cart
            </span>
            <span className="font-display text-2xl leading-none font-semibold text-gold-300 tabular-nums">
              {itemCount}
            </span>
          </div>
        </div>
      </div>

      {/* Shelf grid */}
      <div className="mt-8">
        {loading && (
          <div role="status" aria-live="polite" className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            <span className="sr-only">Loading your shelf</span>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-white/6" />
            ))}
          </div>
        )}

        {error && <ErrorState message={error} onRetry={onRetry} />}

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {products.map((product) => {
              const isOwned = ownedSlugs.includes(product.slug)
              const shape = (product.bottle_shape ?? 'apple') as BottleShape
              return (
                <motion.button
                  key={product.id}
                  type="button"
                  onClick={() => toggleOwned(product.slug)}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={isOwned}
                  aria-label={`${isOwned ? 'Remove' : 'Add'} ${product.name} ${isOwned ? 'from' : 'to'} your collection`}
                  className={cx(
                    'group relative flex flex-col items-center gap-2 rounded-3xl p-3 transition-colors',
                    isOwned
                      ? 'bg-gold-400/12 ring-1 ring-gold-400/45'
                      : 'bg-white/[0.03] ring-1 ring-white/8 hover:bg-white/8',
                  )}
                >
                  {/* Shelf plank */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 rounded-b-3xl bg-white/10"
                  />

                  <SculptedBottle shape={shape} size={78} animated={false} />

                  <span className="mt-1 text-center text-[10px] leading-tight font-semibold text-cream-200/75">
                    {BOTTLE_SHAPES[shape].label}
                  </span>

                  {isOwned && (
                    <motion.span
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                      className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold-400 text-[11px] text-plum-950"
                      aria-hidden="true"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Wishlist */}
      <div className="mt-10 border-t border-white/10 pt-8">
        <h3 className="font-display text-lg font-semibold text-cream-50">On the hunt</h3>
        <p className="mt-1 text-sm text-cream-200/65">
          Bottles you have hearted. Saved to the backend, so it survives a refresh.
        </p>

        {wishlisted.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-white/[0.03] px-5 py-4 text-sm text-cream-200/60 ring-1 ring-white/8">
            Nothing on the hunt list yet — tap a heart on any bottle above.
          </p>
        ) : (
          <ul className="mt-5 flex flex-wrap gap-3">
            {wishlisted.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2.5 rounded-full bg-white/8 py-2 pr-4 pl-2.5 text-sm text-cream-100 ring-1 ring-white/12"
              >
                <SculptedBottle
                  shape={(entry.product.bottle_shape ?? 'apple') as BottleShape}
                  size={28}
                  animated={false}
                />
                <span className="font-medium">{entry.product.name}</span>
                <span className="text-xs text-gold-300/70">{formatCAD(entry.product.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function ProcessNote() {
  return (
    <div className="mt-20 grid gap-6 sm:grid-cols-3">
      {[
        {
          title: 'Designed first',
          body: 'Every sculpt starts as a clay model and a 3D print. We make roughly forty before one survives the taste test.',
          emoji: '🖌️',
        },
        {
          title: 'Moulded in small runs',
          body: 'Glass is poured in batches of a few hundred. A shape that breaks gets retooled; a shape that survives gets retired when it sells out.',
          emoji: '🔥',
        },
        {
          title: 'Filled and numbered',
          body: 'Each bottle is filled by hand, corked, and given a sequential number with the edition size on the base.',
          emoji: '✍️',
        },
      ].map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: index * 0.1 }}
          className="rounded-4xl border border-white/10 bg-white/[0.03] p-6"
        >
          <span className="text-3xl" aria-hidden="true">
            {item.emoji}
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold text-cream-50">{item.title}</h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-cream-200/70">{item.body}</p>
        </motion.div>
      ))}
    </div>
  )
}
