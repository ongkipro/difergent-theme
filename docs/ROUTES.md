# Route map

What exists in `app/routes/`, not what was planned. A route absent from the code
is absent from this table.

## Buyer-facing

| Route | File | Purpose | Indexable |
|---|---|---|---|
| `/` | `_index.tsx` | Home, composed from `config/sections.ts` through the section registry | Yes |
| `/collections` | `collections._index.tsx` | Collection directory | Yes |
| `/collections/:handle` | `collections.$handle.tsx` | Product listing, paginated in multiples of the desktop column count | Yes |
| `/collections/all` | `collections.all.tsx` | Catch-all listing. **Never link to this from a component**: the `all` handle returns 404 on a store that does not define it, and `config/navigation.ts` rejects it at validation | Yes |
| `/products/:handle` | `products.$handle.tsx` | Product detail, variant selection, Product and BreadcrumbList structured data | Yes |
| `/search` | `search.tsx` | Full results plus the predictive endpoint. Limit clamped to 1..10 | `noindex, follow` |
| `/cart`, `/cart/:lines` | `cart.tsx`, `cart.$lines.tsx` | Cart page and prefilled cart links | No |
| `/pages/:handle` | `pages.$handle.tsx` | Shopify pages | Yes |
| `/policies`, `/policies/:handle` | `policies._index.tsx`, `policies.$handle.tsx` | Store policies | Yes |
| `/blogs/...` | `blogs.*` | Blog index, blog, article. Behind the `blog` feature flag, unlinked by default | Yes |
| `/discount/:code` | `discount.$code.tsx` | Applies a discount then redirects | No |
| `*` | `$.tsx` | 404 with recovery navigation, `noindex, nofollow` in both header and markup | No |

## Account

`account.tsx`, `account._index.tsx`, `account.$.tsx`, `account.addresses.tsx`,
`account.profile.tsx`, `account.orders._index.tsx`, `account.orders.$id.tsx`,
`account_.login.tsx`, `account_.logout.tsx`, `account_.authorize.tsx`.

Customer accounts are **out of scope for v1**. The routes ship from the skeleton
and remain unlinked while `features.customerAccounts` is `false`. They are never
indexed.

## Machine-facing

| Route | File | Purpose |
|---|---|---|
| `/health` | `health.tsx` | Readiness probe. Answers a real Storefront API query; 503 when Shopify is unreachable |
| `/robots.txt` | `[robots.txt].tsx` | Disallows everything on any host that is not the configured public host |
| `/sitemap.xml` | `[sitemap.xml].tsx` | Sitemap index |
| `/sitemap/:type/:page.xml` | `sitemap.$type.$page[.xml].tsx` | Paged sitemaps |

## Shell and drawers

Not routes, but part of every page: the header (`Header.tsx`), the footer
(`Footer.tsx`), and three drawers rendered by `PageLayout.tsx` through
`Aside.tsx` — cart, predictive search, and the mobile menu. A closed drawer is
`inert`, so its controls leave the tab order and the accessibility tree
together.
