/**
 * Homepage composition. Each entry names a section in the registry; an unknown
 * name fails validation at build time rather than rendering nothing at runtime.
 * Reordering this array reorders the page. No component edit is involved.
 */
export const sections = [
  {
    type: 'hero',
    props: {
      heading: 'Built once, branded per store',
      body: 'A configuration-driven storefront. Change tokens, not components.',
      ctaLabel: 'Shop the collection',
      ctaHref: '/collections',
      image: '/placeholders/hero.svg',
      imageAlt: 'Placeholder hero image',
    },
  },
  {
    type: 'featuredCollection',
    props: {handle: '', heading: 'Featured', limit: 4},
  },
  {
    type: 'imageWithText',
    props: {
      heading: 'One accent carries the brand',
      body: 'The layout stays fixed. A single token re-brands the storefront.',
      image: '/placeholders/feature.svg',
      imageAlt: 'Placeholder feature image',
      align: 'start',
    },
  },
  {
    type: 'collectionList',
    props: {heading: 'Browse', limit: 4},
  },
  {
    type: 'richText',
    props: {
      heading: 'About',
      body: 'Replace this copy in config/sections.ts. It is store-owned content.',
    },
  },
] as const;

export type SectionConfig = (typeof sections)[number];
