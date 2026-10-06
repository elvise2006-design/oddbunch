/** Testimonials slider — auto-advancing, pausable, keyboard accessible. */

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

import { Container, Reveal, Section, SectionTitle } from '@/components/ui'
import { TESTIMONIALS } from '@/data/site'
import { cx, useReducedMotion } from '@/lib/utils'

const AUTOPLAY_MS = 7000

export function TestimonialsSlider() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState(1)

  const count = TESTIMONIALS.length

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir)
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  const next = useCallback(() => go(index + 1, 1), [go, index])
  const prev = useCallback(() => go(index - 1, -1), [go, index])

  // Auto-advance, suspended on hover/focus and under reduced motion.
  useEffect(() => {
    if (paused || reduced) return
    const timer = window.setTimeout(next, AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [index, paused, reduced, next])

  const active = TESTIMONIALS[index]

  return (
    <Section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="bg-gradient-to-b from-cream-50 to-leaf-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Word of mouth"
            title={<span id="testimonials-title">What people tell us</span>}
            accent="#F7941D"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="relative mx-auto mt-12 max-w-3xl"
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
            tabIndex={0}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') { event.preventDefault(); next() }
              if (event.key === 'ArrowLeft') { event.preventDefault(); prev() }
            }}
          >
            <div className="relative min-h-[19rem] sm:min-h-[16rem]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.figure
                  key={index}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 48, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction * -48, scale: 0.97 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col items-center gap-5 rounded-5xl bg-white p-8 text-center shadow-lift ring-1 ring-seed-200/70 sm:p-10"
                >
                  <span className="text-4xl leading-none text-sunny-400" aria-hidden="true">
                    &ldquo;
                  </span>

                  <blockquote className="text-pretty text-lg leading-relaxed text-balance text-seed-800 sm:text-xl">
                    {active.quote}
                  </blockquote>

                  <figcaption className="mt-auto flex flex-col items-center gap-2 pt-4">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-full bg-leaf-100 text-2xl ring-1 ring-leaf-200"
                      aria-hidden="true"
                    >
                      {active.emoji}
                    </span>
                    <span className="font-display text-base font-semibold text-seed-900">
                      {active.name}
                    </span>
                    <span className="text-xs tracking-wide text-seed-700/65">{active.role}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <SliderButton onClick={prev} label="Previous testimonial" direction="left" />

              <div className="flex items-center gap-2" role="tablist" aria-label="Choose a testimonial">
                {TESTIMONIALS.map((item, i) => (
                  <button
                    key={item.name}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Testimonial ${i + 1} of ${count}: ${item.name}`}
                    onClick={() => go(i, i > index ? 1 : -1)}
                    className={cx(
                      'h-2.5 rounded-full transition-all duration-300',
                      i === index ? 'w-7 bg-leaf-500' : 'w-2.5 bg-seed-300 hover:bg-seed-400',
                    )}
                  />
                ))}
              </div>

              <SliderButton onClick={next} label="Next testimonial" direction="right" />
            </div>

            {/* Screen-reader live region so the change is announced */}
            <p className="sr-only" aria-live="polite">
              Testimonial {index + 1} of {count}: {active.name}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

function SliderButton({
  onClick,
  label,
  direction,
}: {
  onClick: () => void
  label: string
  direction: 'left' | 'right'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full bg-white text-seed-800 shadow-soft ring-1 ring-seed-200 transition-all hover:-translate-y-0.5 hover:bg-leaf-50 hover:text-leaf-700"
    >
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
