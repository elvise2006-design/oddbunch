/** Site footer with the brand's two-sentence manifesto and link columns. */

import { Link } from 'react-router-dom'

import { Leaf, Seed, Sprout, WaveDivider } from '@/components/Illustrations'
import { Container, Reveal } from '@/components/ui'
import { FOOTER_LINKS } from '@/data/site'
import { API_BASE_URL } from '@/lib/api'

// Evaluated once at module load rather than on every render.
const COPYRIGHT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="relative mt-8 bg-seed-900 text-cream-200">
      <WaveDivider fill="#33251C" flip className="absolute inset-x-0 -top-px rotate-180" />

      <Container className="relative pt-16 pb-10 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand column */}
          <Reveal direction="up">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Seedling and Vine, home">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-500">
                <Seed size={24} color="#FAF6EA" />
              </span>
              <span className="font-display text-xl font-semibold text-cream-50">
                Seedling <span className="text-leaf-300">&amp;</span> Vine
              </span>
            </Link>

            <p className="mt-5 max-w-md text-pretty leading-relaxed text-cream-200/75">
              We are a fruit company with two obsessions: putting a real seed in every kids&rsquo; pack,
              and pouring juice into glass that is worth keeping on a shelf.
            </p>

            <div className="mt-6 flex items-center gap-4" aria-hidden="true">
              <Sprout size={40} animated />
              <Leaf size={34} animated flip />
              <Leaf size={26} animated />
            </div>
          </Reveal>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links], columnIndex) => (
            <Reveal key={heading} direction="up" delay={0.1 + columnIndex * 0.08}>
              <h3 className="font-display text-sm font-semibold tracking-[0.18em] text-leaf-300 uppercase">
                {heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => {
                  // The API docs link points at the backend, not an internal route.
                  const isExternal = link.to.startsWith('http') || link.to === '/api-docs'
                  return (
                    <li key={link.to}>
                      {isExternal ? (
                        <a
                          href={API_BASE_URL.replace(/\/api$/, '') + '/docs'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cream-200/75 transition-colors hover:text-leaf-200"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-cream-200/75 transition-colors hover:text-leaf-200"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-200/12 pt-7 text-sm text-cream-200/55 sm:flex-row">
          <p>
            &copy; {COPYRIGHT_YEAR} Seedling &amp; Vine. A demo storefront — no real orders, no real seeds
            shipped.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-leaf-400" aria-hidden="true" />
            Grown in Ontario &middot; Priced in CAD
          </p>
        </div>
      </Container>
    </footer>
  )
}
