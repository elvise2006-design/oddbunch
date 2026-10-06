/**
 * CategoryBlock — the three audience blocks in the middle of the home page.
 * Each block navigates to its own page and has its own personality:
 * wiggling sprout, clean grid, and a plum/gold shimmer.
 */

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { Leaf, Sprout } from '@/components/Illustrations'
import { CATEGORIES, type CategoryDef } from '@/data/site'
import { cx, useReducedMotion } from '@/lib/utils'

export function CategoryBlocks({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        'grid gap-5 sm:gap-6 lg:grid-cols-3',
        className,
      )}
    >
      {CATEGORIES.map((category, index) => (
        <CategoryBlock key={category.key} category={category} index={index} />
      ))}
    </div>
  )
}

function CategoryBlock({ category, index }: { category: CategoryDef; index: number }) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()

  // Subtle 3D tilt, mirrored so the "stagger" reads left-to-right.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 })

  function handleMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function reset() {
    px.set(0)
    py.set(0)
  }

  const isDark = category.key === 'collector'

  return (
    <motion.button
      type="button"
      onClick={() => navigate(category.path)}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      aria-label={`${category.title}. ${category.tagline}. Go to ${category.title}.`}
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-5xl p-6 text-left',
        'ring-1 transition-shadow duration-300 sm:p-7',
        category.bg,
        category.text,
        isDark ? 'ring-white/10' : 'ring-white/60',
        category.ring,
        'hover:shadow-lift focus-visible:outline-offset-4',
        category.glow,
      )}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.62,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* --- Decorative layers --- */}
      {isDark ? (
        <>
          {/* Holographic sweep on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              backgroundImage:
                'linear-gradient(100deg, transparent 20%, rgba(243,217,139,0.20) 42%, rgba(255,255,255,0.30) 50%, rgba(243,217,139,0.20) 58%, transparent 80%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.6s linear infinite',
            }}
          />
          <span aria-hidden="true" className="foil pointer-events-none absolute inset-0 opacity-40" />
        </>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="blob absolute -top-14 -right-10 h-40 w-40 opacity-40 transition-transform duration-500 group-hover:scale-125"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
          />
          <Leaf
            size={110}
            animated
            className="pointer-events-none absolute -right-4 -bottom-5 opacity-25 transition-transform duration-500 group-hover:rotate-12"
            color={isDark ? '#E3D5F0' : '#4F9E4A'}
          />
        </>
      )}

      {/* --- Content --- */}
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cx(
            'rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.16em] uppercase',
            isDark ? 'bg-gold-400/15 text-gold-300' : 'bg-white/70 text-seed-700',
          )}
        >
          {category.key === 'kids'
            ? 'Ages 4–12'
            : category.key === 'normal'
              ? 'Everyday'
              : 'Edition of 250'}
        </span>

        <BlockIcon categoryKey={category.key} isDark={isDark} />
      </div>

      <h3 className="relative mt-5 font-display text-2xl leading-tight font-semibold text-balance sm:text-[1.7rem]">
        {category.title}
      </h3>

      {/* Tagline rendered larger for the Rare Collection's editorial feel */}
      <p
        className={cx(
          'relative mt-2 text-pretty font-medium text-balance',
          isDark ? 'text-[1.05rem] text-cream-100' : 'text-[0.98rem]',
        )}
      >
        {category.tagline}
      </p>

      <p className={cx('relative mt-3 line-clamp-3 text-sm leading-relaxed', category.muted)}>
        {category.blurb}
      </p>

      <span
        className={cx(
          'relative mt-6 inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold',
          'transition-all duration-200 group-hover:gap-3',
          isDark
            ? 'bg-gold-300 text-plum-950'
            : category.key === 'kids'
              ? 'bg-seed-900 text-cream-100'
              : 'bg-leaf-600 text-white',
        )}
      >
        {category.cta}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </span>
    </motion.button>
  )
}

/** Per-category icon: wiggling sprout, clean stack, or sculpted skull. */
function BlockIcon({ categoryKey, isDark }: { categoryKey: CategoryDef['key']; isDark: boolean }) {
  if (categoryKey === 'kids') {
    return (
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/75 shadow-inner">
        <Sprout size={46} animated />
      </span>
    )
  }

  if (categoryKey === 'normal') {
    return (
      <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-inner">
        {/* A neat, calm stack of juice boxes */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <rect x="6" y="18" width="12" height="20" rx="3" fill="#4F9E4A" />
          <rect x="20" y="12" width="12" height="26" rx="3" fill="#6FB96A" />
          <rect x="34" y="22" width="6" height="16" rx="3" fill="#96D091" />
          <path d="M26 18v5" stroke="#FAF6EA" strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="26" r="3.2" fill="#FAF6EA" opacity="0.9" />
        </svg>
      </span>
    )
  }

  return (
    <span
      className={cx(
        'grid h-16 w-16 place-items-center rounded-2xl',
        isDark ? 'bg-white/10 ring-1 ring-gold-400/30' : 'bg-white',
      )}
    >
      <svg width="44" height="52" viewBox="0 0 120 150" fill="none" aria-hidden="true" className="scale-[0.34]">
        <path
          d="M60 20c-24 0-42 17-42 40 0 14 4 22 9 29 4 6 5 10 5 17 0 12 12 20 28 20s28-8 28-20c0-7 1-11 5-17 5-7 9-15 9-29 0-23-18-40-42-40Z"
          fill="#EDE4F2"
          stroke="#E3D5F0"
          strokeWidth="2"
        />
        <ellipse cx="47" cy="62" rx="9" ry="11" fill="#2A0B22" />
        <ellipse cx="73" cy="62" rx="9" ry="11" fill="#2A0B22" />
        <path d="M60 74l-4.5 7h9L60 74Z" fill="#2A0B22" />
        <rect x="48" y="95" width="24" height="11" rx="2.5" fill="#2A0B22" />
        <rect x="48" y="2" width="24" height="11" rx="3.5" fill="#E3B85B" />
      </svg>
    </span>
  )
}
