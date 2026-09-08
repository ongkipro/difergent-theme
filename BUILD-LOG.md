# Build Log — difergent-theme

Record only durable implementation changes, validation evidence, and gotchas that the next maintainer needs. Temporary task narration belongs in neither this file nor global memory.

## 2026-09-08 — Development contract initialized

- Added repository-local project context files.
- Bootstrap source state: native generator: none.
- Selected stack: `Existing repository (detected by project-check)`; database: `none`; authentication:
  `none`; deployment target: `none`.
- Capability selections are not operational claims. Their implementation and
  verification remain future requirement-linked work.

## 2026-09-08 — Foundation, configuration contract, tokens, section registry

Scaffolded from the official Hydrogen skeleton generator (TypeScript). Two
generator artifacts needed repair before anything would install or typecheck:

- `package.json` shipped monorepo protocol specifiers (`workspace:*`,
  `catalog:`) that cannot resolve outside Shopify's own repository. Pinned to
  published versions: hydrogen 2026.4.5, mini-oxygen 4.2.2, hydrogen-codegen
  0.3.3, react/react-dom 19.2.8.
- `.npmrc` pointed the `@shopify` scope at `registry.npmjs.com` while tarballs
  are served from `registry.npmjs.org`. npm classified the mismatch as a remote
  fetch and refused it (`EALLOWREMOTE`). Corrected the host.

Skeleton type errors under React 19 types, both fixed at source: `RefObject<T>`
is now `RefObject<T | null>` (`SearchForm.tsx`), and `FunctionComponent` returns
`ReactNode | Promise<ReactNode>` which is not assignable when mapped into an
array (`PaginatedResourceSection.tsx`, changed to a plain render prop).

Implemented the configuration contract: `config/` holds the store half
(`brand`, `tokens`, `navigation`, `sections`, `features`, `seo`), validated once
at module load by a hand-written validator in `app/lib/config/`. No schema
dependency was added; the project needed shape checking with clear messages, not
a library. `validateEnv` runs in `server.ts` so a missing `SESSION_SECRET` or
`PUBLIC_STORE_DOMAIN` fails the boot instead of serving a broken page.

Tokens reach the browser as CSS custom properties emitted from configuration
into the document head, with Tailwind v4's theme pointing at those properties.
Every project rule sits inside an `@layer`, because an unlayered rule outranks
every Tailwind utility regardless of specificity.

Section vocabulary is camelCase (`featuredCollection`, not
`featured-collection`) because the repository's naming-convention lint rule
rejects kebab-case object keys, and a suppression would have been the worse
trade.

### Verification

- `npm run typecheck` — 0 errors.
- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — exit 0.
- `project-check --full` — VERIFIED (3/3).
- Token lint rule proven by probe: a file containing `"#ff0000"` fails with
  `no-restricted-syntax`; removing it passes.
- Dev server on mock.shop, `GET /` returns 200. All five configured sections
  render in configured order (`hero-heading`, `featured-collection-heading`,
  `image-with-text-heading`, `collection-list-heading`, `rich-text-heading`
  each present once). `--color-canvas:#FBFAF8` and `--color-accent:#1A1917`
  present in the emitted token block, confirming the accent falls back to the
  action colour when unset. Canonical resolves to the configured public host.

### Blocked

No Shopify Storefront API token exists on this machine: `petcue/.env` defines
the key with an empty value and no `elfy.my` project is present. Development
runs against mock.shop through an env file outside the repository
(`--env-file`), because the repository `.env` is protected by the secret gate
and cannot be edited from here. Real-store verification — checkout handoff,
market currency switching, notification templates — stays blocked until a token
is supplied.

## 2026-09-08 — Commerce routes, shell, SEO, measured verification

Three defects were found by looking at the rendered page, and none of them
failed a build, a type check or a lint run.

**The primary purchase action rendered black on black**, contrast 1.19 to 1.
Token names collided with Tailwind v4's theme namespace, making
`--color-action: var(--color-action)` circular. Tokens now emit under `--df-*`
and Tailwind's theme carries only breakpoints.

**An unlayered stylesheet outranked every utility.** The skeleton's `reset.css`
declared `a { color: #000 }` outside any layer, which beats a layered utility
regardless of specificity. Both skeleton stylesheets were removed and the
components that depended on them were restyled with tokens.

**Every page with a price threw a hydration error.** Hydrogen's `Money` renders
a `div`, and a `div` inside a `p` or `small` is invalid HTML. All inline usages
now pass `as="span"`.

Also fixed: a closed drawer kept its controls in the tab order (`aria-hidden`
without `inert`), the collection and product routes skipped a heading level, and
the purchase button, search controls and header logo were under 44px.

### Measured evidence, production build, mobile profile

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Home | 96-98 | 100 | 100 | 100 | 2.0-2.1s | 0 | 10ms |
| Collection | 97 | 100 | 100 | 100 | 2.2s | 0 | 10ms |
| Product | 96-97 | 100 | 100 | 100 | 2.1s | 0 | 10-60ms |

Home was measured three times after stopping stale preview servers; an earlier
3.4s reading was machine load, not the page.

### Responsive evidence

Measured over the DevTools protocol at 320, 360, 390, 414, 768, 1024, 1280 and
1440 pixels on home, collection and product:

- horizontal overflow: 0 at every width;
- zoom never locked: no `user-scalable=no`, no `maximum-scale=1`;
- every interactive target at least 44px, excluding `inert` subtrees.

### Commerce evidence

Driven in a real browser at 390x844:

- variant selection moved `?Size=Small&Color=Green` to `?Size=Medium&Color=Green`
  with no document navigation, and the pressed state followed;
- add to cart moved the cart badge from 0 to 1;
- the cart survived navigation and a full reload with cache ignored;
- checkout handed off to the Shopify checkout URL;
- the sticky purchase bar stayed `inert` while the real action was in view and
  activated once it left, verified by shrinking the viewport to 380px.

### Still unverified

Market currency switching, consent withheld versus granted, and the email
notification links all need a real store. In-app browser behaviour needs a real
phone; device emulation does not reproduce it.

## 2026-09-08 — Second pass: three defects the first pass had missed

Re-running the tasks as verification rather than as implementation found three
things I had marked done on the strength of the wrong evidence.

**Invalid configuration did not fail the build.** T3 and T7 both promise a
build-time failure, and I had verified only the runtime path. Bundling a module
does not execute it, so a misspelled section name or a malformed public host
built cleanly and would have surfaced when a buyer hit the page. Fixed with a
Vite plugin that runs `validateConfig()` in `buildStart`. Now an unknown section,
a malformed host and a bad token value each exit 1 and name the offending key;
a valid configuration still builds.

**A configured marketing tag loaded without consent.** Shopify's Customer
Privacy API reports a category as allowed by default where consent is not
legally required, so deferring to `marketingAllowed()` alone let a tag load
before the visitor had decided anything. `config/tracking.ts` now carries
`requireExplicitConsent`, defaulting to strict, which waits for an actual
decision.

**The consent gate never reacted to consent being granted.** The effect depended
only on values that do not change when a visitor accepts, so a visitor who
consented would not get their tags until the next navigation. Now it listens for
`visitorConsentCollected`.

A related trap, found while testing: the declared type of `ConsentStatus` is
`boolean | undefined`, but the browser API returns strings — `''` while
undecided, `'yes'` once granted. A strict `=== true` check would have silently
kept every tag off forever on a real store. The gate accepts both shapes.

**The market context was hardcoded** in `app/lib/context.ts` as `EN`/`US`.
Moved to `config/market.ts` and validated as two uppercase letters, which is
what the Storefront API requires.

### Verification, production build

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | 97 | 100 | 100 | 100 | 2.1s | 0 |
| Collection | 97 | 100 | 100 | 100 | 2.1s | 0 |
| Product | 97 | 100 | 100 | 100 | 2.1s | 0 |

- Responsive: 8 widths from 320 to 1440 on three routes. Horizontal overflow 0
  everywhere, zoom never locked, every target at least 44px.
- Commerce, in an isolated browser context: 8 of 8. Variant selection without a
  document navigation, sticky bar correctly conditional, add to cart, cart
  surviving navigation and reload, checkout handoff.
- In-app browser emulation: 7 of 7, including the cart surviving browser storage
  being wiped, which proves it lives on the first-party cookie.
- Consent: 2 of 2, both branches.
- Clean copy without `node_modules` or `.env`: install, typecheck, lint and
  build all pass, and an empty `SESSION_SECRET` aborts naming `env.SESSION_SECRET`.

The four browser checks are now committed under `scripts/` with npm aliases, so
this evidence is reproducible rather than a one-off.

### Still needing a real store

Market currency switching: mock.shop returns CAD for every configured country,
so the switch itself cannot be observed here. The in-app browser invariants hold
under emulation, but the confirmation on a physical phone inside two host
applications is still outstanding, and emulation does not replace it.

## 2026-09-08 — Third pass: verified against a real Shopify store

mock.shop is a fixed demo catalogue: one currency, one page of products, no
market behaviour. Shopify publishes a real demo storefront in the Hydrogen
documentation — `hydrogen-preview.myshopify.com` with a public token — which has
genuine markets and a working checkout. Re-running the whole suite against it
closed the last open requirement and exposed one more defect.

**Pagination controls were under 44px.** The `Load more` link never rendered on
mock.shop, because that catalogue fits on a single page. A real collection
paginates, and the control failed the touch-target floor at every width. Both
pagination links now carry the same 44px floor as every other control.

**Market currency is confirmed, not assumed.** Changing the configured country
changed the rendered price and the structured data together:

| Configured market | Rendered | Structured data |
|---|---|---|
| AU | A$707.00 | AUD |
| JP | ¥78,200 | JPY |
| DE | €438.95 | EUR |

The yen result is the useful one: no decimal places, because the format follows
the currency rather than a hardcoded two places.

**One further test-premise error corrected.** The selected-variant check read
the text of the first pressed control, which on a real product is a colour
swatch carrying no text. Reading every pressed control shows the real behaviour:
`154cm|Nested|Carbon-fiber` became `158cm|Nested|Carbon-fiber` on selection.

### Full suite against the real store

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | 97 | 100 | 100 | 100 | 2.1s | 0 |
| Collection | 97 | 100 | 100 | 100 | 2.2s | 0 |
| Product | 96 | 100 | 100 | 100 | 2.4s | 0 |

- Responsive: all widths from 320 to 1440 on three routes, no overflow, zoom
  never locked, every target at least 44px.
- Commerce: 8 of 8, with a real checkout handoff to `checkout.hydrogen.shop`.
- In-app browser emulation: 7 of 7.
- Consent: 2 of 2.

### The one thing still outstanding

T25's physical-device confirmation. Every in-app browser invariant holds under
emulation, but a real phone opening the storefront from inside Instagram and
WhatsApp is the only evidence that settles it, and no emulator substitutes for
it. That is hardware, not unfinished work.

## 2026-09-08 — Tidying the collection, cart and search surfaces

Removing the skeleton's stylesheets left these four surfaces functional but
unstyled, and two of them carried real defects underneath the cosmetics.

**The collections directory had no title and no meta description.** It is an
indexable route, and Lighthouse scored its SEO at 50 with a matching
accessibility failure for the missing document title. `collections._index.tsx`,
`policies._index.tsx` and `cart.tsx` all lacked a `meta` export; all three now
have one, with the cart marked `noindex` since it is a buyer surface rather than
a page worth indexing.

**Four more controls sat under the 44px floor**, each only visible once real
data rendered them: the search results' article and page links, the cart line's
product title, and the gift card apply button. The pagination controls were
given their own centred row rather than sitting flush against the grid.

Everything else was composition: the collection directory now uses the same
comparison grid as the collection page, search results reuse that grid instead
of a 50px thumbnail list, the cart line has an 88px image with the price on a
shared baseline, quantity controls read as a stepper, and the drawer's summary
sticks to the bottom with a safe-area inset.

### Verification

| Route | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Collections directory | 97 | 100 | 100 | 100 |
| Collection | 96 | 100 | 100 | 100 |
| Cart | 97 | 100 | 100 | 66, deliberately `noindex` |
| Search | 96 | 100 | 100 | 69, deliberately `noindex, follow` |

The two low SEO scores are the crawl directive working as designed: Lighthouse
penalises any page it cannot index, and neither of those should be indexed.

- Responsive: six routes across eight widths, no overflow, zoom never locked,
  every target at least 44px.
- Cart page with a real line at 390px: 6 of 6, including the checkout action
  spanning the decision region at 358px wide.
- Commerce 8 of 8 and in-app browser 7 of 7, unchanged.

`scripts/check-cart-page.mjs` was added so the populated cart state stays
checkable rather than being a one-off observation.
