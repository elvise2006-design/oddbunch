/** Impact stats with animated counters + a live "recently planted" ticker. */

import { motion } from 'framer-motion'

import { Leaf, Seed, Sprout } from '@/components/Illustrations'
import { AnimatedCounter, Container, Reveal, Section, SectionTitle } from '@/components/ui'
import { ErrorState, Skeleton } from '@/components/States'
import { useAsync } from '@/hooks/useAsync'
import { api, type ImpactStats, type JournalEntry } from '@/lib/api'
import { formatNumber } from '@/lib/utils'

export function ImpactStats() {
  const stats = useAsync<ImpactStats>(() => api.getStats(), [])
  const recent = useAsync<JournalEntry[]>(() => api.recentPlantings(6), [])

  return (
    <Section
      id="impact"
      aria-labelledby="impact-title"
      className="relative overflow-hidden bg-seed-900 text-cream-100"
    >
      {/* Botanical texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-leaf-700/25 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-sunny-600/15 blur-3xl" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Leaf
            key={i}
            size={80 + i * 14}
            animated
            flip={i % 2 === 0}
            className="absolute opacity-[0.07]"
            color="#C3E5C0"
          />
        ))}
      </div>

      <Container className="relative">
        <Reveal>
          <SectionTitle
            eyebrow="Our tally"
            title={<span id="impact-title">What the seeds are doing</span>}
            lede="Every number here is the sum of real stickers peeled, real pots filled, and real shelves started."
            accent="#E9C46A"
          />
        </Reveal>

        {/* Counters */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.loading &&
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-4xl bg-cream-100/10" />
            ))}

          {stats.error && (
            <div className="lg:col-span-4">
              <ErrorState
                message={`${stats.error} The counters need the stats endpoint, so they stay empty until it is back.`}
                onRetry={stats.reload}
              />
            </div>
          )}

          {stats.data && (
            <>
              <StatTile
                value={stats.data.seeds_planted}
                label="seeds planted by our customers"
                emoji={<Seed size={30} color="#E4D2B8" />}
                delay={0}
                highlight
              />
              <StatTile
                value={stats.data.trees_grown}
                label="trees grown from our packs"
                emoji={<Sprout size={40} />}
                delay={0.1}
              />
              <StatTile
                value={stats.data.bottles_collected}
                label="sculpted bottles collected"
                emoji={<span className="text-3xl">🍾</span>}
                delay={0.2}
              />
              <StatTile
                value={stats.data.families_planting}
                label="families growing with us"
                emoji={<Leaf size={30} color="#96D091" />}
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Live ticker from the growing journal */}
        {recent.data && recent.data.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-6 rounded-4xl bg-cream-100/8 p-6 ring-1 ring-cream-100/12 backdrop-blur-sm">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-leaf-200/80 uppercase">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-300 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-300" />
                </span>
                Just planted, from our growing journal
              </p>

              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {recent.data.map((entry, index) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    className="flex items-center gap-2.5 rounded-2xl bg-white/8 px-3.5 py-2.5 text-sm"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/12 text-base" aria-hidden="true">
                      {FRUIT_EMOJI[entry.fruit_type] ?? '🌱'}
                    </span>
                    <span className="min-w-0">
                      <strong className="font-semibold text-cream-50">{entry.child_name_or_nickname}</strong>{' '}
                      <span className="text-cream-200/70">planted a {entry.fruit_type} seed</span>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {stats.data && (
          <Reveal delay={0.25}>
            <p className="mt-8 text-center text-sm text-cream-200/60">
              Now shipping to{' '}
              <strong className="font-semibold text-gold-300 tabular-nums">
                {formatNumber(stats.data.countries_reached)} countries
              </strong>{' '}
              — which we consider an unnecessarily large number of trees.
            </p>
          </Reveal>
        )}
      </Container>
    </Section>
  )
}

function StatTile({
  value,
  label,
  emoji,
  delay,
  highlight = false,
}: {
  value: number
  label: string
  emoji: React.ReactNode
  delay: number
  highlight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={
        highlight
          ? 'flex flex-col items-center gap-2 rounded-4xl bg-gradient-to-br from-sunny-400 to-sunny-500 p-7 text-seed-900 shadow-[0_20px_50px_-20px_rgba(247,148,29,0.8)]'
          : 'flex flex-col items-center gap-2 rounded-4xl bg-cream-100/8 p-7 ring-1 ring-cream-100/14 transition-colors hover:bg-cream-100/12'
      }
    >
      <span aria-hidden="true">{emoji}</span>
      <Counter value={value} highlight={highlight} />
      <span
        className={
          highlight
            ? 'text-center text-sm font-medium text-seed-800/85'
            : 'text-center text-sm font-medium text-cream-200/75'
        }
      >
        {label}
      </span>
    </motion.div>
  )
}

function Counter({ value, highlight }: { value: number; highlight: boolean }) {
  return (
    <AnimatedCounter
      value={value}
      duration={2000}
      className={highlight ? 'text-seed-900' : 'text-cream-50'}
    />
  )
}

const FRUIT_EMOJI: Record<string, string> = {
  apple: '🍎',
  orange: '🍊',
  watermelon: '🍉',
  mango: '🥭',
  grape: '🍇',
  lemon: '🍋',
  pear: '🍐',
}
