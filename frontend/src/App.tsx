/**
 * App shell: route table, shared layout, and the scroll-to-top behaviour that
 * keeps long pages from restoring a stale scroll offset.
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { Footer } from '@/components/Footer'
import { FlyToCartLayer } from '@/components/FlyToCartLayer'
import { Navbar } from '@/components/Navbar'
import { CartProvider } from '@/hooks/useCart'
import Home from '@/pages/Home'

// Everything except the landing page is code-split.
const LittleSprouts = lazy(() => import('@/pages/LittleSprouts'))
const DailyFresh = lazy(() => import('@/pages/DailyFresh'))
const RareCollection = lazy(() => import('@/pages/RareCollection'))
const Cart = lazy(() => import('@/pages/Cart'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Full-page loading state shown while a lazy route chunk downloads. */
function RouteFallback() {
  return (
    <div className="grid min-h-[70vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-ping rounded-full bg-leaf-300/40" />
          <div className="relative grid h-14 w-14 place-items-center rounded-full bg-leaf-500 text-white">
            🌱
          </div>
        </div>
        <span className="text-sm font-medium text-seed-700/70">Growing the page…</span>
      </div>
    </div>
  )
}

/** Jumps to the top on route change, but honours in-page hash links. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Let the target element mount before scrolling to it.
      const timer = window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 120)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}

/** Subtle page cross-fade between routes. */
function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  const location = useLocation()

  if (reduced) return <>{children}</>

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <CartProvider>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only rounded-2xl bg-leaf-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="min-h-screen">
        <PageTransition>
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/little-sprouts" element={<LittleSprouts />} />
              <Route path="/daily-fresh" element={<DailyFresh />} />
              <Route path="/rare-collection" element={<RareCollection />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </main>

      <Footer />
      <FlyToCartLayer />
    </CartProvider>
  )
}
