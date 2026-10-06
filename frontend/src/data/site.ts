/** Static brand copy used across the site, kept out of components for clarity. */

import type { BottleShape, ProductCategory } from '@/lib/api'

export interface CategoryDef {
  key: ProductCategory
  title: string
  path: string
  tagline: string
  blurb: string
  cta: string
  /** Tailwind class strings for the block's background + text. */
  bg: string
  surface: string
  text: string
  muted: string
  ring: string
  glow: string
  emoji: string
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: 'kids',
    title: 'Little Sprouts',
    path: '/little-sprouts',
    tagline: 'Peel, reveal a real seed, and grow your own fruit tree',
    blurb:
      'Juice packs with one genuine, plantable fruit seed sealed under the sticker. Every sip is the start of a tree.',
    cta: 'Meet the sprouts',
    bg: 'bg-gradient-to-br from-sunny-300 via-[#ffe08a] to-leaf-300',
    surface: 'bg-white/70',
    text: 'text-seed-900',
    muted: 'text-seed-800/70',
    ring: 'ring-sunny-500/40',
    glow: 'shadow-[0_18px_50px_-18px_rgba(247,148,29,0.75)]',
    emoji: '🌱',
  },
  {
    key: 'normal',
    title: 'Daily Fresh',
    path: '/daily-fresh',
    tagline: 'Simple, everyday fruit juices and boxes',
    blurb:
      'No tricks, no seeds under the lid. Just honest cold-pressed juice and weekly fruit boxes that arrive on Thursday.',
    cta: 'Shop the basics',
    bg: 'bg-gradient-to-br from-white via-leaf-50 to-leaf-100',
    surface: 'bg-white',
    text: 'text-leaf-900',
    muted: 'text-leaf-900/65',
    ring: 'ring-leaf-400/40',
    glow: 'shadow-[0_18px_50px_-18px_rgba(79,158,74,0.6)]',
    emoji: '🍎',
  },
  {
    key: 'collector',
    title: 'The Rare Collection',
    path: '/rare-collection',
    tagline: 'Sculpted glass bottles. Limited edition flavors',
    blurb:
      'Juice poured into glass moulded into the fruit itself — skulls, apples, spiked dragon fruit. Numbered, and rarely repeated.',
    cta: 'Enter the collection',
    bg: 'bg-gradient-to-br from-plum-800 via-plum-900 to-[#1d0818]',
    surface: 'bg-white/10',
    text: 'text-cream-100',
    muted: 'text-cream-200/70',
    ring: 'ring-gold-400/40',
    glow: 'shadow-[0_18px_60px_-16px_rgba(212,164,55,0.65)]',
    emoji: '💀',
  },
]

export const CATEGORY_BY_KEY = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<ProductCategory, CategoryDef>

// ---------------------------------------------------------------------------
// Bottle shapes (Rare Collection)
// ---------------------------------------------------------------------------

export interface BottleShapeDef {
  key: BottleShape
  label: string
  /** Liquid colour inside the glass. */
  liquid: string
  /** Glass tint / highlight colour. */
  glass: string
  description: string
}

export const BOTTLE_SHAPES: Record<BottleShape, BottleShapeDef> = {
  skull: {
    key: 'skull',
    label: 'Skull',
    liquid: '#5B1E6B',
    glass: '#EDE4F2',
    description: 'Moulded in the shape of a skull face. Bone-white glass, dark elixir.',
  },
  apple: {
    key: 'apple',
    label: 'Apple',
    liquid: '#E8552F',
    glass: '#F7D6C6',
    description: 'The original sculpt — an apple, in glass, with a pressed stem.',
  },
  dragon: {
    key: 'dragon',
    label: 'Dragon Fruit',
    liquid: '#F9A8D4',
    glass: '#FDE7F3',
    description: 'A spiked dragon fruit. The longest silhouette in the collection.',
  },
  pear: {
    key: 'pear',
    label: 'Pear',
    liquid: '#D8E4A0',
    glass: '#EFF4DC',
    description: 'A single smooth teardrop of pale pear-glass. Quiet and elegant.',
  },
  moon: {
    key: 'moon',
    label: 'Moon',
    liquid: '#F7941D',
    glass: '#FCE3BE',
    description: 'A crescent tangerine with a puffy rind texture.',
  },
  hedgehog: {
    key: 'hedgehog',
    label: 'Hedgehog',
    liquid: '#3B0F5E',
    glass: '#E3D5F0',
    description: 'A bristly blackberry holding 40% ABV gin. Earns its spines.',
  },
}

// ---------------------------------------------------------------------------
// Home page sections
// ---------------------------------------------------------------------------

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Drink the juice',
    body: 'No added sugar, no funny business. Just cold-pressed fruit and a very curious sticker.',
    emoji: '🥤',
    accent: '#F7941D',
  },
  {
    step: 2,
    title: 'Peel the sticker',
    body: 'Underneath is a real fruit seed — viable, dried, and waiting for a pot.',
    emoji: '🏷️',
    accent: '#4F9E4A',
  },
  {
    step: 3,
    title: 'Plant the seed',
    body: 'A few centimetres of soil, some sun, and a patient friend. Trees take years. Worth it.',
    emoji: '🌳',
    accent: '#7D5A3F',
  },
] as const

export const TESTIMONIALS = [
  {
    quote:
      'My daughter planted the apple seed on a Tuesday and waters it every morning before school. Nine weeks later it has four leaves. She has named it Gerald.',
    name: 'Brenna L.',
    role: 'Little Sprouts parent, Calgary',
    emoji: '👩🏽‍🌾',
  },
  {
    quote:
      'I have the skull bottle on a shelf with a small brass plate under it. It looks like a piece of art that happens to be 18% ABV.',
    name: 'Marcus T.',
    role: 'Collector, number 41 of 250',
    emoji: '🧔🏻',
  },
  {
    quote:
      'We switched the whole office to the Weekly Fruit Box. Nobody has bought a sad desk apple since March.',
    name: 'Priya N.',
    role: 'Daily Fresh subscriber, Toronto',
    emoji: '👩🏾‍💻',
  },
  {
    quote:
      'The peel sticker is genuinely genius. My students use it as a reward chart — finish your reading, get a seed.',
    name: 'Mr. Alcott',
    role: 'Grade 3 teacher, Halifax',
    emoji: '🧑🏻‍🏫',
  },
  {
    quote:
      'Dragon Fruit Spike took two years to sell out. Worth every month of waiting — the glass is absurd in person.',
    name: 'Ana R.',
    role: 'Collector, Montreal',
    emoji: '👩🏼‍🎨',
  },
] as const

export const FOOTER_LINKS = {
  Shop: [
    { label: 'Little Sprouts', to: '/little-sprouts' },
    { label: 'Daily Fresh', to: '/daily-fresh' },
    { label: 'The Rare Collection', to: '/rare-collection' },
    { label: 'Cart', to: '/cart' },
  ],
  Brand: [
    { label: 'Our Story', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Growing Journal', to: '/little-sprouts#journal' },
    { label: 'API docs', to: '/api-docs' },
  ],
} as const
