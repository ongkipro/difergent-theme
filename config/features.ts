/**
 * Feature flags. A disabled flag removes the UI *and* the Storefront API
 * request that serves it, so a flag is a cost decision, not only a display one.
 */
export const features = {
  predictiveSearch: true,
  cartDrawer: true,
  stickyAddToCart: true,
  /** Customer accounts are out of scope for v1; the routes stay unlinked. */
  customerAccounts: false,
  blog: false,
  marketSwitcher: true,
  /** Most stores do not sell gift cards; the field is hidden unless they do. */
  giftCards: false,
} as const;

export type Features = typeof features;
