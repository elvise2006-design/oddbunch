/** Thin reading-progress bar pinned to the top of the viewport. */

import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  // Spring smooths out trackpad jitter into a steady sweep.
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-60 h-1 origin-left bg-gradient-to-r from-leaf-500 via-sunny-400 to-plum-700"
      style={{ scaleX }}
    />
  )
}
