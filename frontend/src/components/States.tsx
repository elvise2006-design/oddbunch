/** Loading skeletons and error/empty states shared by every data-driven view. */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { cx } from '@/lib/utils'

/** Generic card-shaped shimmer block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx('animate-pulse rounded-2xl bg-seed-200/70', className)}
      aria-hidden="true"
    />
  )
}

/** Full-section loading placeholder with a friendly label. */
export function LoadingBlock({ label = 'Gathering fruit…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="w-full">
      <span className="sr-only">{label}</span>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className={cx('h-20 w-full', i === 0 && 'h-24')} />
        ))}
      </div>
    </div>
  )
}

/** Card grid placeholder that matches ProductCard's footprint. */
export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading products"
      className={cx('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-4xl bg-white p-5 shadow-soft ring-1 ring-seed-200/60">
          <div className="flex items-start justify-between">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-6 flex items-end justify-between">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Friendly error panel with a retry affordance. */
export function ErrorState({
  title = 'Something went sideways',
  message,
  onRetry,
  className,
}: {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className={cx(
        'flex flex-col items-center gap-3 rounded-4xl bg-white p-8 text-center shadow-soft ring-1 ring-red-200',
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-3xl" aria-hidden="true">
        🍂
      </span>
      <h3 className="font-display text-lg font-semibold text-seed-900">{title}</h3>
      <p className="max-w-md text-pretty text-sm leading-relaxed text-seed-700/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-full bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-700"
        >
          Try again
        </button>
      )}
    </motion.div>
  )
}

/** Empty result set (e.g. filters matched nothing). */
export function EmptyState({
  emoji = '🍃',
  title,
  message,
  action,
  className,
}: {
  emoji?: string
  title: string
  message?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-3 rounded-4xl border-2 border-dashed border-seed-300/70 bg-white/50 p-10 text-center',
        className,
      )}
    >
      <span className="text-4xl" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="font-display text-lg font-semibold text-seed-900">{title}</h3>
      {message && <p className="max-w-sm text-pretty text-sm text-seed-700/75">{message}</p>}
      {action}
    </div>
  )
}

/** Inline success banner used by the newsletter, contact and journal forms. */
export function SuccessBanner({ message, className }: { message: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      role="status"
      className={cx(
        'flex items-center gap-2.5 rounded-2xl bg-leaf-100 px-4 py-3 text-sm font-medium text-leaf-800 ring-1 ring-leaf-300',
        className,
      )}
    >
      <span aria-hidden="true">🌱</span>
      {message}
    </motion.div>
  )
}
