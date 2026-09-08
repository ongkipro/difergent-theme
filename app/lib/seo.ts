import {config} from './config';

/** Parameters that identify a click, not a page. They must never reach a canonical URL. */
const TRACKING_PARAMS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^ttclid$/i,
  /^msclkid$/i,
  /^igshid$/i,
  /^_gl$/i,
];

/**
 * A canonical URL identifies the page, so tracking parameters and view state
 * are stripped. Leaving them in splits one page into many in a crawler's index.
 */
export function canonicalUrl(pathname: string, search = ''): string {
  const url = new URL(pathname + search, config.brand.publicHost);
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((pattern) => pattern.test(key))) {
      url.searchParams.delete(key);
    }
  }
  // Filter and sort state are views of the same resource.
  for (const key of ['sort', 'direction', 'cursor', 'page', 'filter']) {
    url.searchParams.delete(key);
  }
  url.hash = '';
  let out = url.toString();
  if (out.endsWith('/') && url.pathname !== '/') out = out.slice(0, -1);
  return out;
}

export function pageTitle(title?: string, useTemplate = true): string {
  if (!title) return config.seo.defaultTitle;
  if (!useTemplate) return title;
  return config.seo.titleTemplate.replace('%s', title);
}

/** Trimmed to the length search results actually show, with markup removed. */
export function metaDescription(input?: string | null): string {
  const text = (input || config.seo.defaultDescription)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}...`;
}

export type MetaInput = {
  title?: string;
  description?: string | null;
  pathname: string;
  search?: string;
  image?: string;
  /** `noindex` for surfaces that must never be indexed. */
  robots?: string;
  useTemplate?: boolean;
  type?: 'website' | 'product' | 'article';
};

export function buildMeta({
  title,
  description,
  pathname,
  search = '',
  image,
  robots,
  useTemplate = true,
  type = 'website',
}: MetaInput) {
  const url = canonicalUrl(pathname, search);
  const resolvedTitle = pageTitle(title, useTemplate);
  const resolvedDescription = metaDescription(description);
  const shareImage = new URL(
    image || config.seo.defaultShareImage,
    config.brand.publicHost,
  ).toString();

  const tags: Array<Record<string, unknown>> = [
    {title: resolvedTitle},
    {name: 'description', content: resolvedDescription},
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:title', content: resolvedTitle},
    {property: 'og:description', content: resolvedDescription},
    {property: 'og:type', content: type},
    {property: 'og:url', content: url},
    {property: 'og:image', content: shareImage},
    {property: 'og:site_name', content: config.brand.name},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: resolvedTitle},
    {name: 'twitter:description', content: resolvedDescription},
    {name: 'twitter:image', content: shareImage},
  ];

  if (config.seo.twitterHandle) {
    tags.push({name: 'twitter:site', content: config.seo.twitterHandle});
  }
  if (robots) {
    tags.push({name: 'robots', content: robots});
  }

  return tags;
}

/** Structured data for a product, reflecting the variant the buyer is looking at. */
export function productJsonLd(input: {
  name: string;
  description?: string | null;
  images: string[];
  sku?: string | null;
  price: string;
  currency: string;
  available: boolean;
  url: string;
  brandName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: metaDescription(input.description),
    image: input.images,
    ...(input.sku ? {sku: input.sku} : {}),
    brand: {'@type': 'Brand', name: input.brandName || config.brand.name},
    offers: {
      '@type': 'Offer',
      url: input.url,
      price: input.price,
      priceCurrency: input.currency,
      itemCondition: 'https://schema.org/NewCondition',
      availability: input.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function breadcrumbJsonLd(items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

/** Directive for surfaces that must never be indexed. Mirrored in the response header. */
export const NOINDEX = 'noindex, nofollow';
export const NOINDEX_FOLLOW = 'noindex, follow';
