/** Home page — section order follows the brand story top to bottom. */

import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ImpactStats } from '@/components/home/ImpactStats'
import { Newsletter } from '@/components/home/Newsletter'
import { PickYourPack } from '@/components/home/PickYourPack'
import { TestimonialsSlider } from '@/components/home/TestimonialsSlider'
import { ScrollProgress } from '@/components/ScrollProgress'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Hero />
      <PickYourPack />
      <HowItWorks />
      <FeaturedProducts />
      <ImpactStats />
      <TestimonialsSlider />
      <Newsletter />
    </>
  )
}
