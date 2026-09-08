# Architecture — difergent-theme

Updated: 2026-09-08
Expected stack: Existing repository (detected by project-check)

## Selected capabilities

| Capability | Decision | Proven operational |
|---|---|---|
| Database | `none` | No |
| Authentication | `none` | No |
| Deployment target | `none` | No |

Bootstrap source state: native generator: none. These selections constrain future
architecture work but do not create services, credentials, schemas, or remote
resources.

## Current system

Architecture is not documented yet. Inspect the repository and describe only components and data flows proven by code or runtime configuration.

## Boundaries

Record system boundaries, trust boundaries, external integrations, and ownership before adding diagrams.

## Data

Record authoritative data stores, invariants, migration constraints, and retention requirements when present.

## Decisions

Record accepted constraints in `DECISIONS.md`. Costly-to-reverse decisions may
also have detailed ADRs; create that directory only when the first ADR exists.

## Verification

List the smallest commands or runtime scenarios that prove architectural changes behave as intended.

## What was actually built

Shopify Hydrogen on React Router 7 framework mode, TypeScript, Vite, Tailwind
v4, deployed to Oxygen. Shopify remains the commerce authority: catalogue,
pricing, inventory, cart mutations, checkout, tax and shipping are all platform
contracts, and the storefront never reimplements them.

### The two halves

`config/` and `public/` are store-owned. Everything else is framework-owned and
comes from upstream. That boundary is what makes an upstream merge tractable, so
no store-specific value is allowed outside it.

| Concern | Where |
|---|---|
| Store identity, tokens, navigation, sections, features, SEO, tracking | `config/*.ts` |
| Validation and the single typed config value | `app/lib/config/` |
| Token emission to CSS custom properties | `app/lib/tokens.ts` |
| Section vocabulary and registry | `app/lib/sections/` |
| SEO helpers, canonical sanitisation, structured data | `app/lib/seo.ts` |
| Consent-gated marketing tags | `app/components/MarketingTags.tsx` |
| Readiness probe | `app/routes/health.tsx` |

### Request path

`server.ts` validates the environment before anything else, so a misconfigured
store fails to boot rather than serving a broken page. `entry.server.tsx` sets
`X-Robots-Tag` for error responses and for surfaces that must never be indexed;
the matching directive is also rendered into the document, because either layer
alone has proven insufficient.

Route loaders return resolved data objects directly. In React Router framework
mode a wrapped response breaks fetcher serialisation.

### Composition

The home route renders a registry of named sections selected by configuration.
An unknown name fails the build. A section whose data is unavailable is omitted
rather than rendered as an empty frame. Only the section types actually present
issue Storefront API queries, so a disabled or absent section costs nothing.
