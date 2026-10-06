/** "How the Seed Reveal Works" — three animated steps. */

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

import { Seed, Sprout } from '@/components/Illustrations'
import { Container, Reveal, Section, SectionTitle } from '@/components/ui'
import { HOW_IT_WORKS } from '@/data/site'
import { useReducedMotion } from '@/lib/utils'

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="relative overflow-hidden bg-gradient-to-b from-leaf-100 via-cream-100 to-cream-100"
    >
      {/* Soft botanical wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-leaf-200/45 blur-3xl"
      />

      <Container className="relative">
        <Reveal>
          <SectionTitle
            eyebrow="The sticker"
            title={<span id="how-it-works-title">How the seed reveal works</span>}
            lede="Three steps, about four minutes of work, and a tree that will outlive the person who planted it."
            accent="#F7941D"
          />
        </Reveal>

        <div className="relative mt-16">
          {/* Connecting line, revealed as you scroll (desktop only) */}
          <ProgressLine />

          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <StepCard key={item.step} item={item} index={index} />
            ))}
          </ol>
        </div>

        {/* Small reassurance note */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-14 flex max-w-2xl items-start gap-3 rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-seed-200/70">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf-100" aria-hidden="true">
              <Seed size={22} />
            </span>
            <p className="text-pretty text-sm leading-relaxed text-seed-800">
              <strong className="font-semibold">A note on honesty:</strong> the seeds we use are real
              and viable, but fruit trees grown from seed do not taste exactly like the fruit they came
              from. That is botany, not marketing — and it is a much better thing to tell a child than a
              lie.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

/** A horizontal rule that fills as the section scrolls through the viewport. */
function ProgressLine() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.35'],
  })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute top-[3.25rem] right-[16%] left-[16%] hidden h-[3px] rounded-full bg-seed-300/50 md:block"
    >
      <motion.div
        className="h-full origin-left rounded-full bg-gradient-to-r from-sunny-400 via-leaf-500 to-seed-500"
        style={reduced ? { scaleX: 1 } : { scaleX }}
      />
    </div>
  )
}

function StepCard({
  item,
  index,
}: {
  item: { step: number; title: string; body: string; emoji: string; accent: string }
  index: number
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.6, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center text-center"
    >
      {/* Step medallion */}
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.08, rotate: [0, -6, 6, 0] }}
          transition={{ duration: 0.6 }}
          className="relative grid h-[6.5rem] w-[6.5rem] place-items-center rounded-full bg-white shadow-lift ring-1 ring-seed-200"
        >
          {/* Accent halo that pulses gently */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-50"
            style={{ backgroundColor: item.accent }}
          />
          <span className="relative text-5xl" aria-hidden="true">
            {item.emoji}
          </span>

          {/* Step number */}
          <span
            className="absolute -top-1 -right-1 grid h-8 w-8 place-items-center rounded-full font-display text-sm font-bold text-white shadow-soft"
            style={{ backgroundColor: item.accent }}
          >
            {item.step}
          </span>
        </motion.div>
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold text-seed-900">{item.title}</h3>
      <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-seed-700/80">{item.body}</p>

      {/* Little sprouting accent under each step */}
      <Sprout size={30} animated className="mt-4 opacity-40 transition-opacity group-hover:opacity-80" />
    </motion.li>
  )
}
