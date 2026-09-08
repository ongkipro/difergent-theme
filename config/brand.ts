/**
 * Store identity. Every value here is store-owned: change it in a derived
 * store, never in a component.
 */
export const brand = {
  name: 'Difergent',
  tagline: 'Engineered for clarity',
  /** Path under /public, or an absolute URL. */
  logo: '/placeholders/logo.svg',
  /** Public host of the deployed storefront, no trailing slash. */
  publicHost: 'https://example.com',
  /** Shown in the footer and used for support links. Empty values are hidden. */
  contact: {
    email: '',
    phone: '',
    whatsapp: '',
  },
  social: {
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
  },
} as const;

export type Brand = typeof brand;
