/**
 * My Growing Journal — a demo-only tracker where a child logs the seeds they
 * have planted. Entries are saved to the backend via POST /api/growing-journal.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { Seed, Sprout } from '@/components/Illustrations'
import { EmptyState, ErrorState, SuccessBanner } from '@/components/States'
import { Container, Reveal, Section, SectionTitle } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { api, type JournalEntry } from '@/lib/api'
import { cx } from '@/lib/utils'

/** Today's date, captured once so the date input's `max` is stable across renders. */
const TODAY = new Date().toISOString().slice(0, 10)

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple', emoji: '🍎' },
  { value: 'orange', label: 'Orange', emoji: '🍊' },
  { value: 'watermelon', label: 'Watermelon', emoji: '🍉' },
  { value: 'mango', label: 'Mango', emoji: '🥭' },
  { value: 'grape', label: 'Grape', emoji: '🍇' },
  { value: 'lemon', label: 'Lemon', emoji: '🍋' },
]

export function GrowingJournal() {
  const { data, loading, error, reload } = useAsync<JournalEntry[]>(() => api.getJournal(), [])

  const [nickname, setNickname] = useState('')
  const [fruit, setFruit] = useState('apple')
  const [plantedDate, setPlantedDate] = useState(TODAY)
  const [sprouted, setSprouted] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    setNotice(null)

    if (!nickname.trim()) {
      setFormError('We need a name or nickname for the journal.')
      return
    }

    setSaving(true)
    try {
      await api.addJournalEntry({
        child_name_or_nickname: nickname.trim(),
        fruit_type: fruit,
        planted_date: plantedDate,
        sprout_date: sprouted ? plantedDate : null,
        note: note.trim() || undefined,
      })
      setNotice(`${nickname.trim()}'s ${fruit} seed is in the journal. Happy planting!`)
      setNickname('')
      setNote('')
      setSprouted(false)
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'We could not save that entry.')
    } finally {
      setSaving(false)
    }
  }

  async function removeEntry(id: number) {
    try {
      await api.deleteJournalEntry(id)
      reload()
    } catch {
      // Non-critical: the list refresh will simply show the entry again.
      reload()
    }
  }

  const entries = data ?? []
  const sorted = [...entries].sort((a, b) => b.planted_date.localeCompare(a.planted_date))

  return (
    <Section id="journal" aria-labelledby="journal-title" className="bg-cream-100">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Demo journal"
            title={<span id="journal-title">My growing journal</span>}
            lede="A little record book for real pots on real windowsills. Entries are saved to our database so you can come back and check on them."
            accent="#7D5A3F"
          />
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          {/* --- Form --- */}
          <Reveal direction="right">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-5xl bg-white p-6 shadow-soft ring-1 ring-sunny-300/60 sm:p-7"
              noValidate
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sunny-100" aria-hidden="true">
                  <Sprout size={28} animated />
                </span>
                <h3 className="font-display text-lg font-semibold text-seed-900">
                  Log a planted seed
                </h3>
              </div>

              <div>
                <label htmlFor="journal-nickname" className="mb-1.5 block text-sm font-semibold text-seed-800">
                  Name or nickname
                </label>
                <input
                  id="journal-nickname"
                  type="text"
                  required
                  maxLength={80}
                  placeholder="e.g. Mia"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 transition-shadow placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                />
              </div>

              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-seed-800">Which seed?</legend>
                <div className="flex flex-wrap gap-2">
                  {FRUIT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFruit(option.value)}
                      aria-pressed={fruit === option.value}
                      className={cx(
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all',
                        fruit === option.value
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="journal-date" className="mb-1.5 block text-sm font-semibold text-seed-800">
                    Date planted
                  </label>
                  <input
                    id="journal-date"
                    type="date"
                    value={plantedDate}
                    max={TODAY}
                    onChange={(event) => setPlantedDate(event.target.value)}
                    className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl bg-cream-50 px-4 py-3 ring-1 ring-seed-200 transition-colors hover:bg-leaf-50">
                    <input
                      type="checkbox"
                      checked={sprouted}
                      onChange={(event) => setSprouted(event.target.checked)}
                      className="h-5 w-5 rounded-md accent-leaf-600"
                    />
                    <span className="text-sm font-medium text-seed-800">It has sprouted!</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="journal-note" className="mb-1.5 block text-sm font-semibold text-seed-800">
                  Note <span className="font-normal text-seed-700/55">(optional)</span>
                </label>
                <input
                  id="journal-note"
                  type="text"
                  maxLength={240}
                  placeholder="e.g. Put the pot on the sunny window sill"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-seed-900 ring-1 ring-seed-200 placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}
              {notice && <SuccessBanner message={notice} />}

              <button
                type="submit"
                disabled={saving}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-sunny-400 px-6 py-3.5 text-base font-semibold text-seed-900 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-sunny-500 disabled:translate-y-0 disabled:opacity-60"
              >
                <Seed size={18} />
                {saving ? 'Saving…' : 'Add to my journal'}
              </button>
            </form>
          </Reveal>

          {/* --- Entries --- */}
          <Reveal direction="left" delay={0.1}>
            <div className="rounded-5xl bg-white/70 p-6 shadow-soft ring-1 ring-seed-200/60 sm:p-7">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-seed-900">
                  Seeds in the ground
                </h3>
                <span className="text-sm font-medium text-seed-700/60 tabular-nums">
                  {loading ? '…' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
                </span>
              </div>

              <div className="mt-5">
                {loading && (
                  <div role="status" aria-live="polite" className="space-y-3">
                    <span className="sr-only">Loading journal entries</span>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-2xl bg-cream-100" />
                    ))}
                  </div>
                )}

                {error && <ErrorState message={error} onRetry={reload} />}

                {!loading && !error && sorted.length === 0 && (
                  <EmptyState
                    emoji="📖"
                    title="No seeds logged yet"
                    message="Fill in the form and your first seed will appear here."
                  />
                )}

                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {sorted.map((entry) => {
                      const fruitMeta = FRUIT_OPTIONS.find((f) => f.value === entry.fruit_type)
                      return (
                        <motion.li
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: 16, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                          className="group flex items-start gap-3.5 rounded-2xl bg-cream-50 p-4 ring-1 ring-seed-200/70 transition-shadow hover:shadow-soft"
                        >
                          <span
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-soft"
                            aria-hidden="true"
                          >
                            {fruitMeta?.emoji ?? '🌱'}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold text-seed-900">
                              {entry.child_name_or_nickname}
                              <span className="font-sans text-sm font-normal text-seed-700/70">
                                {' '}
                                planted a {entry.fruit_type} seed
                              </span>
                            </p>

                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-seed-700/70">
                              <span>Planted {formatDate(entry.planted_date)}</span>
                              {entry.sprout_date && (
                                <span className="inline-flex items-center gap-1 font-semibold text-leaf-700">
                                  <Sprout size={14} animated={false} />
                                  Sprouted {formatDate(entry.sprout_date)}
                                </span>
                              )}
                            </p>

                            {entry.note && (
                              <p className="mt-1.5 text-pretty text-sm leading-snug text-seed-800/85">
                                “{entry.note}”
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            aria-label={`Remove ${entry.child_name_or_nickname}'s ${entry.fruit_type} entry`}
                            className="shrink-0 rounded-full p-2 text-seed-700/40 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                          >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                              <path
                                d="M5 5l10 10M15 5L5 15"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}

/** "12 Mar 2026" from an ISO date string. */
function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' })
}
