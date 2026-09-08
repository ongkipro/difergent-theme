/**
 * The market this store serves by default. Currency, language and number
 * format all follow from it: prices are rendered from the amount and currency
 * the Storefront API returns for this context, never from a hardcoded symbol
 * or decimal convention.
 *
 * Codes are Shopify's: ISO 3166-1 alpha-2 for country, ISO 639-1 for language.
 */
export const market = {
  country: 'US',
  language: 'EN',
} as const;

export type Market = typeof market;
