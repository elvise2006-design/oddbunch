/** Newsletter signup — posts to the backend and shows inline states. */

import { motion } from 'framer-motion'
import { useState } from 'react'

import { Leaf, Sprout } from '@/components/Illustrations'
import { SuccessBanner } from '@/components/States'
import { Container, Reveal, Section } from '@/components/ui'
import { api } from '@/lib/api'
import { cx } from '@/lib/utils'

const INTERESTS = [
  { key: 'kids', label: 'Seeds & sprouts' },
  { key: 'normal', label: 'Everyday juice' },
  { key: 'collector', label: 'Rare bottles' },
  { key: 'everything', label: 'All of it' },
] as const

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [interest, setInterest] = useState<string>('everything')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    // Cheap client-side check so an obvious typo never becomes a round trip.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('That email address looks a little off. Mind checking it?')
      return
    }

    setStatus('sending')
    try {
      await api.subscribeNewsletter({
        email,
        nickname: nickname.trim() || undefined,
        interest,
      })
      setStatus('done')
      setNotice(
        `You're on the list. We'll send seeds, not spam${nickname ? `, ${nickname}` : ''}.`,
      )
      setEmail('')
      setNickname('')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'We could not save your email. Please retry.')
    }
  }

  return (
    <Section id="newsletter" aria-labelledby="newsletter-title" className="bg-cream-50">
      <Container size="narrow">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-leaf-600 via-leaf-700 to-leaf-800 p-8 text-center shadow-lift sm:p-12">
            {/* Decorative foliage */}
            <Leaf
              size={150}
              animated
              color="#C3E5C0"
              className="pointer-events-none absolute -top-6 -left-6 opacity-15"
            />
            <Leaf
              size={120}
              animated
              flip
              color="#FAF6EA"
              className="pointer-events-none absolute -right-4 -bottom-4 opacity-10"
            />

            <div className="relative">
              <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Sprout size={38} animated />
              </span>

              <h2
                id="newsletter-title"
                className="mt-6 text-balance text-3xl leading-tight font-semibold text-cream-50 sm:text-4xl"
              >
                Get the seed, before everyone else
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-cream-100/85">
                One email a month: which fruits are in season, which collector bottles are about to
                sell out, and the occasional growing tip from our horticulturist.
              </p>

              <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-lg" noValidate>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'newsletter-error' : undefined}
                      className="w-full rounded-full bg-white/95 px-5 py-3.5 text-seed-900 shadow-soft ring-1 ring-white/60 transition-shadow placeholder:text-seed-700/40 focus:ring-2 focus:ring-sunny-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:w-44">
                    <label htmlFor="newsletter-nickname" className="sr-only">
                      First name (optional)
                    </label>
                    <input
                      id="newsletter-nickname"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      className="w-full rounded-full bg-white/70 px-5 py-3.5 text-cream-50 ring-1 ring-white/40 transition-shadow placeholder:text-cream-100/60 focus:bg-white/90 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Interest chips */}
                <fieldset className="mt-5">
                  <legend className="sr-only">What should we send you?</legend>
                  <div className="flex flex-wrap justify-center gap-2">
                    {INTERESTS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setInterest(option.key)}
                        aria-pressed={interest === option.key}
                        className={cx(
                          'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                          interest === option.key
                            ? 'bg-sunny-400 text-seed-900 shadow-soft'
                            : 'bg-white/12 text-cream-100/85 hover:bg-white/22',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <motion.button
                  type="submit"
                  disabled={status === 'sending' || status === 'done'}
                  whileHover={status === 'done' ? undefined : { y: -2 }}
                  whileTap={status === 'done' ? undefined : { scale: 0.98 }}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-seed-900 px-7 py-3.5 text-base font-semibold text-cream-50 shadow-lift transition-colors hover:bg-seed-800 disabled:cursor-default disabled:bg-leaf-600"
                >
                  {status === 'sending' && 'Planting…'}
                  {status === 'done' && 'You’re in ✓'}
                  {status === 'idle' && (
                    <>
                      Count me in
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </motion.button>

                {error && (
                  <p
                    id="newsletter-error"
                    role="alert"
                    className="mt-4 text-sm font-medium text-sunny-300"
                  >
                    {error}
                  </p>
                )}

                {notice && status === 'done' && <SuccessBanner message={notice} className="mt-5 text-left" />}

                <p className="mt-4 text-xs text-cream-100/60">
                  No more than twelve emails a year. Unsubscribe with one click.
                </p>
              </form>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
