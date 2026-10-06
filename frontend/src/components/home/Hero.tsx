/** Hero: headline, drifting seed/leaf field with mouse parallax, wavy divider. */

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Blob, DriftingSeeds, Leaf, Seed, Sprout, WaveDivider } from '@/components/Illustrations'
import { Container } from '@/components/ui'
import { cx, useReducedMotion } from '@/lib/utils'

export function Hero() {
  const reduced = useReducedMotion()

  // Pointer position drives a gentle parallax across the three depth layers.
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 60, damping: 20 })
  const y = useSpring(rawY, { stiffness: 60, damping: 20 })

  const backX = useTransform(x, [-1, 1], [24, -24])
  const backY = useTransform(y, [-1, 1], [16, -16])
  const midX = useTransform(x, [-1, 1], [-14, 14])
  const midY = useTransform(y, [-1, 1], [-10, 10])
  const frontX = useTransform(x, [-1, 1], [34, -34])
  const frontY = useTransform(y, [-1, 1], [22, -22])

  const [sparkleVisible, setSparkleVisible] = useState(true)

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    // Normalise to -1..1 from the section centre.
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
    rawX.set(Math.max(-1, Math.min(1, nx)))
    rawY.set(Math.max(-1, Math.min(1, ny)))
  }

  function resetPointer() {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative isolate overflow-hidden bg-gradient-to-b from-leaf-50 via-cream-50 to-cream-100 pt-28 pb-4 sm:pt-36 lg:pt-44"
      aria-labelledby="hero-heading"
    >
      {/* Background blobs + falling seed field */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={reduced ? undefined : { x: backX, y: backY }}
      >
        <Blob color="#C3E5C0" className="-top-24 -left-20 h-[26rem] w-[26rem]" opacity={0.7} />
        <Blob color="#FDF0C8" className="top-32 -right-24 h-[22rem] w-[22rem]" opacity={0.6} />
        <Blob color="#E0F2DE" className="-bottom-32 left-1/3 h-[24rem] w-[24rem]" opacity={0.55} />
      </motion.div>

      <DriftingSeeds count={18} offsetX={x} offsetY={y} />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          {/* --- Copy --- */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-leaf-700 uppercase ring-1 ring-leaf-200 shadow-soft backdrop-blur"
            >
              <Seed size={14} />
              Seeds in every kids&rsquo; pack
            </motion.span>

            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-balance text-4xl leading-[1.03] font-semibold text-seed-900 sm:text-6xl lg:text-[4.1rem]"
            >
              Every pack has a{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-leaf-600">story</span>
                {/* Hand-drawn underline that sweeps in */}
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 200 16"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-3 w-full text-sunny-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: '0%' }}
                >
                  <path
                    d="M2 11C40 4 88 3 198 8"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.svg>
              </span>{' '}
              growing inside
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-seed-700/85 lg:mx-0"
            >
              Seedling &amp; Vine is a fruit company with two obsessions: hide a genuine, plantable
              seed under every kids&rsquo; sticker — and pour our juice into glass worth keeping on a
              shelf.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                to="/little-sprouts"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf-600 px-7 py-4 text-base font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-leaf-700 sm:w-auto"
              >
                <Sprout size={22} />
                Start with a seed
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>

              <Link
                to="/rare-collection"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum-900 px-7 py-4 text-base font-semibold text-gold-300 shadow-lift ring-1 ring-gold-400/30 transition-all hover:-translate-y-0.5 hover:bg-plum-800 sm:w-auto"
              >
                See the sculpted bottles
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-seed-700/70 lg:justify-start"
            >
              {['No added sugar', 'Real horticultural guides', 'Numbered editions'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-leaf-500" aria-hidden="true">
                    ✿
                  </span>
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* --- Artwork --- */}
          <motion.div
            aria-hidden="true"
            className="relative mx-auto aspect-square w-full max-w-[26rem] lg:max-w-none"
            style={reduced ? undefined : { x: midX, y: midY }}
          >
            {/* Concentric rings behind the packs */}
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                className="absolute h-[86%] w-[86%] rounded-full border-2 border-dashed border-leaf-300/60"
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute h-[68%] w-[68%] rounded-full bg-leaf-100/70" />
            </div>

            {/* Three floating tetra packs, one per category */}
            <PackFloat
              emoji="🍎"
              label="Apple seed"
              accent="#E8552F"
              className="left-[4%] top-[16%] z-20"
              offset={frontX}
              offsetY={frontY}
              tilt={-10}
              delay={0}
            />
            <PackFloat
              emoji="🍊"
              label="Orange"
              accent="#FF9F1C"
              className="right-[2%] top-[6%] z-10"
              offset={midX}
              offsetY={midY}
              tilt={12}
              delay={1.2}
            />
            <PackFloat
              emoji="🍉"
              label="Watermelon"
              accent="#06D6A0"
              className="bottom-[8%] left-[26%] z-30"
              offset={frontX}
              offsetY={frontY}
              tilt={4}
              delay={0.6}
            />

            {/* Bottle silhouette peeking from behind */}
            <motion.div
              className="absolute top-[34%] right-[16%] z-0 opacity-90"
              style={reduced ? undefined : { x: backX, y: backY }}
              animate={reduced ? undefined : { rotate: [0, 4, 0], y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="86" height="110" viewBox="0 0 120 150" fill="none">
                <path
                  d="M60 20c-24 0-42 17-42 40 0 14 4 22 9 29 4 6 5 10 5 17 0 12 12 20 28 20s28-8 28-20c0-7 1-11 5-17 5-7 9-15 9-29 0-23-18-40-42-40Z"
                  fill="#EDE4F2"
                  stroke="#DCC9E8"
                  strokeWidth="2"
                />
                <ellipse cx="47" cy="62" rx="9" ry="11" fill="#4D1740" />
                <ellipse cx="73" cy="62" rx="9" ry="11" fill="#4D1740" />
                <rect x="48" y="2" width="24" height="11" rx="3.5" fill="#D4A437" />
              </svg>
            </motion.div>

            {/* Seed sparkle */}
            {sparkleVisible && (
              <motion.button
                type="button"
                onClick={() => setSparkleVisible(false)}
                className="absolute bottom-[2%] right-[6%] z-40 grid h-14 w-14 cursor-pointer place-items-center rounded-2xl bg-white/85 shadow-lift ring-1 ring-sunny-300 backdrop-blur"
                animate={reduced ? undefined : { scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                aria-label="Hide the sparkle"
              >
                <Leaf size={26} />
              </motion.button>
            )}
          </motion.div>
        </div>
      </Container>

      {/* Wave seam into the next section */}
      <div className="mt-12 sm:mt-16">
        <WaveDivider fill="#FAF6EA" />
      </div>
    </section>
  )
}

/** One floating tetra-pak illustration in the hero artwork cluster. */
function PackFloat({
  emoji,
  label,
  accent,
  className,
  offset,
  offsetY,
  tilt,
  delay,
}: {
  emoji: string
  label: string
  accent: string
  className?: string
  offset: ReturnType<typeof useTransform<number, number>>
  offsetY: ReturnType<typeof useTransform<number, number>>
  tilt: number
  delay: number
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={cx('absolute w-24 sm:w-28', className)}
      style={reduced ? undefined : { x: offset, y: offsetY }}
      initial={{ opacity: 0, scale: 0.7, rotate: tilt }}
      animate={
        reduced
          ? { opacity: 1, scale: 1, rotate: tilt }
          : { opacity: 1, scale: 1, rotate: [tilt - 2, tilt + 2, tilt - 2], y: [0, -12, 0] }
      }
      transition={{
        opacity: { duration: 0.6, delay: 0.4 + delay * 0.1 },
        scale: { duration: 0.6, delay: 0.4 + delay * 0.1, ease: [0.22, 1, 0.36, 1] },
        rotate: { duration: 6 + delay, delay, repeat: Infinity, ease: 'easeInOut' },
        y: { duration: 5 + delay * 0.5, delay, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <div
        className="rounded-3xl p-3 shadow-lift ring-1 ring-white/70"
        style={{ backgroundColor: `${accent}22` }}
      >
        <svg viewBox="0 0 80 104" fill="none" className="w-full" aria-hidden="true">
          <path d="M16 26h48a3 3 0 0 1 3 3v62a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V29a3 3 0 0 1 3-3Z" fill={accent} />
          <path d="M13 26 24 12h32l11 14H13Z" fill={accent} opacity="0.82" />
          <rect x="17" y="30" width="6" height="58" rx="3" fill="rgba(255,255,255,0.32)" />
          <rect x="13" y="56" width="54" height="22" fill="rgba(255,255,255,0.9)" />
          <rect x="58" y="4" width="4.5" height="30" rx="2.25" fill="#F472B6" transform="rotate(10 60 19)" />
        </svg>
        <span className="mt-1.5 block text-center text-2xl" role="img" aria-label={label}>
          {emoji}
        </span>
      </div>
    </motion.div>
  )
}
