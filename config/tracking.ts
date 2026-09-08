/**
 * Marketing tags. Nothing here loads until the buyer has granted the matching
 * consent category, and adding a tag never requires editing a component.
 *
 * `consent` selects the gate: `analytics` for measurement, `marketing` for
 * advertising and remarketing.
 */
export const tracking = {
  /** Shopify's own consent surface. Turn on where a banner is required. */
  privacyBanner: false,
  /**
   * Require an explicit decision before any tag loads.
   *
   * Shopify's Customer Privacy API reports a category as allowed by default in
   * regions that do not require consent, so relying on it alone means a tag can
   * load before the visitor has decided anything. The strict default waits for
   * an actual `true`. A store that operates only where consent is not required
   * may set this to `false` and defer to the platform.
   */
  requireExplicitConsent: true,
  tags: [] as Array<{
    id: string;
    src: string;
    consent: 'analytics' | 'marketing';
    async?: boolean;
  }>,
} as const;

export type Tracking = typeof tracking;
