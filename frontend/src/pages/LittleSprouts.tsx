/** Little Sprouts — the kids' page: cartoon cast, peel & reveal, game, journal. */

import { motion } from 'framer-motion'

import { Leaf, Seed, Sprout, WaveDivider } from '@/components/Illustrations'
import { SeedRevealCard } from '@/components/SeedRevealCard'
import { ProductCardSkeleton } from '@/components/ProductCard'
import { ErrorState } from '@/components/States'
import { GrowingJournal } from '@/components/kids/GrowingJournal'
import { SeedGame } from '@/components/kids/SeedGame'
import { Container, Reveal, Section, SectionTitle } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { api, type Product } from '@/lib/api'
import { useReducedMotion } from '@/lib/utils'

export default function LittleSprouts() {
  const { data, loading, error, reload } = useAsync<Product[]>(
    () => api.listProducts({ category: 'kids', sort: 'price_asc' }),
    [],
  )

  return (
    <>
      <HeroBanner />

      {/* --- The peel & reveal catalogue --- */}
      <Section id="reveal" aria-labelledby="reveal-title">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Try it right here"
              title={<span id="reveal-title">Peel &amp; reveal</span>}
              lede="Grab a sticker and pull. Underneath is a real seed, plus the actual growing instructions for that fruit — soil depth, sunlight, and roughly how many days until you see a sprout."
              accent="#F7941D"
            />
          </Reveal>

          <div className="mt-12">
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && <ErrorState message={error} onRetry={reload} className="mx-auto max-w-xl" />}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.map((product, index) => (
                <Reveal key={product.id} delay={Math.min(index * 0.07, 0.35)}>
                  <SeedRevealCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <SeedGame />
      <GrowingJournal />

      {/* --- Closing CTA --- */}
      <ClosingCta />
    </>
  )
}

// ---------------------------------------------------------------------------

function HeroBanner() {
  const reduced = useReducedMotion()

  const cast = [
    { emoji: '🍎', name: 'Apple', line: 'Wants a cold fridge first', color: '#E8552F' },
    { emoji: '🍊', name: 'Orange', line: 'Sunshine and warm water', color: '#FF9F1C' },
    { emoji: '🍉', name: 'Melon', line: 'Sprouts in about a week', color: '#06D6A0' },
    { emoji: '🥭', name: 'Mango', line: 'Peel the husk, then wait', color: '#FFB703' },
    { emoji: '🍇', name: 'Grape', line: 'The patient one', color: '#9B5DE5' },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sunny-300 via-[#ffe6a8] to-cream-100 pt-28 pb-16 sm:pt-36 lg:pt-40">
      {/* Playful confetti dots */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: 22 }, (_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 41.7) % 96}%`,
              top: `${(i * 27.3) % 88}%`,
              width: 8 + ((i * 5) % 10),
              height: 8 + ((i * 5) % 10),
              backgroundColor: ['#E8552F', '#FF9F1C', '#4F9E4A', '#9B5DE5', '#F472B6'][i % 5],
              opacity: 0.28,
            }}
            animate={reduced ? undefined : { y: [0, -14, 0], rotate: [0, 90, 0] }}
            transition={{
              duration: 5 + (i % 4),
              delay: i * 0.18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <Container className="relative">
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="grid h-24 w-24 place-items-center rounded-4xl bg-white/70 shadow-lift ring-1 ring-white"
          >
            <Sprout size={62} animated />
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-balance text-4xl leading-[1.05] font-semibold text-seed-900 sm:text-6xl"
          >
            Little Sprouts
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="max-w-2xl text-pretty text-lg leading-relaxed text-seed-800/85"
          >
            Peel the sticker, reveal a real seed, and grow your own fruit tree. No toy seeds, no
            plastic — an actual one that came out of actual fruit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-2 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#reveal"
              className="inline-flex items-center gap-2 rounded-full bg-seed-900 px-6 py-3.5 text-base font-semibold text-cream-50 shadow-lift transition-all hover:-translate-y-0.5"
            >
              <Seed size={18} />
              Peel one now
            </a>
            <a
              href="#journal"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3.5 text-base font-semibold text-seed-900 shadow-soft ring-1 ring-white transition-all hover:-translate-y-0.5"
            >
              <Leaf size={18} />
              My growing journal
            </a>
          </motion.div>
        </div>

        {/* --- The cartoon fruit cast --- */}
        <div className="mt-16">
          <p className="text-center text-xs font-bold tracking-[0.2em] text-seed-700/60 uppercase">
            Say hello to the seeds inside
          </p>

          <ul className="mt-6 flex flex-wrap items-end justify-center gap-3 sm:gap-5">
            {cast.map((character, index) => (
              <motion.li
                key={character.name}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.09, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, rotate: [0, -4, 4, 0] }}
                className="group flex w-[8.5rem] flex-col items-center rounded-4xl bg-white/80 p-4 text-center shadow-soft ring-1 ring-white backdrop-blur-sm transition-shadow hover:shadow-lift sm:w-40"
              >
                <motion.span
                  className="grid h-16 w-16 place-items-center rounded-full text-4xl sm:h-20 sm:w-20 sm:text-5xl"
                  style={{ backgroundColor: `${character.color}22` }}
                  animate={
                    reduced
                      ? undefined
                      : { rotate: [0, -6, 6, 0], y: [0, -6, 0] }
                  }
                  transition={{
                    duration: 3.4 + index * 0.3,
                    delay: index * 0.25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  aria-hidden="true"
                >
                  {character.emoji}
                </motion.span>

                <span className="mt-3 font-display text-base font-semibold text-seed-900">
                  {character.name}
                </span>
                <span className="mt-1 text-xs leading-snug text-pretty text-seed-700/70">
                  {character.line}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="mt-12">
        <WaveDivider fill="#FAF6EA" />
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <Section className="bg-cream-100 pb-24">
      <Container size="narrow">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-leaf-500 to-leaf-700 p-8 text-center text-cream-50 shadow-lift sm:p-12">
            <Leaf
              size={160}
              animated
              color="#FAF6EA"
              className="pointer-events-none absolute -top-8 -right-8 opacity-10"
            />
            <Sprout size={54} animated className="mx-auto relative" />
            <h2 className="relative mt-5 text-balance text-2xl font-semibold sm:text-3xl">
              Grown-ups: this is where it gets real
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-cream-100/85">
              Every Little Sprouts pack ships with the seed under the sticker, a printed growing
              guide, and a link to our support team if your child&rsquo;s seed does not sprout. We
              have honoured every refund request — and there have been four.
            </p>
            <a
              href="/contact"
              className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-seed-900 px-6 py-3.5 text-base font-semibold text-cream-50 transition-all hover:-translate-y-0.5 hover:bg-seed-800"
            >
              Ask us anything
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
