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

## 2026-09-08 — Hero rebuilt as an inset card

Reference: the Impact theme demo. Its hero is an inset rounded card holding a
full-bleed image, with an eyebrow, a two-line display heading, a pill action,
and numbered slide pagination at the bottom right.

The structure transfers. The text-over-photograph part does not, at least not as
a default: this is a shell many stores clone, and text over their own
photography is a contrast lottery that nobody audits afterwards. The default
therefore keeps the copy on a surface beside the image, and the overlay
composition is opt-in per store.

The overlay's scrim is a flat colour at a configurable strength rather than a
gradient. A constant buys the same contrast on every image a store supplies; a
gradient's protection depends on where the text happens to land. The default of
65 was chosen against the worst case, a light image.

### Two defects the screenshots caught

- the slide pagination was absolutely positioned bottom-right of the card, which
  on mobile put it **on top of** the call to action. It now sits in flow below
  the copy and only floats at `lg`.
- a long shop name wrapped the header onto a second line, breaking the fixed row
  height. The name now truncates.

### Contrast, measured rather than scored

Lighthouse reported accessibility 100 on the overlay variant, which is not
evidence: automated checks skip text over images because they cannot resolve the
background. Sampling the composited pixels behind the hero copy gives the real
number.

| Measurement | Value |
|---|---|
| Background behind hero text, scrim 65 over a light image | rgb(102, 101, 98) |
| White body text on it | 5.83:1 |
| AA body threshold 4.5:1 | pass |

### Verification

Home on a production build: performance 98, accessibility 100, best practices
100, SEO 100, LCP 2.0s, CLS 0. All widths from 320 to 1440 pass with no
horizontal overflow, zoom unlocked and no target under 44px. A hero slide
without a heading fails the build, naming `sections[0].props.slides[0].heading`.

## 2026-09-08 — Cart summary recomposed

Reading the rendered markup surfaced three problems that the component code hid.

**Two stacked hairlines.** The summary container carried a top border and the
subtotal list carried another, with padding between them, producing a visible
double rule in the drawer. The border now belongs to the container in both
layouts.

**The primary action was pushed away from the number it acts on.** A discount
field and a gift card field were always open, so two input rows sat between the
subtotal and the checkout button. Most buyers have no code. Both fields now live
behind a native `details` disclosure, which opens automatically when a code is
already applied so an applied discount is never hidden. The disclosure carries a
plus and minus marker rather than only an underline, because an underline alone
reads as a link rather than a toggle.

**The gift card field showed on every store.** Most do not sell gift cards, so
it is now behind `features.giftCards`, off by default.

Three smaller corrections: the tax and shipping caveat moved next to the
subtotal it qualifies rather than sitting under the button; the subtotal now
states the item count; and on the cart page the checkout action is capped at
360px, because a button stretched across 720px of content reads as a bar rather
than an action. In the drawer it stays full width, where the column is already
narrow.

### Verification

| Surface | Performance | Accessibility | Best practices |
|---|---|---|---|
| Cart page, production build | 98 | 100 | 100 |

- Cart page with a real line at 390px: 6 of 6 checks, including every control at
  the 44px floor.
- All widths from 320 to 1440: no horizontal overflow, zoom never locked.
- The cart's SEO score of 66 is its `noindex` directive working as intended.

## 2026-09-08 — Header recomposed for mobile

The wordmark stays a text logo. The layout around it was the problem.

**The wordmark was not centred, and at 320px the icons sat on top of it.** The
header was a flex row, so the wordmark landed wherever the controls left room.
Switching to a grid did not fix it: `1fr` columns keep their content as a
minimum, so the two-control right cluster made that column wider than the
one-control left cluster and pushed the wordmark off centre; `minmax(0, 1fr)`
centred it but let the icons overflow their columns onto the text. The fix is to
give both side clusters the same fixed basis, so centring holds by construction
and the clusters never encroach.

**A long shop name broke the header height.** It now truncates on one line, and
its size is fluid rather than stepped so it fits at 320px and still reads at
1440px.

Two smaller corrections: the wordmark link had lost the 44px floor when its
padding was removed, and the cart badge could clip against the icon. The badge
now carries a ring in the canvas colour, caps at `99+`, and is hidden from
assistive technology because the control's accessible name already states the
count.

### Two test-premise errors worth recording

The first check counted distinct `top` positions among header controls to detect
wrapping. Controls have different heights, so their top edges differ
legitimately; it reported every width as wrapped. Header height is the real
signal.

The second read `r.clipped` when the measurement returned `markClipped`, so the
comparison was against `undefined` and failed every width from 390px up while
passing the ones where the check was hardcoded true. A check that fails for the
wrong reason is worse than no check.

### Verification

`scripts/check-header.mjs`, 7 widths from 320 to 1440: the wordmark sits within
3px of the true centre line on mobile and left-aligns from `md`, never wraps,
keeps at least 8px of air from the nearest control, and no control falls under
44px. Home on a production build: performance 97, accessibility 100, best
practices 100, SEO 100, LCP 2.0s, CLS 0.

## 2026-09-08 — The wordmark comes from configuration

The header and footer read the Shopify store name first and fell back to
`config/brand.ts`. That was backwards. A merchant's admin name is an internal
label, and on the demo store it rendered as "Hydrogen Demo Store", a
three-word name that forced the header into its truncation path at 320 and
360px.

The wordmark is brand identity, so it belongs with the other brand decisions in
`config/brand.ts`. With the configured single word, clipping disappears at every
width and the air between the wordmark and the nearest control goes from 8px to
21px at 320px, and from 13px to 54px at 390px.

`scripts/check-header.mjs`: 7 of 7 widths, no clipping anywhere.

## 2026-09-08 — The wordmark's descender was clipped

The tail of the g in "Difergent" was cut off. `truncate` sets `overflow: hidden`
on both axes, and the wordmark carried `leading-none`, so the line box was
exactly the font size and everything below the baseline was clipped. Line height
is now 1.35.

The check for it was proven rather than assumed: reverting to `leading-none`
makes `scripts/check-header.mjs` report `descenderClipped=true` and fail at every
width; restoring the fix passes all seven. A check that cannot fail is not a
check, and this session has already produced two of those.

Two other `leading-none` usages were reviewed and left alone: the disclosure's
plus and minus marker and the cart count badge both render characters with no
descenders inside fixed-height boxes.

Verified: 7 of 7 header widths, home at performance 97, accessibility 100, best
practices 100, SEO 100, LCP 2.0s, CLS 0.

### Open discrepancy: the display font is declared but never loaded

`DESIGN.md` names Instrument Serif as the display family and Instrument Sans as
the body family, and `config/tokens.ts` sets both. Neither is actually loaded, so
every render falls through to the system stack. The storefront looks
intentional, but it is not the specified typeface. Either the fonts are loaded
with the cost that implies, or the tokens and the design record should name the
system stack they actually use. Not resolved here.

## 2026-09-08 — The declared typefaces are now actually loaded

`DESIGN.md` named Instrument Serif and Instrument Sans, and the tokens set them,
but nothing loaded either, so every render fell through to the system stack.

Loading them needed two things, not one. The obvious part is the stylesheet link
and the preconnects. The part that fails silently is the Content Security
Policy: Hydrogen sets one, and a font host absent from it is blocked with no
visible error — the page simply renders in the fallback and looks fine. The
origins now live in `tokens.fontSource` beside the stylesheet, `entry.server.tsx`
feeds them into `styleSrc` and `fontSrc`, and validation rejects a source whose
origin is not in the list, so the two cannot drift apart.

### The cost, measured rather than assumed

Three Lighthouse runs each on the same build, with and without the source:

| | Performance | LCP | CLS | FCP |
|---|---|---|---|---|
| With fonts | 97, 97, 97 | 2.0-2.1s | 0.001 | 2.0s |
| Without fonts | 97, 97, 97 | 2.1-2.2s | 0 | 2.0-2.1s |

No measurable cost. `display=swap` plus preconnect means the fallback paints
immediately, and the largest contentful element is the hero image rather than
text, so the swap never gates it.

### Verified as rendering, not merely downloading

`scripts/check-fonts.mjs` measures the wordmark against the same string in the
fallback stack: 48px in Instrument Serif against 59px in Georgia. A face can
download and still not be applied, so `document.fonts.check` alone is not
evidence. It also asserts no font request was blocked.
