/** About — the story behind the seeds and the sculpted bottles. */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Leaf, Seed, Sprout, WaveDivider } from '@/components/Illustrations'
import { SculptedBottle } from '@/components/SculptedBottle'
import { Container, Reveal, Section, SectionTitle, Stagger, StaggerItem } from '@/components/ui'
import { BOTTLE_SHAPES } from '@/data/site'
import { CATEGORIES } from '@/data/site'
import type { BottleShape } from '@/lib/api'

const TIMELINE = [
  {
    year: '2016',
    title: 'A factory bin of juice',
    body: 'Our founder threw away a carton because the straw hole had gone soft. Her daughter peeled the label off the back and asked what the brown thing underneath was. It was a date stamp. The idea took two years to become real.',
  },
  {
    year: '2019',
    title: 'The first Apple Seed Sprout Pack',
    body: 'Twelve thousand cartons went out to three schools in Guelph. Nine hundred seeds were planted. We tracked every one by postcard — which is how we discovered that a third of them had been eaten by squirrels.',
  },
  {
    year: '2021',
    title: 'Apple Classic, the original sculpt',
    body: 'A glassmaker in Hamilton agreed to mould a bottle in the shape of an apple, on the condition we buy the entire run. We did. Fifteen hundred bottles. We still get letters about it.',
  },
  {
    year: '2024',
    title: 'Skull Edition',
    body: 'Two hundred and fifty bottles, black Muscat elixir, bone-white glass. It sold out in nine days. We retired the mould that afternoon rather than make a second run.',
  },
]

export default function About() {
  return (
    <>
      {/* --- Hero --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-cream-50 to-cream-100 pt-28 pb-16 sm:pt-36 lg:pt-44">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-leaf-200/45 blur-3xl" />
          <div className="absolute top-20 -right-24 h-80 w-80 rounded-full bg-sunny-300/35 blur-3xl" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-leaf-700 uppercase ring-1 ring-leaf-200 shadow-soft"
            >
              <Sprout size={16} />
              Our story
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mt-6 text-balance text-4xl leading-[1.05] font-semibold text-seed-900 sm:text-5xl lg:text-6xl"
            >
              Two ideas we could not stop thinking about
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-6 text-pretty text-lg leading-relaxed text-seed-700/85"
            >
              Seedling &amp; Vine started with a sticker a child was not supposed to peel off. Ten years
              later it has become two very different products, built for two very different people,
              and we have never managed to combine them.
            </motion.p>
          </div>
        </Container>

        <div className="mt-12">
          <WaveDivider fill="#FAF6EA" />
        </div>
      </section>

      {/* --- Why a seed in the pack --- */}
      <Section aria-labelledby="seed-idea-title">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal direction="right">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sunny-400/20 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-sunny-600 uppercase">
                  Idea one
                </span>
                <h2
                  id="seed-idea-title"
                  className="mt-4 text-balance text-3xl leading-tight font-semibold text-seed-900 sm:text-4xl"
                >
                  Why every kids&rsquo; pack hides a seed
                </h2>

                <div className="mt-6 space-y-4 text-pretty leading-relaxed text-seed-800/85">
                  <p>
                    A juice box is a thing you drink and throw away. It takes about nine minutes. That
                    is a wasted object — and for a child, waste is the default setting of most things
                    they touch.
                  </p>
                  <p>
                    So we put a seed under the sticker instead. It costs us about four cents. It makes
                    the packaging the beginning of something rather than the end of it, and it gives a
                    kid a reason to be patient, which is a genuinely hard thing to buy.
                  </p>
                  <p>
                    We are careful about the claim, though: a tree grown from seed does not breed true.
                    The apple will be an apple, but it will not be <em>that</em> apple. We tell kids that
                    directly, because a company that lies about seeds does not deserve to be trusted
                    with gardens.
                  </p>
                </div>

                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    ['One real, viable seed', 'Not a souvenir. Tested for germination before packing.'],
                    ['Printed growing guide', 'Soil depth, sunlight, and days-to-sprout for each fruit.'],
                    ['Horticulturist reviewed', 'Every guide signed off by our growing consultant.'],
                    ['Squirrel-proof advice', 'Yes, we thought about the squirrels. Yes, it helps.'],
                  ].map(([title, body]) => (
                    <li key={title} className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-sunny-300/50">
                      <p className="flex items-center gap-2 font-display text-sm font-semibold text-seed-900">
                        <Seed size={16} />
                        {title}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-seed-700/80">{body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Artwork column */}
            <Reveal direction="left" delay={0.1}>
              <div className="relative mx-auto grid max-w-md place-items-center">
                <div
                  aria-hidden="true"
                  className="absolute h-80 w-80 rounded-full bg-sunny-300/30 blur-3xl"
                />
                {/* Sticker peeling away from the seed */}
                <div className="relative grid h-72 w-72 place-items-center">
                  <motion.div
                    className="absolute h-40 w-40 rounded-4xl bg-white shadow-lift"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    initial={{ rotate: 0, opacity: 1 }}
                    whileInView={{ rotate: -28, x: 44, y: -44, opacity: 0.35 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute grid h-28 w-36 place-items-center rounded-3xl bg-sunny-300 shadow-lift ring-2 ring-dashed ring-sunny-500/60"
                  >
                    <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-seed-900 uppercase">
                      <Leaf size={13} /> Peel here
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 1.1 }}
                    className="relative grid h-24 w-24 place-items-center rounded-full bg-leaf-50 shadow-lift ring-1 ring-leaf-300"
                  >
                    <Seed size={48} animated />
                  </motion.div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* --- Why sculpted bottles --- */}
      <Section
        aria-labelledby="bottle-idea-title"
        className="relative overflow-hidden bg-gradient-to-b from-plum-950 via-plum-900 to-plum-950 text-cream-100"
        data-theme="dark"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-plum-700/30 blur-3xl" />
          {Array.from({ length: 18 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-gold-300"
              style={{
                left: `${(i * 57.1) % 95}%`,
                top: `${(i * 33.7) % 90}%`,
                width: 1 + ((i * 3) % 2),
                height: 1 + ((i * 3) % 2),
              }}
              animate={{ opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: 3 + (i % 4), delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </div>

        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal direction="right">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/12 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-gold-300 uppercase ring-1 ring-gold-400/35">
                  Idea two
                </span>
                <h2
                  id="bottle-idea-title"
                  className="mt-4 text-balance text-3xl leading-tight font-semibold text-cream-50 sm:text-4xl"
                >
                  Why the collector bottles are sculpted
                </h2>

                <div className="mt-6 space-y-4 text-pretty leading-relaxed text-cream-200/80">
                  <p>
                    We tried the obvious version first: fancy glass, heavy paper, a ribbon. It looked
                    expensive and it read as packaging. It was a bottle with better manners.
                  </p>
                  <p>
                    The sculpts came out of a different question: what if the bottle <em>was</em> the
                    fruit? A skull-shaped bottle of black Muscat is a thing you recognise from across a
                    room. An apple-shaped bottle is the product, and the juice is what happened to it.
                  </p>
                  <p>
                    Every mould is single-use. We buy the run, we sell it, and then the shape is gone —
                    which is the whole point. Scarcity you can see is worth more than scarcity printed
                    in small type.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    ['1', 'glass mould per sculpt'],
                    ['0', 'reissues, ever'],
                    ['250', 'bottles in the Skull run'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-3xl bg-white/[0.05] p-4 ring-1 ring-white/10">
                      <span className="block font-display text-2xl leading-none font-semibold text-gold-300">
                        {value}
                      </span>
                      <span className="mt-1.5 block text-xs leading-snug text-cream-200/65">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* The bottle family */}
            <Reveal direction="left" delay={0.1}>
              <div className="grid grid-cols-3 gap-4">
                {(Object.keys(BOTTLE_SHAPES) as BottleShape[]).map((shape, index) => (
                  <motion.div
                    key={shape}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -8 }}
                    className="flex flex-col items-center rounded-4xl bg-white/[0.05] p-4 ring-1 ring-white/10"
                  >
                    <SculptedBottle shape={shape} size={92} />
                    <span className="mt-2 text-center text-[11px] font-semibold text-cream-200/75">
                      {BOTTLE_SHAPES[shape].label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* --- Timeline --- */}
      <Section aria-labelledby="timeline-title" className="bg-cream-100">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="How we got here"
              title={<span id="timeline-title">Ten years, roughly</span>}
              accent="#7D5A3F"
            />
          </Reveal>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-2" as="ol">
            {TIMELINE.map((entry) => (
              <StaggerItem
                key={entry.year}
                as="li"
                className="relative rounded-4xl bg-white p-6 shadow-soft ring-1 ring-seed-200/70"
              >
                <span className="inline-flex rounded-full bg-leaf-100 px-3 py-1 font-display text-sm font-semibold text-leaf-800">
                  {entry.year}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-balance text-seed-900">
                  {entry.title}
                </h3>
                <p className="mt-2.5 text-pretty leading-relaxed text-seed-700/85">{entry.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* --- Three collections recap + CTA --- */}
      <Section className="bg-cream-50" aria-labelledby="collections-title">
        <Container>
          <Reveal>
            <SectionTitle
              title={<span id="collections-title">Still three separate things</span>}
              lede="We get asked to merge them all the time. Here is why we have not."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {CATEGORIES.map((category, index) => (
              <Reveal key={category.key} delay={index * 0.1}>
                <Link
                  to={category.path}
                  className="group flex h-full flex-col rounded-5xl bg-white p-6 shadow-soft ring-1 ring-seed-200/70 transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-seed-900">
                    {category.title}
                  </h3>
                  <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-seed-700/80">
                    {category.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700 transition-transform group-hover:translate-x-1">
                    {category.cta} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-14 rounded-5xl bg-seed-900 p-9 text-center text-cream-100 sm:p-12">
              <Leaf size={48} animated color="#96D091" className="mx-auto" />
              <h2 className="mt-5 text-balance text-2xl font-semibold sm:text-3xl">
                Have a question we have not answered?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-cream-200/75">
                Wholesale, press, or a genuinely difficult question about germinating a mango stone —
                we answer all of them, usually badly and much too quickly.
              </p>
              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-leaf-300 px-7 py-3.5 text-base font-semibold text-leaf-950 transition-all hover:-translate-y-0.5"
              >
                Get in touch
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
