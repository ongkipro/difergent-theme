# PRD: Difergent Theme

## Overview
**Difergent Theme** is a reusable Shopify Hydrogen starter repository that turns a new headless
storefront into a configuration exercise instead of a development project. One
upstream repository is cloned per store; branding, navigation, homepage
composition, and optional features come from a single typed configuration module
plus environment variables. No component or route file is edited to launch a
standard store. The template targets the current React Router based Hydrogen
framework on the Oxygen runtime, and keeps Shopify as the commerce authority for
catalog, pricing, inventory, discounts, tax, shipping, payment, and checkout.

## Product, Audience, and Market Context
- **Primary user:** the repository owner, building and running their own
  storefronts. The job is "launch another Shopify storefront of my own without
  rewriting the storefront each time." Evidence status: observed, from a
  repeated pattern of one-off storefront projects on this machine. This is a
  personal internal standard, not a product sold to anyone.
- **Secondary user:** the same person acting as merchant, editing catalog and
  content in Shopify admin without touching this repository. There is no third
  party to support, train, or hand documentation to.
- **Market scope:** neutral multi-market. Currency, language, and number
  formatting are resolved from Shopify Markets and the active locale rather than
  hardcoded. No country-specific payment, address, or messaging behavior ships
  in v1.
- **Device/input:** mobile-first, and specifically in-app-browser-first. The
  assumed dominant surface is a phone opening the storefront from a link
  inside Instagram, TikTok, Facebook, or WhatsApp, because that is where paid
  traffic lands. Assumed from the owner's own channel mix, not measured on a
  live derived store.
- **Unresolved assumption:** the set of homepage sections that most stores
  actually need. v1 ships a deliberately small set and treats the section
  registry as the extension point rather than guessing ahead.

## Goals
- A new store goes from `git clone` to a deployed Oxygen production URL by
  editing only the configuration module, environment variables, and asset files.
- A store repository derived from this template can merge a later upstream
  release with conflicts confined to the configuration directory.
- Home, collection, and product routes meet the performance budget in REQ-19 on
  a mobile profile.
- Enabling or disabling any templated feature requires exactly one boolean
  change and removes both its UI and its Storefront API cost.

## Non-Goals
- Checkout UI. Checkout stays on Shopify's hosted checkout.
- A merchant-facing visual theme editor. Configuration is code, edited by the
  owner.
- A commercial product. This is never listed, sold, or licensed, so it carries
  no marketplace obligations: no feature-count competition, no buyer-facing
  documentation, no support commitment, no backwards-compatibility promise to
  anyone outside this account. Scope is decided by what the owner's own stores
  need, and by nothing else.
- Multi-tenant serving. One deployment serves one store.
- Customer accounts, blog and articles, wishlist, product reviews, and
  subscriptions. Deferred past v1.
- Liquid themes, Shopify apps, checkout extensions, and Shopify Functions.
- A component library published as a separate npm package.
- Migrating any existing storefront onto this template.

## Requirements

### Configuration contract
- **REQ-1** (ubiquitous) The system shall source every store-specific value —
  brand identity, design tokens, navigation, homepage composition, feature
  flags, and social and contact links — from a single configuration directory
  and from environment variables, and from nowhere else.
- **REQ-2** (unwanted) If a required configuration value or environment variable
  is absent or fails schema validation, then the system shall fail the build or
  the server boot with an error naming the offending key and its expected shape.
- **REQ-3** (ubiquitous) The system shall expose the configuration as a typed
  value, so that an unknown key or a wrong value type is a type error before it
  is a runtime error.
- **REQ-4** (ubiquitous) The system shall render every design token defined in
  `DESIGN.md` — color, typography, spacing, shape, elevation, and motion — from
  configuration-derived CSS custom properties, and no component shall contain a
  hardcoded brand color, font family, radius, shadow, or transition duration.
- **REQ-5** (state-driven) While a feature flag is disabled, the system shall
  neither render that feature's UI nor issue the Storefront API requests that
  serve it.
- **REQ-6** (ubiquitous) The system shall confine all per-store customization to
  the configuration directory and the public asset directory, so that an
  upstream merge produces conflicts only inside those paths.

### Storefront behavior
- **REQ-7** (event-driven) When the home route loads, the system shall render
  the homepage sections in the order declared in configuration, and shall skip
  any section whose required data is unavailable rather than rendering an empty
  frame.
- **REQ-8** (unwanted) If configuration names a homepage section that is not in
  the section registry, then the system shall fail validation at build time
  rather than rendering nothing at runtime.
- **REQ-9** (ubiquitous) The collection route shall request and render products
  in page sizes that are an exact multiple of the desktop grid column count, so
  that the final row is never a single orphan card.
- **REQ-10** (event-driven) When a buyer changes a product option on the product
  route, the system shall update the displayed price, availability, media, and
  the URL to the matching variant without a full page reload.
- **REQ-11** (state-driven) While a product has no buyer-selectable options, the
  system shall suppress Shopify's synthetic default variant text from the
  buyer-facing UI.
- **REQ-12** (event-driven) When a buyer adds, updates, or removes a cart line,
  the system shall reflect the change in the cart UI before the network response
  settles, and shall reconcile with the server result.
- **REQ-13** (ubiquitous) The system shall persist the cart across reloads and
  across navigation within the same browser session.
- **REQ-14** (event-driven) When a buyer proceeds to checkout, the system shall
  hand off to the Shopify-hosted checkout URL for the current cart, preserving
  the active market and locale.
- **REQ-15** (event-driven) When a buyer types in the search field, the system
  shall issue a predictive search request whose result limit is clamped to the
  inclusive range 1 to 10, and shall render a full search results route for a
  submitted query.
- **REQ-16** (ubiquitous) The system shall format prices using the currency and
  locale reported by the active Shopify market, and shall not apply a
  hardcoded currency symbol or decimal convention.

### Discoverability and measurement
- **REQ-17** (ubiquitous) Every indexable route shall emit a canonical URL, a
  title, a meta description, Open Graph tags, and, on the product route,
  Product structured data reflecting the selected variant's price and
  availability.
- **REQ-18** (unwanted) If a requested resource does not exist or is
  unavailable, then the system shall respond with the correct HTTP status and
  shall mark the response non-indexable in both the response headers and the
  document markup.
- **REQ-19** (ubiquitous) The home, collection, and product routes shall meet a
  mobile budget of Largest Contentful Paint at or below 2.5 seconds, Cumulative
  Layout Shift at or below 0.1, and Interaction to Next Paint at or below 200
  milliseconds, measured against a production build.
- **REQ-20** (ubiquitous) The system shall serve a sitemap and a robots
  directive that reflect the deployed public host.
- **REQ-21** (state-driven) While the buyer has not granted analytics consent,
  the system shall withhold analytics events that consent governs, and shall
  emit them once consent is granted.

### Resilience and onboarding
- **REQ-22** (unwanted) If a route loader fails, then the system shall render a
  scoped error boundary that preserves site navigation, and shall not surface
  internal error detail to the buyer.
- **REQ-23** (event-driven) When the owner follows the repository setup
  document on a clean machine, the system shall reach a running local storefront
  against a real Shopify store, with every required step stated and no
  undocumented manual edit.
- **REQ-24** (ubiquitous) The system shall meet the accessibility floor stated
  in `DESIGN.md`: interactive control boundaries use the control border token
  rather than a decorative one, every interactive element shows a focus
  indicator that does not depend on the store-configured accent, touch targets
  are at least 44 pixels, state is never signalled by color alone, and the
  layout reflows to a 320 pixel viewport without horizontal scroll.

### Assets, operations, and knowledge capture
- **REQ-26** (event-driven) When a store is cloned and configured but has no
  real photography yet, the system shall render every registry section and every
  commerce route using bundled placeholder media, and that media shall read as a
  deliberate placeholder rather than as fabricated brand content, reviews, or
  testimonials.
- **REQ-27** (ubiquitous) The repository shall carry a deployment runbook stating
  the required Oxygen environment variables, the Storefront API access scopes,
  and the domain cutover checklist, with no secret value written into it.
- **REQ-28** (ubiquitous) The repository shall carry a notification runbook for
  repointing Shopify email templates at the headless domain, because the default
  Liquid link variables resolve to the `myshopify.com` domain and silently send
  buyers away from the storefront.
- **REQ-29** (ubiquitous) The repository shall carry a route map recording every
  built route, its page type, its critical components, and its state, updated as
  routes are built rather than written once.
- **REQ-30** (ubiquitous) The repository shall carry a theming guide showing the
  shortest path from a fresh clone to a re-branded storefront, referencing the
  `DESIGN.md` token names rather than restating their values.
- **REQ-31** (unwanted) If a link, canonical URL, or page title would reproduce a
  known storefront hazard, then the system shall prevent it: no internal link to
  the `all` collection handle, which returns 404 on a store that does not define
  it; canonical URLs stripped of `utm_*`, `fbclid`, `gclid`, and `ttclid`; and a
  single title separator convention applied everywhere.
- **REQ-32** (ubiquitous) The system shall expose the health probes named in the
  repository observability contract, so a deployed store can be checked without
  reading its logs.
- **REQ-33** (event-driven) When a change is pushed to the repository, automated
  checks shall run the type check, the lint rules including the token rule, and
  the build, so a derived store never inherits a broken upstream.
- **REQ-34** (state-driven) While a store has configured a marketing tag, the
  system shall load it through a single consent-gated extension point, so adding
  a pixel never requires editing a component.
- **REQ-35** (ubiquitous) The repository shall maintain an auditable delivery
  record: each unit of work states the surface it may change, and each
  completion is backed by the recorded result of a check run against the state
  it claims to describe.
- **REQ-25** (state-driven) While the storefront is rendered inside an in-app
  browser, the system shall keep the full purchase path usable: stable viewport
  height, bottom-fixed elements clear of the host toolbar, cart persistence
  across the checkout handoff, no dependency on a new window or a download, and
  accelerated payment controls rendered only when actually available.

## Stack & Constraints
- **Framework:** Shopify Hydrogen on React Router in framework mode, Vite,
  TypeScript. Base the repository on the current official Hydrogen skeleton
  template rather than a hand-built skeleton.
- **Styling:** Tailwind v4. Every project stylesheet rule must sit inside an
  `@layer`; an unlayered rule outranks all utilities regardless of specificity.
- **Data:** Shopify Storefront API only. Generated types come from the project's
  own codegen, not hand-written.
- **Deploy:** Oxygen, with Shopify-managed environment variables and per-branch
  previews.
- **Design:** `DESIGN.md` is the accepted design artifact and owns the token
  contract. Its token names are the vocabulary REQ-4 enforces; a store changes
  values, never names. `design-taste` polices execution quality against it,
  `storefront-ux` owns commerce behavior, `ui-validation` supplies browser
  evidence, and `web-perf` owns performance diagnosis.
- **Boundary:** `headless-shopify` owns the architecture boundary;
  `hydrogen-development` owns framework implementation. This PRD does not
  restate either.

## Technical Decisions
- **Decision:** distribute as a cloned upstream repository, not a multi-tenant
  deployment and not a published package.
  **Why:** Hydrogen has no theme system and Oxygen binds one deployment to one
  store. Cloning matches how the runtime and hosting actually work, and lets a
  store diverge without a release cycle.
  **Consequence:** upstream fixes reach stores through `git merge`, so the
  configuration boundary in REQ-6 is load-bearing, not cosmetic.

- **Decision:** build from the current official Hydrogen skeleton generator, and
  inherit no existing codebase.
  **Why:** the generator output is the only starting point whose framework
  contract is known to be current, and a fresh start means every completion
  claim in this repository is backed by evidence produced here.
  **Consequence:** the whole task queue runs from zero, and nothing is marked
  done on the strength of work done elsewhere.

- **Decision:** route loaders return resolved data objects directly.
  **Why:** in React Router framework mode this is what makes fetcher
  serialization work; wrapping in a JSON response breaks it.
  **Consequence:** loaders must await their data rather than hand back a
  response object.

- **Decision:** homepage composition is a registry of named sections selected by
  configuration, not free-form page building.
  **Why:** it delivers the plug-and-play outcome with a build-time failure mode
  for a bad name, and no schema or query layer to design.
  **Consequence:** adding a section type is a code change, deliberately. Content
  driven composition through metaobjects is a later decision, not a v1 hedge.

## Milestones
- [x] v0.1 — Skeleton in place, configuration contract enforced, tokens flowing
      to CSS, home route composing from configuration.
- [x] v0.2 — Collection, product, cart, and search routes complete against a
      real store.
- [x] v0.3 — SEO, structured data, analytics consent, sitemap, error boundaries,
      hazard guards.
- [x] v0.4 — Placeholder assets, runbooks, route map, theming guide, health
      probes, automated checks.
- [ ] v1.0 — Performance budget met, accessibility floor enforced, in-app
      browser path verified on a real phone, runbooks written, automated checks
      green, and the first derived store deployed to Oxygen.
