/**
 * Catch the Falling Seed — bonus mini-game for the Little Sprouts page.
 *
 * A child plants pots along the bottom; seeds drift down; catching one grows a
 * plant and scores a point. Built with plain React state on a requestAnimationFrame
 * loop, so it stays responsive without a physics library.
 */

import { motion } from 'framer-motion'

import { Seed, Sprout } from '@/components/Illustrations'
import { Container, Reveal, Section } from '@/components/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cx, randomInt, useReducedMotion } from '@/lib/utils'

const BOARD_HEIGHT = 340
const POTS = 3

interface FallingSeed {
  id: number
  x: number
  y: number
  speed: number
  drift: number
  good: boolean
}

interface Plant {
  slot: number
  grown: number
}

export function SeedGame() {
  const reduced = useReducedMotion()
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [seeds, setSeeds] = useState<FallingSeed[]>([])
  const [plants, setPlants] = useState<Plant[]>([])

  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const seedIdRef = useRef(0)
  const spawnTimerRef = useRef<number>(0)

  const reset = useCallback(() => {
    setScore(0)
    setMisses(0)
    setSeeds([])
    setPlants([])
    seedIdRef.current = 0
  }, [])

  /** A seed reaching a planted pot grows it; an empty pot just misses. */
  const handleCatch = useCallback((seed: FallingSeed) => {
    setSeeds((current) => current.filter((s) => s.id !== seed.id))

    const slot = Math.min(POTS - 1, Math.floor((seed.x / 100) * POTS))
    let grew = false

    setPlants((current) => {
      const next = [...current]
      const existing = next.find((plant) => plant.slot === slot)
      if (existing) {
        if (existing.grown < 3) {
          next[next.indexOf(existing)] = { ...existing, grown: existing.grown + 1 }
          grew = true
        }
        return next
      }
      next.push({ slot, grown: 1 })
      grew = true
      return next
    })

    if (grew) setScore((value) => value + 1)
    else setMisses((value) => value + 1)
  }, [])

  // The game loop. Each frame advances every seed; a new one spawns periodically.
  useEffect(() => {
    if (!running) return

    const loop = (time: number) => {
      const dt = lastTimeRef.current === 0 ? 16 : time - lastTimeRef.current
      lastTimeRef.current = time

      setSeeds((current) =>
        current
          .map((seed) => {
            const nextY = seed.y + (seed.speed * dt) / 1000
            const nextX = seed.x + Math.sin(nextY / 42) * seed.drift * (dt / 1000)
            // Past the bottom of the board and not caught.
            if (nextY > BOARD_HEIGHT + 20) {
              setMisses((value) => value + 1)
              return null
            }
            return { ...seed, y: nextY, x: Math.max(2, Math.min(98, nextX)) }
          })
          .filter((seed): seed is FallingSeed => seed !== null),
      )

      spawnTimerRef.current -= dt
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = 720
        seedIdRef.current += 1
        setSeeds((current) => [
          ...current,
          {
            id: seedIdRef.current,
            x: randomInt(6, 94),
            y: -20,
            speed: randomInt(48, 92),
            drift: randomInt(6, 22) / 10,
            good: seedIdRef.current % 5 !== 0,
          },
        ])
      }

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      lastTimeRef.current = 0
    }
  }, [running])

  // Keyboard control: left/right arrows move the catcher basket.
  useEffect(() => {
    if (!running) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const nudge = event.key === 'ArrowLeft' ? -8 : 8
      setSeeds((current) =>
        current
          .map((seed) => ({ ...seed, x: Math.max(2, Math.min(98, seed.x + nudge)) }))
          .filter((seed) => {
            if (seed.y >= BOARD_HEIGHT - 60) {
              handleCatch(seed)
              return false
            }
            return true
          }),
      )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, handleCatch])

  const allGrown = plants.length >= POTS && plants.every((plant) => plant.grown >= 3)

  return (
    <Section id="seed-game" aria-labelledby="seed-game-title" className="bg-sunny-300/25">
      <Container>
        <Reveal>
          <div className="rounded-5xl border-2 border-dashed border-sunny-500/50 bg-white/70 p-6 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sunny-400 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-seed-900 uppercase">
                  Bonus play area
                </span>
                <h2
                  id="seed-game-title"
                  className="mt-3 font-display text-2xl leading-tight font-semibold text-balance text-seed-900 sm:text-3xl"
                >
                  Catch the falling seed
                </h2>
                <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-seed-700/80">
                  Catch a seed as it reaches a pot to grow it. Three pots, three stages each — fill
                  the whole shelf to win. Use the{' '}
                  <kbd className="rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold ring-1 ring-seed-300">
                    ←
                  </kbd>{' '}
                  <kbd className="rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold ring-1 ring-seed-300">
                    →
                  </kbd>{' '}
                  keys or just tap a seed.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white px-4 py-2.5 text-center shadow-soft">
                  <span className="block text-[11px] font-bold tracking-wide text-seed-700/60 uppercase">
                    Score
                  </span>
                  <span className="font-display text-2xl leading-none font-semibold text-leaf-700 tabular-nums">
                    {score}
                  </span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-2.5 text-center shadow-soft">
                  <span className="block text-[11px] font-bold tracking-wide text-seed-700/60 uppercase">
                    Missed
                  </span>
                  <span className="font-display text-2xl leading-none font-semibold text-seed-700/70 tabular-nums">
                    {misses}
                  </span>
                </div>
              </div>
            </div>

            {/* --- The board --- */}
            <div className="mt-7">
              <div
                className="relative overflow-hidden rounded-4xl bg-gradient-to-b from-leaf-100 via-leaf-50 to-cream-200 ring-1 ring-leaf-200"
                style={{ height: BOARD_HEIGHT }}
                role="application"
                aria-label="Catch the falling seed game board"
              >
                {/* Sun + cloud dressing */}
                <div
                  aria-hidden="true"
                  className="absolute top-4 right-5 h-12 w-12 rounded-full bg-sunny-300 blur-[1px]"
                />
                <div
                  aria-hidden="true"
                  className="absolute top-8 left-8 h-5 w-14 rounded-full bg-white/70"
                />

                {/* Falling seeds */}
                {seeds.map((seed) => (
                  <motion.button
                    key={seed.id}
                    type="button"
                    onClick={() => handleCatch(seed)}
                    aria-label={`Catch ${seed.good ? 'a good seed' : 'a seed'}`}
                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition-transform hover:scale-125"
                    style={{
                      left: `${seed.x}%`,
                      top: seed.y,
                      // Bonus seeds glow so kids can spot them.
                      filter: seed.good ? 'drop-shadow(0 0 8px rgba(255,183,3,0.9))' : 'none',
                    }}
                  >
                    <Seed
                      size={seed.good ? 26 : 20}
                      color={seed.good ? '#B9916A' : '#7D5A3F'}
                      animated={false}
                    />
                  </motion.button>
                ))}

                {/* Pots along the bottom */}
                <div className="absolute inset-x-0 bottom-0 flex">
                  {Array.from({ length: POTS }, (_, slot) => {
                    const plant = plants.find((p) => p.slot === slot)
                    const stage = plant?.grown ?? 0
                    return (
                      <div
                        key={slot}
                        className="flex flex-1 flex-col items-center justify-end"
                        aria-label={`Pot ${slot + 1}, stage ${stage} of 3`}
                      >
                        <motion.div
                          animate={{ scale: stage > 0 ? [1, 1.06, 1] : 1 }}
                          transition={{ duration: 1.4, repeat: stage > 0 ? Infinity : 0, ease: 'easeInOut' }}
                        >
                          {stage > 0 ? (
                            <Sprout size={26 + stage * 16} animated={false} />
                          ) : (
                            <span className="text-3xl opacity-25" aria-hidden="true">
                              🪴
                            </span>
                          )}
                        </motion.div>

                        {/* Pot */}
                        <svg width="52" height="34" viewBox="0 0 52 34" fill="none" aria-hidden="true">
                          <path d="M5 4h42l-4 26a4 4 0 0 1-4 3.5H13a4 4 0 0 1-4-3.5L5 4Z" fill={stage > 0 ? '#C4703A' : '#D8C3B0'} />
                          <rect x="3" y="1" width="46" height="6" rx="3" fill={stage > 0 ? '#A85A2C' : '#C4AF9C'} />
                        </svg>

                        {/* Stage pips */}
                        <div className="mb-1.5 flex gap-1" aria-hidden="true">
                          {[1, 2, 3].map((pip) => (
                            <span
                              key={pip}
                              className={cx(
                                'h-1.5 w-4 rounded-full transition-colors',
                                pip <= stage ? 'bg-leaf-500' : 'bg-seed-300/60',
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Start / game-over overlay */}
                {!running && (
                  <div className="absolute inset-0 grid place-items-center bg-cream-50/85 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 px-6 text-center">
                      <span className="text-5xl" aria-hidden="true">
                        {allGrown ? '🌳' : '🌱'}
                      </span>
                      <div>
                        <p className="font-display text-lg font-semibold text-seed-900">
                          {allGrown ? 'You grew a whole shelf!' : 'Ready to plant?'}
                        </p>
                        <p className="mt-1 text-sm text-seed-700/75">
                          {allGrown
                            ? `Final score ${score} with ${misses} seeds missed. Remarkable.`
                            : 'Catch the seeds as they fall.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (allGrown) reset()
                          setRunning(true)
                        }}
                        className="rounded-full bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-lift transition-colors hover:bg-leaf-700"
                      >
                        {allGrown ? 'Play again' : 'Start planting'}
                      </button>
                    </div>
                  </div>
                )}

                {running && allGrown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 grid place-items-center bg-leaf-50/90 backdrop-blur-sm"
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                      <span className="text-6xl" aria-hidden="true">
                        🎉
                      </span>
                      <p className="font-display text-xl font-semibold text-seed-900">
                        All three pots are full-grown!
                      </p>
                      <p className="text-sm text-seed-700/75">
                        Score {score} &middot; Missed {misses}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          reset()
                          setRunning(true)
                        }}
                        className="rounded-full bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-lift hover:bg-leaf-700"
                      >
                        Grow another shelf
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {running && (
                <button
                  type="button"
                  onClick={() => setRunning(false)}
                  className="rounded-full bg-seed-100 px-5 py-2.5 text-sm font-semibold text-seed-800 transition-colors hover:bg-seed-200"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setRunning(false)
                  reset()
                }}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-seed-700/70 underline underline-offset-4 transition-colors hover:text-seed-900"
              >
                Reset the shelf
              </button>
              {reduced && (
                <p className="text-xs text-seed-700/60">
                  Reduced motion is on, so decorative loops are paused — the game still works.
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
