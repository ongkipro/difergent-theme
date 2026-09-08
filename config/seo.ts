/** Indexation and sharing defaults. Values here are store-owned. */
export const seo = {
  /** `%s` is replaced by the page title. One separator, everywhere. */
  titleTemplate: '%s - Difergent',
  defaultTitle: 'Difergent',
  defaultDescription:
    'A configuration-driven Shopify storefront built on Hydrogen.',
  /** Path under /public, or an absolute URL. */
  defaultShareImage: '/placeholders/share.svg',
  twitterHandle: '',
} as const;

export type Seo = typeof seo;
