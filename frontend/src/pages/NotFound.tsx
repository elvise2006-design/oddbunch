/** 404 page. */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Seed, WaveDivider } from '@/components/Illustrations'
import { Container } from '@/components/ui'

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-cream-50 to-cream-100 pt-32 pb-20 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-leaf-200/50 blur-3xl" />
      </div>

      <Container className="relative">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-lift ring-1 ring-seed-200"
          >
            <Seed size={52} animated color="#9C7350" />
          </motion.div>

          <h1 className="mt-8 text-balance text-4xl leading-tight font-semibold text-seed-900 sm:text-5xl">
            This seed is not in the ground
          </h1>

          <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-seed-700/80">
            The page you were after does not exist — or it sold out, retired its mould, and went off
            to a shelf somewhere.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-full bg-leaf-600 px-6 py-3.5 text-base font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5"
            >
              Back to the greenhouse
            </Link>
            <Link
              to="/little-sprouts"
              className="rounded-full bg-white px-6 py-3.5 text-base font-semibold text-seed-900 shadow-soft ring-1 ring-seed-200 transition-all hover:-translate-y-0.5"
            >
              Little Sprouts
            </Link>
          </div>
        </div>
      </Container>

      <div className="mt-14">
        <WaveDivider fill="#FAF6EA" />
      </div>
    </section>
  )
}
