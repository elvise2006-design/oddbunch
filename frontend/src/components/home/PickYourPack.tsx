/** "Pick Your Pack" — the three audience blocks that sit in the middle of home. */

import { motion } from 'framer-motion'

import { CategoryBlocks } from '@/components/CategoryBlock'
import { Container, Reveal, Section, SectionTitle } from '@/components/ui'

export function PickYourPack() {
  return (
    <Section id="pick-your-pack" aria-labelledby="pick-your-pack-title" className="bg-cream-100">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Pick your pack"
            title={
              <span id="pick-your-pack-title">
                Three ways to drink <span className="text-leaf-600">fruit</span>
              </span>
            }
            lede="We make three different things, for three different people, and we have never tried to pretend they are the same product."
          />
        </Reveal>

        {/* The three equal blocks — stacked on mobile, side by side from lg up. */}
        <div className="mt-12 lg:mt-14">
          <CategoryBlocks />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-center text-sm text-seed-700/65"
        >
          Not sure where to start?{' '}
          <a
            href="/about"
            className="font-semibold text-leaf-700 underline decoration-leaf-300 underline-offset-4 hover:text-leaf-800"
          >
            Read why we built all three
          </a>
          .
        </motion.p>
      </Container>
    </Section>
  )
}
