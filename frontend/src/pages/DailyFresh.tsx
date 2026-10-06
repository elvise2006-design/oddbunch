/** Daily Fresh — clean, ordinary fruit juice and fruit boxes. No gimmicks. */

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { ProductCard } from '@/components/ProductCard'
import { WaveDivider } from '@/components/Illustrations'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/States'
import { Container, Reveal, Section } from '@/components/ui'
import { useAsync, useDebounced } from '@/hooks/useAsync'
import { useCart } from '@/hooks/useCart'
import { api, type Product, type SortOption, type SubscriptionCadence } from '@/lib/api'
import { cx, formatCAD } from '@/lib/utils'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'newest', label: 'Newest arrivals' },
]

const PRICE_BANDS = [
  { id: 'all', label: 'Any price', min: undefined, max: undefined },
  { id: 'under10', label: 'Under $10', min: undefined, max: 10 },
  { id: '10to50', label: '$10 – $50', min: 10, max: 50 },
  { id: 'over50', label: 'Over $50', min: 50, max: undefined },
]

export default function DailyFresh() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search, 320)
  const [fruitType, setFruitType] = useState<string | null>(null)
  const [priceBand, setPriceBand] = useState('all')
  const [sort, setSort] = useState<SortOption>('featured')

  const band = PRICE_BANDS.find((b) => b.id === priceBand) ?? PRICE_BANDS[0]

  const { data, loading, error, reload } = useAsync<Product[]>(
    () =>
      api.listProducts({
        category: 'normal',
        search: debouncedSearch || undefined,
        fruit_type: fruitType ?? undefined,
        min_price: band.min,
        max_price: band.max,
        sort,
      }),
    [debouncedSearch, fruitType, priceBand, sort],
  )

  // Fruit chips come from the whole catalogue, but only normal products are useful here.
  const { data: allProducts } = useAsync<Product[]>(() => api.listProducts({ category: 'normal' }), [])
  const fruitTypes = useMemo(
    () => Array.from(new Set((allProducts ?? []).map((p) => p.fruit_type))).sort(),
    [allProducts],
  )

  const { addItem } = useCart()
  const [subscription, setSubscription] = useState<SubscriptionCadence>('weekly')

  const activeFilters =
    (debouncedSearch ? 1 : 0) + (fruitType ? 1 : 0) + (priceBand !== 'all' ? 1 : 0)

  function clearFilters() {
    setSearch('')
    setFruitType(null)
    setPriceBand('all')
  }

  return (
    <>
      <PageHeader />

      <Section className="bg-cream-100">
        <Container>
          {/* --- Filter bar --- */}
          <Reveal>
            <div className="rounded-5xl bg-white p-5 shadow-soft ring-1 ring-seed-200/70 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                {/* Search */}
                <div>
                  <label htmlFor="df-search" className="mb-1.5 block text-sm font-semibold text-seed-800">
                    Search
                  </label>
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-seed-700/40"
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                      <path d="m14 14 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      id="df-search"
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Orange, fruit box, cold-pressed…"
                      className="w-full rounded-2xl bg-cream-50 py-3 pr-10 pl-11 text-seed-900 ring-1 ring-seed-200 transition-shadow placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-seed-700/50 hover:bg-seed-100 hover:text-seed-900"
                      >
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label htmlFor="df-sort" className="mb-1.5 block text-sm font-semibold text-seed-800">
                    Sort by
                  </label>
                  <select
                    id="df-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOption)}
                    className="w-full cursor-pointer rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chips */}
              <div className="mt-5 flex flex-col gap-4 border-t border-seed-200/70 pt-5">
                <fieldset>
                  <legend className="mb-2 text-xs font-bold tracking-[0.14em] text-seed-700/60 uppercase">
                    Fruit type
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={fruitType === null} onClick={() => setFruitType(null)}>
                      All fruit
                    </FilterChip>
                    {fruitTypes.map((fruit) => (
                      <FilterChip
                        key={fruit}
                        active={fruitType === fruit}
                        onClick={() => setFruitType(fruitType === fruit ? null : fruit)}
                      >
                        {capitalize(fruit)}
                      </FilterChip>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-xs font-bold tracking-[0.14em] text-seed-700/60 uppercase">
                    Price
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_BANDS.map((option) => (
                      <FilterChip
                        key={option.id}
                        active={priceBand === option.id}
                        onClick={() => setPriceBand(option.id)}
                      >
                        {option.label}
                      </FilterChip>
                    ))}
                  </div>
                </fieldset>

                {activeFilters > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-seed-700/65">
                      {activeFilters} {activeFilters === 1 ? 'filter' : 'filters'} active
                    </span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-semibold text-leaf-700 underline underline-offset-4 hover:text-leaf-800"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* --- Result meta --- */}
          <div className="mt-8 flex items-baseline justify-between gap-4">
            <p className="text-sm text-seed-700/70" aria-live="polite">
              {loading
                ? 'Loading…'
                : `${data?.length ?? 0} ${data?.length === 1 ? 'product' : 'products'}`}
            </p>
          </div>

          {/* --- Grid --- */}
          <div className="mt-5">
            {loading && <CardGridSkeleton count={6} />}

            {error && <ErrorState message={error} onRetry={reload} className="mx-auto max-w-xl" />}

            {!loading && !error && (data?.length ?? 0) === 0 && (
              <EmptyState
                emoji="🍋"
                title="Nothing matches those filters"
                message="Try widening the price band or clearing the fruit type."
                action={
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 rounded-full bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700"
                  >
                    Clear filters
                  </button>
                }
              />
            )}

            <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {data?.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard
                      product={product}
                      index={index}
                      variant="fresh"
                      badge={product.box_size ?? undefined}
                      onAdd={(p, origin) => {
                        void addItem(p, { origin, quantity: 1 })
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* --- Subscription upsell --- */}
          <Reveal delay={0.1}>
            <SubscriptionPanel
              cadence={subscription}
              onChange={setSubscription}
              products={allProducts ?? []}
            />
          </Reveal>
        </Container>
      </Section>
    </>
  )
}

// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-cream-50 to-cream-100 pt-28 pb-14 sm:pt-36 lg:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-leaf-200/50 blur-3xl"
      />
      <Container className="relative">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-leaf-700 uppercase ring-1 ring-leaf-200 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-leaf-500" aria-hidden="true" />
            Every day, no ceremony
          </span>

          <h1 className="mt-6 text-balance text-4xl leading-[1.05] font-semibold text-seed-900 sm:text-5xl lg:text-6xl">
            Daily Fresh
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-seed-700/85">
            Straightforward fruit juice and fruit boxes. No seed under the lid, no sculpted glass —
            just honest, not-from-concentrate juice and a box of whatever is best that week.
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-seed-700/70">
            {['No added sugar', 'Pressed in Ontario', 'Ships in 1–2 days', 'Subscribe & save 10%'].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-leaf-500" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </Container>

      <div className="mt-10">
        <WaveDivider fill="#FAF6EA" />
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-leaf-600 text-white shadow-soft'
          : 'bg-cream-50 text-seed-800 ring-1 ring-seed-200 hover:bg-leaf-50 hover:text-leaf-800',
      )}
    >
      {children}
    </button>
  )
}

/** Weekly / bi-weekly subscription upsell that feeds into the cart. */
function SubscriptionPanel({
  cadence,
  onChange,
  products,
}: {
  cadence: SubscriptionCadence
  onChange: (value: SubscriptionCadence) => void
  products: Product[]
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const plans = [
    {
      cadence: 'weekly' as const,
      slug: 'weekly-fruit-box',
      title: 'Weekly box',
      detail: 'Six seasonal fruits, every Thursday',
      price: 42,
      saving: 'Save $4.20 / week',
    },
    {
      cadence: 'bi-weekly' as const,
      slug: 'family-fruit-box',
      title: 'Every two weeks',
      detail: 'Twelve fruits plus a recipe card',
      price: 74,
      saving: 'Save $7.40 / box',
    },
  ].filter((plan) => products.some((product) => product.slug === plan.slug))

  return (
    <div className="mt-16 overflow-hidden rounded-5xl bg-leaf-900 p-7 text-cream-100 shadow-lift sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] uppercase">
            Subscribe
          </span>
          <h2 className="mt-4 text-balance text-2xl leading-tight font-semibold text-cream-50 sm:text-3xl">
            Never run out of the good stuff
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-cream-200/80">
            Pick a rhythm, pick your box, and stop thinking about groceries. Skip, pause, or cancel
            from any email — we do not make you phone a human.
          </p>

          <label className="mt-7 flex items-center gap-2.5 text-sm font-medium">
            <span className="text-cream-200/75">Your cadence</span>
            <select
              value={cadence}
              onChange={(event) => onChange(event.target.value as SubscriptionCadence)}
              className="cursor-pointer rounded-full bg-white/12 px-4 py-2 text-cream-50 ring-1 ring-white/20 focus:ring-2 focus:ring-leaf-300 focus:outline-none"
            >
              <option value="weekly" className="text-seed-900">
                Every week
              </option>
              <option value="bi-weekly" className="text-seed-900">
                Every two weeks
              </option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <motion.div
              key={plan.cadence}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={cx(
                'flex flex-col rounded-4xl p-5 ring-1 transition-colors',
                cadence === plan.cadence
                  ? 'bg-leaf-700/60 ring-leaf-400/50'
                  : 'bg-white/8 ring-white/12 hover:bg-white/12',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-cream-50">{plan.title}</h3>
                {cadence === plan.cadence && (
                  <span className="rounded-full bg-sunny-400 px-2.5 py-1 text-[10px] font-bold tracking-wide text-seed-900 uppercase">
                    Selected
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm text-cream-200/75">{plan.detail}</p>

              <p className="mt-4">
                <span className="font-display text-2xl font-semibold text-cream-50">
                  {formatCAD(plan.price)}
                </span>
                <span className="ml-1 text-sm text-cream-200/60">/ delivery</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-leaf-200">{plan.saving}</p>

              <button
                type="button"
                onClick={async (clickEvent) => {
                  const product = products.find((p) => p.slug === plan.slug)
                  if (!product) return
                  const rect = clickEvent.currentTarget.getBoundingClientRect()
                  await addItem(product, {
                    isSubscription: true,
                    cadence: plan.cadence,
                    origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
                  })
                  setAdded(plan.cadence)
                  window.setTimeout(() => setAdded(null), 2200)
                }}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-leaf-300 px-5 py-3 text-sm font-semibold text-leaf-950 transition-colors hover:bg-leaf-200"
              >
                {added === plan.cadence ? 'Added ✓' : 'Start this plan'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
