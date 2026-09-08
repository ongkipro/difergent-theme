/**
 * Homepage composition. Each entry names a section in the registry; an unknown
 * name fails validation at build time rather than rendering nothing at runtime.
 * Reordering this array reorders the page. No component edit is involved.
 */
export const sections = [
  {
    type: 'hero',
    props: {
      /**
       * Set `overlay: true` to place the text over the image instead of beside
       * it. Only do that with dark, calm photography, and check the contrast.
       */
      overlay: false,
      /** Scrim strength behind overlaid text, 0-100. Only used when overlay is on. */
      scrim: 65,
      slides: [
        {
          eyebrow: 'New this season',
          heading: 'Built once, branded per store',
          body: 'A configuration-driven storefront. Change tokens, not components.',
          ctaLabel: 'Discover the collection',
          ctaHref: '/collections',
          image: '/placeholders/hero.svg',
          imageAlt: 'Placeholder hero image',
        },
        {
          eyebrow: 'Made to be cloned',
          heading: 'One accent carries the brand',
          body: 'Swap a single token and the whole storefront changes identity.',
          ctaLabel: 'See how it works',
          ctaHref: '/collections',
          image: '/placeholders/feature.svg',
          imageAlt: 'Placeholder hero image',
        },
      ],
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
