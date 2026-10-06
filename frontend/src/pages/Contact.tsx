/** Contact form — posts to POST /api/contact. */

import { motion } from 'framer-motion'
import { useState } from 'react'

import { Leaf, Seed, WaveDivider } from '@/components/Illustrations'
import { SuccessBanner } from '@/components/States'
import { Container, Reveal, Section } from '@/components/ui'
import { api } from '@/lib/api'
import { cx } from '@/lib/utils'

const TOPICS = [
  { value: 'general', label: 'General question', emoji: '💬' },
  { value: 'wholesale', label: 'Wholesale & cafes', emoji: '☕' },
  { value: 'press', label: 'Press & reviews', emoji: '📰' },
  { value: 'care', label: 'Seed growing help', emoji: '🌱' },
]

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('general')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (name.trim().length < 2) return setError('We need a name to reply to.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('That email address looks a little off.')
    if (message.trim().length < 10)
      return setError('A little more detail helps — ten characters or more, please.')

    setSending(true)
    try {
      await api.sendContact({
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
      })
      setSuccess(`Thanks ${name.trim().split(' ')[0]} — your message is in. We reply within two working days.`)
      setName('')
      setEmail('')
      setMessage('')
      setTopic('general')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send that. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-cream-50 to-cream-100 pt-28 pb-14 sm:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-16 h-80 w-80 rounded-full bg-leaf-200/45 blur-3xl"
        />
        <Container className="relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-leaf-700 uppercase ring-1 ring-leaf-200 shadow-soft">
              <Leaf size={14} />
              Say hello
            </span>
            <h1 className="mt-6 text-balance text-4xl leading-[1.05] font-semibold text-seed-900 sm:text-5xl">
              Contact us
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-seed-700/85">
              Wholesale, press, or a seed that refuses to sprout — all of it lands with the same two
              people who pack the cartons.
            </p>
          </div>
        </Container>
        <div className="mt-10">
          <WaveDivider fill="#FAF6EA" />
        </div>
      </section>

      <Section className="bg-cream-100">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
            {/* --- Form --- */}
            <Reveal direction="right">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 rounded-5xl bg-white p-6 shadow-soft ring-1 ring-seed-200/70 sm:p-8"
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-seed-800">
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Harper Lee"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 transition-shadow placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-seed-800">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 transition-shadow placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                    />
                  </div>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-seed-800">What is this about?</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TOPICS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTopic(option.value)}
                        aria-pressed={topic === option.value}
                        className={cx(
                          'flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all',
                          topic === option.value
                            ? 'bg-leaf-600 text-white shadow-soft'
                            : 'bg-cream-50 text-seed-800 ring-1 ring-seed-200 hover:bg-leaf-50',
                        )}
                      >
                        <span aria-hidden="true">{option.emoji}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <label htmlFor="contact-message" className="text-sm font-semibold text-seed-800">
                      Message
                    </label>
                    <span className="text-xs text-seed-700/50 tabular-nums">
                      {message.trim().length}/2000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    required
                    rows={6}
                    maxLength={2000}
                    placeholder="Tell us what you need. The more specific, the faster we can help."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="w-full resize-y rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 transition-shadow placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}
                {success && <SuccessBanner message={success} />}

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={sending ? undefined : { y: -2 }}
                  whileTap={sending ? undefined : { scale: 0.98 }}
                  className="group inline-flex items-center justify-center gap-2 self-start rounded-full bg-leaf-600 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition-colors hover:bg-leaf-700 disabled:translate-y-0 disabled:opacity-60"
                >
                  <Seed size={18} color="#FAF6EA" />
                  {sending ? 'Sending…' : 'Send message'}
                  {!sending && (
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </motion.button>
              </form>
            </Reveal>

            {/* --- Side panel --- */}
            <Reveal direction="left" delay={0.1}>
              <div className="flex flex-col gap-5">
                <div className="rounded-5xl bg-leaf-900 p-6 text-cream-100 sm:p-7">
                  <h2 className="font-display text-lg font-semibold text-cream-50">
                    Where we actually are
                  </h2>
                  <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-cream-200/80">
                    <p>Seedling &amp; Vine</p>
                    <p>112 Peel Street, Unit 3</p>
                    <p>Guelph, Ontario N1G 2R6</p>
                    <p>Canada</p>
                  </address>
                  <p className="mt-5 border-t border-white/12 pt-4 text-sm text-cream-200/70">
                    Packing floor open Monday to Friday, 8am–4pm. Come collect a seed.
                  </p>
                </div>

                <div className="rounded-5xl bg-white p-6 shadow-soft ring-1 ring-seed-200/70">
                  <h2 className="font-display text-lg font-semibold text-seed-900">
                    Seed growing help
                  </h2>
                  <p className="mt-2.5 text-pretty text-sm leading-relaxed text-seed-700/85">
                    Pick &ldquo;Seed growing help&rdquo; and tell us the fruit and how long you have
                    been waiting. If it is going to sprout, we will tell you what it is waiting for.
                  </p>
                  <p className="mt-4 flex items-center gap-2 rounded-2xl bg-sunny-300/25 px-4 py-3 text-sm font-medium text-seed-800">
                    <span aria-hidden="true">🐿️</span>
                    Squirrel-proofing is our speciality.
                  </p>
                </div>

                <div className="rounded-5xl bg-sunny-300/25 p-6 ring-1 ring-sunny-400/40">
                  <h2 className="font-display text-lg font-semibold text-seed-900">Wholesale</h2>
                  <p className="mt-2.5 text-pretty text-sm leading-relaxed text-seed-800/85">
                    Cafés and grocers: the Weekly Fruit Box has a trade rate and a Thursday delivery
                    inside a two-hour window.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  )
}
