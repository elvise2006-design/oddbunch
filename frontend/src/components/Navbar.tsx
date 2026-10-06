/** Sticky, blurred navbar with an animated cart badge. */

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { Seed } from '@/components/Illustrations'
import { CART_ANCHOR_ID } from '@/components/flightConstants'
import { useCart } from '@/hooks/useCart'
import { cx } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/little-sprouts', label: 'Little Sprouts' },
  { to: '/daily-fresh', label: 'Daily Fresh' },
  { to: '/rare-collection', label: 'Rare Collection' },
  { to: '/about', label: 'Our Story' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()

  // Collapse the navbar's heavier styling once the user scrolls past the hero.
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  const isDarkRoute = location.pathname.startsWith('/rare-collection')

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-cream-50/80 shadow-[0_1px_0_0_rgba(51,37,28,0.08),0_10px_30px_-18px_rgba(35,66,38,0.5)] backdrop-blur-xl'
          : 'bg-transparent',
        // On the plum background the navbar goes translucent charcoal instead.
        isDarkRoute && scrolled && 'bg-plum-950/80',
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 sm:py-4"
      >
        {/* Wordmark */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-2xl py-1 pr-2"
          aria-label="Seedling and Vine, home"
        >
          <motion.span
            whileHover={{ rotate: [0, -14, 12, -6, 0], scale: 1.08 }}
            transition={{ duration: 0.7 }}
            className={cx(
              'grid h-10 w-10 place-items-center rounded-2xl shadow-soft',
              isDarkRoute ? 'bg-plum-900 ring-1 ring-gold-400/40' : 'bg-leaf-500',
            )}
          >
            <Seed size={22} color={isDarkRoute ? '#E9C46A' : '#FAF6EA'} />
          </motion.span>

          <span className="flex flex-col leading-none">
            <span
              className={cx(
                'font-display text-lg font-semibold tracking-tight transition-colors',
                isDarkRoute && scrolled ? 'text-cream-100' : 'text-seed-900',
              )}
            >
              Seedling <span className="text-leaf-500">&amp;</span> Vine
            </span>
            <span
              className={cx(
                'mt-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors',
                isDarkRoute && scrolled ? 'text-gold-300/80' : 'text-leaf-700/60',
              )}
            >
              Fruit with a future
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isDarkRoute && scrolled
                      ? 'text-cream-200/80 hover:text-cream-100'
                      : 'text-seed-800/80 hover:text-seed-900',
                    isActive && (isDarkRoute && scrolled ? 'text-gold-300' : 'text-leaf-700'),
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className={cx(
                          'absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full',
                          isDarkRoute && scrolled ? 'bg-gold-400' : 'bg-leaf-500',
                        )}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <CartButton isDark={isDarkRoute && scrolled} />

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cx(
              'grid h-11 w-11 place-items-center rounded-2xl transition-colors lg:hidden',
              isDarkRoute && scrolled
                ? 'bg-white/10 text-cream-100'
                : 'bg-white/70 text-seed-900 ring-1 ring-seed-200',
            )}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <motion.path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={open ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
                style={{ originX: '10px', originY: '10px' }}
              />
              <motion.path
                d="M3 14h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={open ? { opacity: 0 } : { opacity: 1 }}
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-seed-200/60 bg-cream-50/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8">
              {[...NAV_LINKS, { to: '/contact', label: 'Contact' }, { to: '/cart', label: 'Cart' }].map(
                (link, index) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.045 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cx(
                          'block rounded-2xl px-3 py-3 text-base font-medium transition-colors',
                          isActive ? 'bg-leaf-100 text-leaf-800' : 'text-seed-800 hover:bg-seed-100/60',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ),
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function CartButton({ isDark }: { isDark: boolean }) {
  const { itemCount } = useCart()

  return (
    <Link
      to="/cart"
      id={CART_ANCHOR_ID}
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      className={cx(
        'group relative grid h-11 w-11 place-items-center rounded-2xl transition-all duration-200 hover:scale-105',
        isDark ? 'bg-white/10 text-cream-100' : 'bg-white/75 text-seed-900 ring-1 ring-seed-200',
      )}
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-rotate-6"
      >
        {/* Tote bag body */}
        <path
          d="M4.5 8h15l-1.2 11.2a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L4.5 8Z"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        {/* Handles */}
        <path
          d="M8.8 8V6.4a3.2 3.2 0 0 1 6.4 0V8"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        {/* Seed inside the bag */}
        <path d="M12 12.4c1.9 1.7 3 3.6 3 5.4a3 3 0 0 1-6 0c0-1.8 1.1-3.7 3-5.4Z" fill="currentColor" opacity="0.28" />
      </svg>

      {/* Badge — pops whenever the count changes */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.35, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              'absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold tabular-nums',
              isDark ? 'bg-gold-400 text-plum-950' : 'bg-sunny-500 text-white',
            )}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
