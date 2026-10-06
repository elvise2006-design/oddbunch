/** Cart + demo checkout. No payment is ever taken. */

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Seed, WaveDivider } from '@/components/Illustrations'
import { SculptedBottle } from '@/components/SculptedBottle'
import { EmptyState, ErrorState, SuccessBanner } from '@/components/States'
import { Container, Reveal, Section } from '@/components/ui'
import { useCart } from '@/hooks/useCart'
import { api, type CartItem, type Order } from '@/lib/api'
import { BOTTLE_SHAPES } from '@/data/site'
import { cx, formatCAD, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

export default function Cart() {
  const { items, itemCount, subtotal, shipping, total, loading, error, setQuantity, removeItem, reload } =
    useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  // Keep the summary in sync if the cart was changed on another page.
  useEffect(() => {
    if (items.length === 0) void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (order) return <OrderConfirmation order={order} />

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <>
      <PageHeader itemCount={itemCount} />

      <Section className="bg-cream-100">
        <Container>
          {loading && (
            <div role="status" aria-live="polite" className="space-y-4">
              <span className="sr-only">Loading your cart</span>
              {[0, 1].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-4xl bg-white/70" />
              ))}
            </div>
          )}

          {error && <ErrorState message={error} onRetry={reload} className="mx-auto max-w-xl" />}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              emoji="🧺"
              title="Your basket is empty"
              message="Nothing here yet. The Little Sprouts packs are the most fun place to start."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/little-sprouts"
                    className="rounded-full bg-sunny-400 px-5 py-2.5 text-sm font-semibold text-seed-900 hover:bg-sunny-500"
                  >
                    Little Sprouts
                  </Link>
                  <Link
                    to="/daily-fresh"
                    className="rounded-full bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700"
                  >
                    Daily Fresh
                  </Link>
                  <Link
                    to="/rare-collection"
                    className="rounded-full bg-plum-900 px-5 py-2.5 text-sm font-semibold text-gold-300 hover:bg-plum-800"
                  >
                    Rare Collection
                  </Link>
                </div>
              }
            />
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
              {/* --- Line items --- */}
              <div>
                <ul className="space-y-4">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <CartLineItem
                          item={item}
                          onQuantityChange={(quantity) => void setQuantity(item.id, quantity)}
                          onRemove={() => void removeItem(item.id)}
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {/* Free shipping progress */}
                <div className="mt-6 rounded-4xl bg-white p-5 shadow-soft ring-1 ring-seed-200/70">
                  <p className="text-sm font-medium text-seed-800">
                    {remaining > 0 ? (
                      <>
                        You are{' '}
                        <strong className="font-semibold text-leaf-700 tabular-nums">
                          {formatCAD(remaining)}
                        </strong>{' '}
                        away from free shipping.
                      </>
                    ) : (
                      <span className="font-semibold text-leaf-700">
                        Free shipping unlocked. Nice.
                      </span>
                    )}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-seed-200/70">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-leaf-400 to-leaf-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>

              {/* --- Summary + checkout --- */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-5xl bg-white p-6 shadow-lift ring-1 ring-seed-200/70 sm:p-7">
                  <h2 className="font-display text-xl font-semibold text-seed-900">Order summary</h2>

                  <dl className="mt-5 space-y-3 text-sm">
                    <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}>
                      <AnimateNumber value={subtotal} prefix="$" />
                    </Row>
                    <Row label="Shipping">
                      {shipping === 0 ? (
                        <span className="font-semibold text-leaf-700">Free</span>
                      ) : (
                        <AnimateNumber value={shipping} prefix="$" />
                      )}
                    </Row>
                    <Row label="Tax (demo — not charged)">
                      <span className="text-seed-700/55">$0.00</span>
                    </Row>
                  </dl>

                  <div className="mt-5 flex items-baseline justify-between border-t border-seed-200 pt-5">
                    <span className="font-display text-base font-semibold text-seed-900">Total</span>
                    <AnimateNumber value={total} prefix="$" className="font-display text-2xl font-semibold text-seed-900" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf-600 px-6 py-4 text-base font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-leaf-700"
                  >
                    <Seed size={18} color="#FAF6EA" />
                    Demo checkout
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                  <p className="mt-3 text-center text-xs leading-relaxed text-seed-700/60">
                    This is a demo storefront. No card details are collected and nothing is charged.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>

      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            onClose={() => setCheckoutOpen(false)}
            onPlaced={(placed) => {
              setCheckoutOpen(false)
              setOrder(placed)
              void reload()
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------

function PageHeader({ itemCount }: { itemCount: number }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-cream-50 to-cream-100 pt-28 pb-14 sm:pt-36">
      <Container className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-leaf-700 uppercase ring-1 ring-leaf-200 shadow-soft">
          <span className="h-2 w-2 rounded-full bg-sunny-400" aria-hidden="true" />
          {itemCount === 0 ? 'Nothing here yet' : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        </span>
        <h1 className="mt-6 text-balance text-4xl leading-[1.05] font-semibold text-seed-900 sm:text-5xl">
          Your basket
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-seed-700/80">
          Quantities update instantly. Checkout is a demonstration — no payment details are taken and
          no order leaves the building.
        </p>
      </Container>
      <div className="mt-10">
        <WaveDivider fill="#FAF6EA" />
      </div>
    </section>
  )
}

function CartLineItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  const { product } = item
  const isCollector = product.category === 'collector'
  const shape = (product.bottle_shape ?? 'apple') as keyof typeof BOTTLE_SHAPES

  return (
    <div className="flex gap-4 rounded-4xl bg-white p-4 shadow-soft ring-1 ring-seed-200/70 sm:p-5">
      {/* Thumbnail */}
      <div
        className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl text-4xl sm:h-28 sm:w-28 sm:text-5xl"
        style={{ backgroundColor: `${product.accent}1A` }}
        aria-hidden="true"
      >
        {isCollector ? (
          <SculptedBottle shape={shape} size={72} animated={false} />
        ) : (
          product.emoji
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wide text-seed-700/55 uppercase">
              {isCollector ? product.rarity : product.category === 'kids' ? 'Seed inside' : product.fruit_type}
            </p>
            <h3 className="mt-0.5 truncate font-display text-base font-semibold text-seed-900 sm:text-lg">
              {product.name}
            </h3>
            {item.is_subscription && (
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-2.5 py-1 text-[11px] font-semibold text-leaf-800">
                Subscription &middot;{' '}
                {item.subscription_cadence === 'weekly' ? 'Every week' : 'Every two weeks'}
              </span>
            )}
          </div>

          <p className="shrink-0 font-display text-lg font-semibold text-seed-900 tabular-nums">
            {formatCAD(product.price * item.quantity)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {/* Quantity stepper */}
          <div className="inline-flex items-center rounded-full bg-cream-100 ring-1 ring-seed-200">
            <button
              type="button"
              onClick={() => onQuantityChange(item.quantity - 1)}
              aria-label={`Decrease quantity of ${product.name}`}
              className="grid h-9 w-9 place-items-center rounded-full text-seed-800 transition-colors hover:bg-white"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 10h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>

            <span
              aria-live="polite"
              className="min-w-9 text-center text-sm font-semibold text-seed-900 tabular-nums"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={isCollector && item.quantity >= product.stock}
              aria-label={`Increase quantity of ${product.name}`}
              className="grid h-9 w-9 place-items-center rounded-full text-seed-800 transition-colors hover:bg-white disabled:opacity-35"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-seed-700/55">
              {formatCAD(product.price)} each
            </span>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${product.name} from your cart`}
              className="text-sm font-semibold text-seed-700/60 underline underline-offset-4 transition-colors hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-seed-700/75">{label}</dt>
      <dd className="font-semibold text-seed-900 tabular-nums">{children}</dd>
    </div>
  )
}

/** Rolls a number up/down when it changes, with a subtle scale pop. */
function AnimateNumber({
  value,
  prefix,
  className,
}: {
  value: number
  prefix?: string
  className?: string
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cx('tabular-nums', className)}
    >
      {prefix}
      {value.toFixed(2)}
    </motion.span>
  )
}

// ---------------------------------------------------------------------------

function CheckoutModal({
  onClose,
  onPlaced,
}: {
  onClose: () => void
  onPlaced: (order: Order) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    // Lock the page behind the modal, and close on Escape.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (name.trim().length < 2) return setFormError('Please tell us who the order is for.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setFormError('That email address looks a little off.')
    if (address.trim().length < 6) return setFormError('We need a little more than that for an address.')

    setSubmitting(true)
    try {
      const placed = await api.createOrder({
        customer_name: name.trim(),
        email: email.trim(),
        address: address.trim(),
      })
      onPlaced(placed)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'We could not place the demo order.')
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-70 grid place-items-center bg-seed-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-5xl bg-cream-50 p-7 shadow-lift sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="checkout-title" className="font-display text-2xl font-semibold text-seed-900">
              Demo checkout
            </h2>
            <p className="mt-1.5 text-sm text-seed-700/75">
              Saved to the database as an order. Nothing is charged.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-seed-100 text-seed-800 transition-colors hover:bg-seed-200"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Field
            id="checkout-name"
            label="Full name"
            value={name}
            onChange={setName}
            placeholder="Priya Nair"
            autoComplete="name"
          />
          <Field
            id="checkout-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            id="checkout-address"
            label="Shipping address"
            value={address}
            onChange={setAddress}
            placeholder="88 Vine St, Toronto, ON"
            autoComplete="street-address"
          />

          {formError && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          <div className="rounded-2xl bg-sunny-300/30 px-4 py-3 text-xs leading-relaxed text-seed-800 ring-1 ring-sunny-400/40">
            <strong className="font-semibold">Reminder:</strong> this is a portfolio demo. We do not
            collect payment, and no card field exists on purpose.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-leaf-600 px-6 py-4 text-base font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-leaf-700 disabled:translate-y-0 disabled:opacity-60"
          >
            {submitting ? 'Placing order…' : 'Place demo order'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-seed-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl bg-white px-4 py-3 text-seed-900 ring-1 ring-seed-200 transition-shadow placeholder:text-seed-700/35 focus:ring-2 focus:ring-leaf-400 focus:outline-none"
      />
    </div>
  )
}

function OrderConfirmation({ order }: { order: Order }) {
  return (
    <Section className="bg-cream-100 pt-32 sm:pt-40">
      <Container size="narrow">
        <Reveal>
          <div className="flex flex-col items-center rounded-5xl bg-white p-9 text-center shadow-lift ring-1 ring-leaf-200 sm:p-12">
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 13, delay: 0.15 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-leaf-100 text-4xl"
              aria-hidden="true"
            >
              🌳
            </motion.span>

            <h1 className="mt-6 text-balance text-3xl font-semibold text-seed-900 sm:text-4xl">
              Demo order #{order.id} placed
            </h1>
            <p className="mt-3 text-pretty leading-relaxed text-seed-700/80">
              Thank you, {order.customer_name.split(' ')[0]}. We saved this order to the SQLite
              database — you can see it at <code className="rounded bg-seed-100 px-1.5 py-0.5 text-sm">GET /api/orders</code>.
              No payment was taken.
            </p>

            <div className="mt-7 w-full rounded-3xl bg-cream-50 p-5 text-left ring-1 ring-seed-200">
              <p className="text-xs font-bold tracking-wide text-seed-700/60 uppercase">Order summary</p>
              <ul className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-seed-800">
                      {item.product_name}{' '}
                      <span className="text-seed-700/55">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-seed-900 tabular-nums">
                      {formatCAD(item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-seed-200 pt-4">
                <span className="font-display font-semibold text-seed-900">Total</span>
                <span className="font-display text-xl font-semibold text-seed-900 tabular-nums">
                  {formatCAD(order.total)}
                </span>
              </div>
            </div>

            <SuccessBanner
              className="mt-6 w-full"
              message={`Confirmation sent to ${order.email}`}
            />

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-leaf-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-leaf-700"
              >
                Back to home
              </Link>
              <Link
                to="/daily-fresh"
                className="rounded-full bg-cream-100 px-6 py-3 text-sm font-semibold text-seed-900 ring-1 ring-seed-200 transition-colors hover:bg-leaf-50"
              >
                Keep shopping
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
