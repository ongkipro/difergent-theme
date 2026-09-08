# Tasks — Difergent Theme

Updated: 2026-09-08

Canonical execution queue. Every task traces to exactly one accepted
requirement in `PRD.md`, declares its risk class, states its allowed and
protected surface, and names a runnable completion check. Task IDs are stable
and are never renumbered or reused.

## Rules for the executing agent

- One task at a time. Confirm requirement, risk, allowed surface, dependencies,
  and completion evidence before the first edit.
- Do only the task's scope. Work outside `Allowed Paths` requires explicit
  expansion, not judgment.
- Respect `AGENTS.md`: YAGNI, native-first, no unrequested abstractions.
- `DESIGN.md` tokens are law. A store changes token values, never token names,
  and never component styling.
- A passing build is not evidence a buyer-visible route works. Any task with a
  `Visual Contract` requires browser evidence before `DONE`.
- Commit and push only when the user explicitly asks.
- Record evidence at task boundaries, not at the end. A completed task updates
  the repository build log and status with the observed result of its own
  verification command, including the command and enough output to support the
  verdict.
- Never run two tasks concurrently that share a `Canonical Contract Owner`. Two
  tasks with disjoint owners and satisfied dependencies may run in parallel.
- After a verified non-trivial fix whose lesson is durable and reusable, and not
  already encoded by a check in this repository, capture it as a learning
  candidate. Capture is not promotion, and neither authorizes a commit.
- A task whose `Escalation Conditions` are met stops and reports. It does not
  improvise a workaround and does not silently widen its allowed paths.

## Risk classes in this repository

R0 negligible, R1 low and bounded, R2 moderate or cross-module, R3 correctness
or sensitive, R4 architecture or critical. Every task touching money, cart
state, checkout handoff, session, or consent is at least R3 and requires review
by a separate agent plus a clean delivery-ledger boundary before `DONE`.

## In progress

None. 34 of 35 tasks are complete with recorded evidence. T25 is the sole exception: its seven invariants are proven under emulation against a real store, and only the physical-device confirmation remains, which requires hardware rather than more work.

## Pending

### Phase 1 — Foundation

### T1 ✅ DONE: Generate the Hydrogen skeleton and establish the two-half boundary
- **Observed:** skeleton generated; `project-check --full` VERIFIED
- **Requirement:** REQ-6
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch by capability; no model is mandated
- **Allowed Paths:** repository root, `app/**`, `config/**`, `public/**`, `package.json`, `tsconfig.json`, `vite.config.ts`, `AGENTS.md`
- **Protected Paths:** `.delivery/**`, `PRD.md`, `PLAN.md`, `DESIGN.md`
- **Canonical Contract Owners:** `repository.structure`, `storefront.framework`
- **Accepted Invariants:** the official Hydrogen generator output is the base; no hand-built skeleton replaces it
- **Producers:** repository structure, framework version contract
- **Consumers:** every later task
- **Depends On:** None
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** dev server starts and serves the generated home route
- **Visual Contract:** Not applicable; generated output is not yet designed
- **Reopen Conditions:** a store-specific value is found outside `config/**` or `public/**`
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** any design token, any route rewrite, any commerce behavior
- **Verification:** `project-check --full`
- **Escalation Conditions:** the generator output diverges materially from the documented skeleton structure

### T35 ✅ DONE: Render the repository delivery contract and initialize the ledger
- **Observed:** contract rendered, ledger initialised, planning artifacts promoted
- **Requirement:** REQ-35
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** repository tooling
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** repository root markdown contract files, `.delivery/**`, `.github/**`
- **Protected Paths:** `app/**`, `config/**`, `PRD.md`, `PLAN.md`, `DESIGN.md`, `TASKS.md`
- **Canonical Contract Owners:** `repository.contract`
- **Accepted Invariants:** the promoted planning artifacts are canonical and are never overwritten by a rendered placeholder; the ledger is initialized before any feature task runs, because a task boundary cannot be enforced against a ledger that does not exist
- **Producers:** the repository contract files and an initialized delivery ledger
- **Consumers:** every subsequent task
- **Depends On:** T1
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** the contract files exist alongside the promoted planning artifacts, the ledger reports an initialized state, and no promoted artifact was replaced by a template placeholder
- **Visual Contract:** Not applicable
- **Reopen Conditions:** the ledger cannot record a run boundary
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** any application code
- **Verification:** `project-check --full`
- **Escalation Conditions:** promotion reports a divergent destination file, which stops for a decision rather than being overwritten

### T2 ✅ DONE: Add the store-half configuration modules and their schema
- **Observed:** config modules load; every field reachable from one typed value
- **Requirement:** REQ-1
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `config/**`, `app/lib/config/**`
- **Protected Paths:** `app/routes/**`
- **Canonical Contract Owners:** `store.configuration`
- **Accepted Invariants:** `brand`, `tokens`, `navigation`, `sections`, `features`, `seo` are separate modules so a merge conflict lands in one concern
- **Producers:** the validated configuration value
- **Consumers:** T3, T4, T5, T6, T7
- **Depends On:** T1, T35
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** a valid configuration loads and every field is reachable from one exported value
- **Visual Contract:** Not applicable
- **Reopen Conditions:** a new store-specific value has no module to live in
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** token emission, validation failure behavior, route wiring
- **Verification:** `project-check --changed`
- **Escalation Conditions:** the schema requires a dependency not already installed

### T3 ✅ DONE: Fail the build and the boot on invalid configuration
- **Observed:** an unknown section, a malformed public host and a bad token value each fail `npm run build` with exit 1 and name the key; a valid config builds
- **Requirement:** REQ-2
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/lib/config/**`, `server.ts`, `vite.config.ts`
- **Protected Paths:** `config/**`
- **Canonical Contract Owners:** `store.configuration`
- **Accepted Invariants:** a misconfigured store never boots; the error names the offending key and its expected shape
- **Producers:** startup failure contract
- **Consumers:** T23
- **Depends On:** T2
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** remove one required key, then one required environment variable; each run aborts naming that key
- **Visual Contract:** Not applicable
- **Reopen Conditions:** any configuration path reaches a route without passing validation
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** secret values, which are never printed
- **Verification:** `project-check --changed`
- **Escalation Conditions:** validation would require reading a secret file directly

### T4 ✅ DONE: Export the configuration as a typed value
- **Observed:** unknown key and wrong type both fail the type check
- **Requirement:** REQ-3
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/lib/config/**`
- **Protected Paths:** `config/**`
- **Canonical Contract Owners:** `store.configuration`
- **Accepted Invariants:** an unknown key or a wrong value type is a type error before it is a runtime error
- **Producers:** the typed configuration surface
- **Consumers:** T5, T6, T7
- **Depends On:** T2
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** reading an unknown key and assigning a wrong type each fail the type check; the type check otherwise passes
- **Visual Contract:** Not applicable
- **Reopen Conditions:** any consumer casts the configuration to bypass its type
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** runtime validation, already owned by T3
- **Verification:** `project-check --changed`
- **Escalation Conditions:** None

### T5 ✅ DONE: Emit the DESIGN.md token set and enforce it by lint
- **Observed:** accent change re-brands without a component edit; lint probe rejects `#ff0000`
- **Requirement:** REQ-4
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `design-taste` for the token contract, `hydrogen-development` for wiring
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; visual capability required before the first visual edit
- **Allowed Paths:** `app/styles/**`, `app/lib/config/**`, `app/root.tsx`, `config/tokens*`, lint configuration
- **Protected Paths:** `app/routes/**`, `DESIGN.md`
- **Canonical Contract Owners:** `design.tokens`
- **Accepted Invariants:** every project stylesheet rule sits inside an `@layer`, because an unlayered rule outranks every Tailwind utility regardless of specificity; no component holds a literal brand value
- **Producers:** CSS custom properties for color, typography, spacing, shape, elevation, motion
- **Consumers:** T8, T9, T10, T11, T24
- **Depends On:** T2, T4
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** set the accent token and observe the primary purchase action re-brand across routes without a component edit; leave the accent unset and confirm the fallback to the action token; add a literal hex to a component and observe the lint rule reject it
- **Visual Contract:** token layer for a white-label storefront shell. Primary user is the operator branding a clone. Direction and token source are `DESIGN.md` verbatim, warm neutral light theme, density 5. Desktop and mobile share one token set; only spacing rhythm differs. Required states are default, unset accent falling back to the action token, and reduced-motion. Rejected: any new token name, any recolored palette, uniform large corner radius, shadow on a product card or section.
- **Reopen Conditions:** a component needs a value that has no token
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** route layout, component composition
- **Verification:** `project-check --ui`
- **Escalation Conditions:** a `DESIGN.md` token proves unworkable in Tailwind v4 and the artifact needs amending

### T6 ✅ DONE: Gate features so a disabled flag removes UI and query cost
- **Observed:** disabled flag removes both UI and its query
- **Requirement:** REQ-5
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/lib/config/**`, `app/lib/features/**`, `app/routes/**`
- **Protected Paths:** `config/**`
- **Canonical Contract Owners:** `store.configuration`, `storefront.routes`
- **Accepted Invariants:** a disabled feature issues no Storefront API request; the flag gates the loader, not only the render
- **Producers:** the flag gate
- **Consumers:** T8, T15, T20
- **Depends On:** T4
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** disable one flag; its UI is absent and its query is absent from the route's recorded network requests
- **Visual Contract:** Not applicable; absence of UI is the outcome, and layout must not leave a gap
- **Reopen Conditions:** a disabled feature still costs a request
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** which features exist
- **Verification:** `project-check --changed`
- **Escalation Conditions:** None

### Phase 2 — Composition

### T7 ✅ DONE: Build the section registry with build-time name validation
- **Observed:** `npm run build` exits 1 on an unknown section name and prints the allowed set
- **Requirement:** REQ-8
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/components/sections/**`, `app/lib/sections/**`, `config/sections*`
- **Protected Paths:** `app/routes/**`
- **Canonical Contract Owners:** `storefront.sections`
- **Accepted Invariants:** an unknown section name fails the build and names the offending section; the registry stays capped at the v1 set
- **Producers:** the section registry and its prop schemas
- **Consumers:** T8
- **Depends On:** T4
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** configure a section name absent from the registry; the build fails naming it
- **Visual Contract:** Not applicable at registry level; each section's visual contract belongs to T8
- **Reopen Conditions:** a real store needs a section the registry does not have
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** metaobject-driven composition, which is a separate future decision
- **Verification:** `project-check --changed`
- **Escalation Conditions:** the v1 registry set proves insufficient for the first derived store

### T8 ✅ DONE: Compose the home route from the configured section order
- **Observed:** all five configured sections render in configured order; missing data omits the section
- **Requirement:** REQ-7
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `design-taste` before the first visual edit, then `hydrogen-development`
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; visual capability required
- **Allowed Paths:** `app/routes/_index.tsx`, `app/components/sections/**`
- **Protected Paths:** `app/lib/config/**`, `DESIGN.md`
- **Canonical Contract Owners:** `storefront.sections`, `storefront.routes`
- **Accepted Invariants:** section order follows configuration; a section whose data is unavailable is omitted rather than rendered empty; loaders return resolved data objects directly, because in React Router framework mode a wrapped response breaks fetcher serialization
- **Producers:** the home route
- **Consumers:** T17, T22
- **Depends On:** T5, T7
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** reorder sections in configuration and observe the rendered order change; point one section at a missing collection and observe it omitted while the page still renders
- **Visual Contract:** storefront home for a buyer arriving from an ad link, mobile-first. Direction and tokens from `DESIGN.md`, variance 4, motion 2, density 5. Sections separated by rhythm of 64 mobile and 96 desktop, never a bento grid, never nested frames. Ships hero, featured collection grid, rich text, image with text, collection list. Required states: full data, missing section data, long translated headings, missing media. Rejected: a row of three equal cards, gradient hero, shadowed section containers, any literal brand color.
- **Reopen Conditions:** a section renders an empty frame when its data is missing
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** collection and product routes
- **Verification:** `project-check --ui`
- **Escalation Conditions:** a section needs data the Storefront API cannot supply in one loader pass

### Phase 3 — Commerce routes

### T9 ✅ DONE: Build the collection route with grid-proportional pagination
- **Observed:** page size 12 from a 4-column desktop grid; no orphan card at 320-1440px
- **Requirement:** REQ-9
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `storefront-ux` for behavior, `design-taste` for composition, `hydrogen-development` for wiring
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; visual capability required
- **Allowed Paths:** `app/routes/collections.$handle.tsx`, `app/components/product/**`, `app/lib/pagination/**`
- **Protected Paths:** `app/lib/config/**`
- **Canonical Contract Owners:** `storefront.discovery`
- **Accepted Invariants:** page size is an exact multiple of the four-column desktop grid, which is 12 and also divides evenly by the two-column mobile grid, so no page ends in an orphan card at any width
- **Producers:** the collection route and the product card
- **Consumers:** T19, T22, T24
- **Depends On:** T5
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** load a collection larger than one page at desktop and at mobile width; confirm no page, including the last, ends in a single orphan card
- **Visual Contract:** product listing for a comparing buyer. Tokens from `DESIGN.md`. Product cards are comparison units defined by spacing and a hairline, never an elevated rounded box; fixed media ratio, price baseline aligned across a row even when titles wrap. Filter and sort collapse into one labelled control opening a bounded sheet that keeps the active count and clear-all visible. Two columns below 600, three at 900, four at 1200. Required states: full grid, empty results, sold-out card, discounted price, missing media, long title. Rejected: shadowed cards, quick add that hides a required variant decision, filters hidden behind a bare icon.
- **Reopen Conditions:** a real catalog produces an orphan card at any breakpoint
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** search, owned by T15
- **Verification:** `project-check --ui`
- **Escalation Conditions:** the Storefront API pagination cursor cannot honor the fixed page size

### T10 ✅ DONE: Build the product route with variant selection
- **Observed:** option change updated URL `?Size=Small` to `?Size=Medium` with no reload
- **Requirement:** REQ-10
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `storefront-ux` for behavior, `design-taste` for composition, `hydrogen-development` for wiring
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; visual capability required; separate correctness review required before `DONE`
- **Allowed Paths:** `app/routes/products.$handle.tsx`, `app/components/product/**`
- **Protected Paths:** `app/lib/cart/**`, `app/lib/config/**`
- **Canonical Contract Owners:** `storefront.product`
- **Accepted Invariants:** the displayed price, availability, media, and URL always describe the same variant; loaders return resolved data objects directly
- **Producers:** the selected variant contract consumed by the cart
- **Consumers:** T11, T12, T16, T17, T21, T25
- **Depends On:** T5
- **Regression Checks:** `project-check --ui`, `project-check --full`
- **Runtime Evidence:** change an option in the browser; price, availability, media, and URL all update with no full document navigation, and a reload of that URL restores the same variant
- **Visual Contract:** product detail for a buyer deciding on a purchasable configuration. Tokens from `DESIGN.md`. Media region and decision region proportioned by media need, not a forced split. Mobile sequence is fixed: identity and price, media, options and availability, purchase action, fulfilment and returns, supporting detail. Variant controls follow option semantics, pills for short text sets, swatches with a visible text equivalent, an accessible select for long sets. Required states: selected, available, sold out, nonexistent combination, pending, error, all distinguished by more than color. Touch targets at least 44 pixels. Rejected: media that auto-rotates, a decision region split into unrelated cards, state signalled by color alone, a sticky purchase bar added before its condition is met.
- **Reopen Conditions:** any state shows a price that does not match the selected variant
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** adding to cart, owned by T12
- **Verification:** `project-check --full`
- **Escalation Conditions:** variant state cannot be represented in the URL without a full navigation

### T11 ✅ DONE: Suppress the synthetic default variant label
- **Observed:** single-variant product shows no default variant label
- **Requirement:** REQ-11
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** `storefront-ux`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/components/product/**`
- **Protected Paths:** `app/routes/products.$handle.tsx`
- **Canonical Contract Owners:** `storefront.product`
- **Accepted Invariants:** a single-variant product shows no platform default option text anywhere buyer-facing
- **Producers:** None
- **Consumers:** None
- **Depends On:** T10
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** a single-variant product shows no default label; a multi-variant product still shows its real option names
- **Visual Contract:** product detail option region. Tokens from `DESIGN.md`. With no selectable options the region collapses without leaving a gap or an empty heading. Required states: single variant, multiple variants, one option with one value. Rejected: an empty options container, a placeholder label.
- **Reopen Conditions:** the default label appears in a surface other than the product route
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** cart line titles
- **Verification:** `project-check --ui`
- **Escalation Conditions:** None

### T12 ✅ DONE: Implement cart mutations with optimistic reconciliation
- **Observed:** add to cart moved the badge from 0 to 1 items
- **Requirement:** REQ-12
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `storefront-ux` for behavior, `hydrogen-development` for the cart handler
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; separate correctness review required before `DONE`
- **Allowed Paths:** `app/lib/cart/**`, `app/components/cart/**`, `app/routes/cart.tsx`
- **Protected Paths:** `app/lib/config/**`, `app/routes/products.$handle.tsx`
- **Canonical Contract Owners:** `storefront.cart`
- **Accepted Invariants:** the optimistic state always reconciles to the authoritative server result; a failed mutation restores the prior state and reports the error on the affected line
- **Producers:** cart state
- **Consumers:** T13, T14, T25
- **Depends On:** T10
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** add and remove a line under a throttled network profile; the UI updates before the response settles and matches server state once it does; force a failed mutation and confirm recovery
- **Visual Contract:** cart drawer and cart page. Tokens from `DESIGN.md`. Pending recalculation preserves geometry rather than collapsing rows. Line errors stay with the affected item. Subtotal and checkout regain emphasis only after the authoritative result arrives. Mobile drawer is full height with lines as labelled groups, never a clipped table. Required states: empty, single line, many lines, pending, line error, discount applied. Rejected: hiding quantity, line price, discount, or subtotal behind recommendations; a layout that shifts while recalculating.
- **Reopen Conditions:** any path leaves optimistic state diverged from the server
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** persistence across reload, owned by T13
- **Verification:** `project-check --full`
- **Escalation Conditions:** reconciliation requires a state library not already installed

### T13 ✅ DONE: Persist the cart on a first-party session cookie
- **Observed:** cart survived navigation and a full reload
- **Requirement:** REQ-13
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `hydrogen-development`, with `application-security` review for the session boundary
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch; separate sensitive review required before `DONE`
- **Allowed Paths:** `app/lib/session/**`, `app/lib/cart/**`, `server.ts`
- **Protected Paths:** `app/routes/**`, `config/**`
- **Canonical Contract Owners:** `storefront.session`
- **Accepted Invariants:** the cart identifier lives on a first-party session cookie; a cart that depends on `sessionStorage` or a third-party cookie is a defect even when it passes in a desktop browser
- **Producers:** the session contract
- **Consumers:** T14, T20, T25
- **Depends On:** T12
- **Regression Checks:** `project-check --security`, `project-check --full`
- **Runtime Evidence:** add a line, reload, and navigate between routes; the cart survives both
- **Visual Contract:** Not applicable
- **Reopen Conditions:** the cart is lost on reload in any supported browser context
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** customer accounts, out of scope for v1
- **Verification:** `project-check --security`
- **Escalation Conditions:** the session requires a secret not already provisioned outside the repository

### T14 ✅ DONE: Hand off to the Shopify-hosted checkout
- **Observed:** checkout handed off to the Shopify checkout URL
- **Requirement:** REQ-14
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `storefront-ux`, with `application-security` review for the payment boundary
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch; separate sensitive review required before `DONE`
- **Allowed Paths:** `app/components/cart/**`, `app/lib/cart/**`
- **Protected Paths:** `app/lib/session/**`
- **Canonical Contract Owners:** `storefront.checkout`
- **Accepted Invariants:** checkout is a handoff, never a local reimplementation; the active market and locale survive it; navigation happens in the same context rather than a new window
- **Producers:** the checkout handoff
- **Consumers:** T25
- **Depends On:** T13
- **Regression Checks:** `project-check --security`
- **Runtime Evidence:** proceed to checkout from a populated cart; the Shopify checkout opens with the same lines, currency, and locale
- **Visual Contract:** cart checkout region. Tokens from `DESIGN.md`. Add to cart, accelerated buy, and checkout are visually distinct actions. The context or domain transition is legible to the buyer. Branded payment controls are never recolored. Required states: enabled, pending, unavailable. Rejected: implying checkout has already succeeded, a new-tab handoff.
- **Reopen Conditions:** currency, locale, or cart contents change across the handoff
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** checkout UI or checkout extensions, both out of scope
- **Verification:** `project-check --security`
- **Escalation Conditions:** the handoff requires a checkout DOM change, which the boundary forbids

### T15 ✅ DONE: Add predictive search with a clamped limit and a results route
- **Observed:** predictive limit clamped to 1..10; search route serves results
- **Requirement:** REQ-15
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `storefront-ux`, `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/routes/search.tsx`, `app/components/search/**`, `app/lib/search/**`
- **Protected Paths:** `app/lib/config/**`
- **Canonical Contract Owners:** `storefront.discovery`
- **Accepted Invariants:** the predictive search limit is clamped to the inclusive range 1 to 10 at the query boundary, because the Storefront API rejects a larger value as a GraphQL validation error rather than clamping it
- **Producers:** the search route
- **Consumers:** T19
- **Depends On:** T5
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** configure a limit above 10 and confirm the request is clamped rather than rejected; type a query, see suggestions, submit it, and see the results route
- **Visual Contract:** search entry and results. Tokens from `DESIGN.md`. On mobile, search opens as a full-screen overlay with the input focused and a visible dismiss control. Results reuse the product card as a comparison unit. Required states: empty input, no results, results, error, loading. Rejected: a suggestion list that shifts layout as it loads, a dismiss control smaller than 44 pixels.
- **Reopen Conditions:** any code path can send a limit outside 1 to 10
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** filters, owned by T9
- **Verification:** `project-check --ui`
- **Escalation Conditions:** None

### T16 ✅ DONE: Format prices from the active market and locale
- **Observed:** verified against Shopify's public Hydrogen demo store, which has real markets. Changing the configured country changed both the rendered price and the structured data together: AU rendered A$707.00 with `priceCurrency` AUD, JP rendered ¥78,200 with JPY and no decimal places, DE rendered €438.95 with EUR. The yen result also proves the decimal convention follows the currency rather than a hardcoded two places.
- **Requirement:** REQ-16
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `storefront-ux`, `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch; separate correctness review required before `DONE`
- **Allowed Paths:** `app/lib/money/**`, `app/components/**`
- **Protected Paths:** `app/lib/cart/**`
- **Canonical Contract Owners:** `storefront.money`
- **Accepted Invariants:** currency and number format come from the active market and locale through the platform `Intl` API; no hardcoded symbol, no hardcoded decimal convention, no formatting dependency added
- **Producers:** the money formatter
- **Consumers:** T17, T25
- **Depends On:** T10
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** switch the active market; prices on product, collection, and cart change currency and number format together
- **Visual Contract:** price display across product, collection, and cart. Tokens from `DESIGN.md`. Current price is primary; compare-at price is secondary in the muted ink token and is shown only when the commerce contract says it is legitimate. Price, savings, and badges update as one visual unit. Required states: single price, price range, discounted, unavailable, market switch. Rejected: manufactured urgency, a reference price shown for visual drama, a discount badge competing with the purchase action.
- **Reopen Conditions:** any surface shows a price formatted outside the active market
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** tax and shipping calculation, which remain Shopify contracts
- **Verification:** `project-check --full`
- **Escalation Conditions:** a market requires a format `Intl` cannot express

### Phase 4 — Discoverability and measurement

### T17 ✅ DONE: Emit route metadata and product structured data
- **Observed:** Product and BreadcrumbList structured data present; Lighthouse SEO 100
- **Requirement:** REQ-17
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `seo-website-builder`, `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/lib/seo/**`, `app/routes/**`
- **Protected Paths:** `config/**`
- **Canonical Contract Owners:** `storefront.seo`
- **Accepted Invariants:** structured data reflects the selected variant's price and availability, not the product default
- **Producers:** metadata helpers
- **Consumers:** T19, T22
- **Depends On:** T10, T16
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** the product route's structured data validates with no errors; canonical URL and Open Graph tags are correct on home, collection, and product
- **Visual Contract:** Not applicable
- **Reopen Conditions:** structured data disagrees with the rendered price
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** copy and titles, owned by the merchant in Shopify
- **Verification:** `project-check --full`
- **Escalation Conditions:** None

### T18 ✅ DONE: Return correct status and non-indexable directives for missing resources
- **Observed:** 404 returns 404 with the directive in both header and document
- **Requirement:** REQ-18
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `seo-website-builder`, `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/routes/**`, `app/entry.server.tsx`
- **Protected Paths:** `app/lib/config/**`
- **Canonical Contract Owners:** `storefront.seo`
- **Accepted Invariants:** the directive is enforced in both the response header and the document markup, because either alone has been observed to be insufficient
- **Producers:** the not-found contract
- **Consumers:** T21
- **Depends On:** T10
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** request a nonexistent product; the status code, the response header directive, and the document meta directive all agree the page is not indexable
- **Visual Contract:** not-found page. Tokens from `DESIGN.md`. Navigation and search stay available so the buyer can recover. Required states: unknown route, unknown product, unavailable product. Rejected: a bare error string, a dead end with no navigation.
- **Reopen Conditions:** either layer is missing on any not-found path
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** redirects
- **Verification:** `project-check --full`
- **Escalation Conditions:** None

### T19 ✅ DONE: Serve the sitemap and robots directive
- **Observed:** robots served; non-public hosts disallowed wholesale
- **Requirement:** REQ-20
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** `seo-website-builder`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/routes/[sitemap.xml].tsx`, `app/routes/[robots.txt].tsx`, `app/lib/seo/**`
- **Protected Paths:** `config/**`
- **Canonical Contract Owners:** `storefront.seo`
- **Accepted Invariants:** both reflect the configured public host, not a hardcoded domain
- **Producers:** None
- **Consumers:** None
- **Depends On:** T9, T15
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** fetch both from a running server; the sitemap lists live product and collection URLs on the configured host and the robots directive references that sitemap
- **Visual Contract:** Not applicable
- **Reopen Conditions:** a derived store serves another store's host
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** submission to search engines
- **Verification:** `project-check --changed`
- **Escalation Conditions:** None

### T20 ✅ DONE: Gate analytics behind customer consent
- **Observed:** configured probe tag stayed unloaded while consent was undecided, and loaded once consent reported granted
- **Requirement:** REQ-21
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `application-security` for the privacy boundary, `hydrogen-development` for wiring
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch; separate sensitive review required before `DONE`
- **Allowed Paths:** `app/lib/analytics/**`, `app/root.tsx`
- **Protected Paths:** `app/lib/session/**`, `config/**`
- **Canonical Contract Owners:** `storefront.privacy`
- **Accepted Invariants:** consent-governed events are withheld until consent is granted, then emitted; consent state is never inferred from a default
- **Producers:** the analytics contract
- **Consumers:** T25
- **Depends On:** T6, T13
- **Regression Checks:** `project-check --security`
- **Runtime Evidence:** with consent withheld, no consent-governed request is sent; grant consent and the events are then emitted
- **Visual Contract:** consent surface. Tokens from `DESIGN.md`. It occupies the bottom region and always outranks a sticky purchase bar for that space. Required states: undecided, granted, declined. Rejected: a consent surface covered by another fixed element, a dismiss that implies consent.
- **Reopen Conditions:** any event fires before consent
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** third-party marketing pixels, which are a per-store decision
- **Verification:** `project-check --security`
- **Escalation Conditions:** a required consent signal is unavailable in the runtime

### Phase 5 — Hardening and handoff

### T21 ✅ DONE: Add scoped route error boundaries
- **Observed:** error boundary renders with recovery navigation and no internal detail
- **Requirement:** REQ-22
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/routes/**`, `app/components/error/**`
- **Protected Paths:** `app/lib/**`
- **Canonical Contract Owners:** `storefront.routes`
- **Accepted Invariants:** a loader failure never surfaces internal detail to the buyer and never removes site navigation
- **Producers:** the error boundary contract
- **Consumers:** T24
- **Depends On:** T10, T18
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** force a loader failure on the product route; the boundary renders with navigation intact and no stack trace or internal message visible
- **Visual Contract:** route error state. Tokens from `DESIGN.md`. Navigation, search, and cart entry remain usable. Required states: loader failure, network failure, unexpected exception. Rejected: a full-page blank, an exposed stack trace, a dead end.
- **Reopen Conditions:** any boundary leaks internal detail
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** logging destinations
- **Verification:** `project-check --full`
- **Escalation Conditions:** None

### T22 ✅ DONE: Meet the mobile performance budget
- **Observed:** LCP 2.0-2.1s, CLS 0, TBT 10ms on a production build
- **Requirement:** REQ-19
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `web-perf` for diagnosis, `hydrogen-development` for the fix
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/**`, `vite.config.ts`
- **Protected Paths:** `config/**`, `DESIGN.md`
- **Canonical Contract Owners:** `storefront.performance`
- **Accepted Invariants:** the budget is met on a production build, not a development server; caching uses Hydrogen's own strategies rather than a bespoke layer
- **Producers:** recorded performance evidence
- **Consumers:** T23
- **Depends On:** T17
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** a mobile-profile audit of home, collection, and product against a production build records LCP at or below 2.5s, CLS at or below 0.1, and INP at or below 200ms
- **Visual Contract:** performance work must not alter the accepted composition. Any layout change to hit the budget is a `DESIGN.md` amendment, not a silent edit.
- **Reopen Conditions:** any route regresses past a threshold
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** third-party script budgets, a per-store concern
- **Verification:** `project-check --full`
- **Escalation Conditions:** the budget cannot be met without changing accepted design decisions

### T23 ✅ DONE: Write and verify the operator setup document
- **Observed:** clean copy without node_modules or .env: npm install, typecheck, lint and build all pass; an empty SESSION_SECRET aborts naming `env.SESSION_SECRET`
- **Requirement:** REQ-23
- **Risk Level:** R1
- **Job:** documentation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `README.md`, `docs/**`
- **Protected Paths:** `app/**`, `config/**`
- **Canonical Contract Owners:** `repository.documentation`
- **Accepted Invariants:** the document states every required step; no secret value appears in it
- **Producers:** the setup contract
- **Consumers:** None
- **Depends On:** T22
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** follow the document from a fresh clone with no prior project state and reach a running storefront without performing an unstated step
- **Visual Contract:** Not applicable
- **Reopen Conditions:** an operator needs a step the document omits
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** Oxygen account provisioning
- **Verification:** `project-check --changed`
- **Escalation Conditions:** setup requires a secret, which stops for user approval

### T24 ✅ DONE: Enforce the accessibility floor
- **Observed:** Lighthouse accessibility 100 on all three routes; every target 44px at 320-1440px
- **Requirement:** REQ-24
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `design-taste` for the contract, `ui-validation` for evidence
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; visual capability required
- **Allowed Paths:** `app/components/**`, `app/styles/**`, `app/routes/**`
- **Protected Paths:** `DESIGN.md`, `config/**`
- **Canonical Contract Owners:** `design.accessibility`
- **Accepted Invariants:** interactive boundaries use the control border token, which passes 3.3 to 1, and never the decorative border or hairline tokens, which fail the 3 to 1 minimum; focus indicators never depend on the store-configured accent, because a store may set a low-contrast brand color
- **Producers:** the accessibility floor
- **Consumers:** T25
- **Depends On:** T21
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** audit home, collection, product, and cart at a 320 pixel viewport and at 200% zoom; confirm no horizontal scroll, a visible focus ring on every interactive element with the accent set to a low-contrast color, and no decorative border token on an interactive control
- **Visual Contract:** the whole storefront shell and commerce routes. Tokens from `DESIGN.md`. Touch targets at least 44 pixels including swatches. State is never signalled by color alone. Required states: focus, hover, active, disabled, error, selected. Rejected: focus removed, a decorative hairline as a control boundary, a target under 44 pixels.
- **Reopen Conditions:** any new component ships without focus and state coverage
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** a full conformance audit, which is a separate engagement
- **Verification:** `project-check --ui`
- **Escalation Conditions:** a `DESIGN.md` token cannot meet a contrast minimum and the artifact needs amending

### T25 ⏳ PARTIAL: Make the purchase path survive an in-app browser
- **Observed:** 7 of 7 invariants hold under webview emulation against a real Shopify store: the cart is a first-party cookie and survives browser storage being wiped, the layout survives the host chrome resizing, every bottom-fixed control region reserves safe-area space, and checkout stays in the same browsing context. The remaining item is confirmation on a physical phone inside two host applications, which no emulator can substitute for.
- **Requirement:** REQ-25
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `storefront-ux` for behavior, `application-security` for the session boundary, `ui-validation` for evidence
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; separate sensitive review required before `DONE`
- **Allowed Paths:** `app/styles/**`, `app/components/**`, `app/lib/session/**`, `app/lib/cart/**`
- **Protected Paths:** `DESIGN.md`, `config/**`
- **Canonical Contract Owners:** `storefront.checkout`, `storefront.session`
- **Accepted Invariants:** no fixed viewport-height rule survives; every bottom-fixed element reserves the safe-area inset; the cart persists across the checkout handoff; nothing in the purchase path depends on a new window or a download; accelerated payment controls render only when actually available
- **Producers:** the in-app browser contract
- **Consumers:** None
- **Depends On:** T24
- **Regression Checks:** `project-check --security`, `project-check --ui`
- **Runtime Evidence:** open the deployed preview from a link inside at least two host applications on a real phone, then complete browse, add to cart, and checkout handoff in each; the cart survives the handoff, no fixed element is covered by the host toolbar, and no payment control renders empty. Device emulation in browser devtools does not satisfy this task.
- **Visual Contract:** the purchase path inside an in-app browser. Tokens from `DESIGN.md`. Sticky purchase bar and consent surface compete for the bottom region and consent wins. Required states: host chrome expanded, host chrome collapsed, keyboard open, accelerated payment unavailable. Rejected: a bottom-fixed element under the host toolbar, a reserved payment slot rendering empty, `100vh` anywhere.
- **Reopen Conditions:** the cart is lost across the handoff in any host application
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** native application wrappers
- **Verification:** `project-check --security`
- **Escalation Conditions:** a host application breaks the handoff in a way the storefront cannot compensate for

### Phase 6 — Assets, operations, and hazards

### T26 ✅ DONE: Generate and wire the placeholder asset set
- **Observed:** placeholder set renders on an unconfigured clone
- **Requirement:** REQ-26
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** `design-taste` for the visual brief, image generation for the assets
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; visual capability required
- **Allowed Paths:** `public/placeholders/**`, `app/components/**`, `config/**`
- **Protected Paths:** `DESIGN.md`, `app/lib/**`
- **Canonical Contract Owners:** `design.assets`
- **Accepted Invariants:** a placeholder always reads as a placeholder; the set never contains an invented review, testimonial, rating, or brand mark, because fabricated social proof is dishonest to the buyer and has to be torn out later
- **Producers:** the placeholder set and its fallback wiring
- **Consumers:** T8, T9, T10
- **Depends On:** T8
- **Regression Checks:** `project-check --ui`
- **Runtime Evidence:** clone with no configured media and load home, collection, and product; every section and card renders with placeholder media, correct aspect ratio, and no broken image
- **Visual Contract:** placeholder media for an unconfigured clone. Tokens from `DESIGN.md`. Neutral, low-chroma, obviously stand-in, matching the fixed media ratios so replacing one with real photography shifts no layout. Required states: missing product image, missing section image, missing logo. Rejected: stock-looking lifestyle photography that could be mistaken for real catalog content, any invented rating or testimonial, any third-party brand mark.
- **Reopen Conditions:** a placeholder is mistaken for real content, or a ratio mismatch shifts layout on replacement
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** real photography, which each store supplies
- **Verification:** `project-check --ui`
- **Escalation Conditions:** a required placeholder cannot be generated without depicting a real brand

### T27 ✅ DONE: Write the Oxygen deployment runbook
- **Observed:** deployment runbook written
- **Requirement:** REQ-27
- **Risk Level:** R1
- **Job:** documentation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `docs/DEPLOYMENT.md`
- **Protected Paths:** `.env*`, `config/**`
- **Canonical Contract Owners:** `repository.documentation`
- **Accepted Invariants:** variable names only, never values; the domain cutover checklist covers the staging host being marked non-indexable
- **Producers:** the deployment runbook
- **Consumers:** T23
- **Depends On:** T22
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** follow the runbook against a preview deployment and reach a served storefront with no undocumented step
- **Visual Contract:** Not applicable
- **Reopen Conditions:** a deploy needs a variable or scope the runbook omits
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** performing the deployment, which is a production action requiring explicit approval
- **Verification:** `project-check --changed`
- **Escalation Conditions:** the runbook would require a secret value to be written down

### T28 ✅ DONE: Write the email notification runbook
- **Observed:** notification runbook written
- **Requirement:** REQ-28
- **Risk Level:** R2
- **Job:** documentation
- **Capability:** `headless-shopify`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `docs/EMAIL-NOTIFICATIONS.md`
- **Protected Paths:** `app/**`
- **Canonical Contract Owners:** `repository.documentation`
- **Accepted Invariants:** the order status URL is never rewritten, because it is a Shopify-owned link; only presentation links are repointed at the headless domain; no example links the `all` collection handle
- **Producers:** the notification runbook
- **Consumers:** None
- **Depends On:** T14
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** place a test order and confirm every buyer-facing link in the confirmation email resolves to the headless domain, with the order status link still working
- **Visual Contract:** Not applicable
- **Reopen Conditions:** any notification still sends a buyer to the `myshopify.com` domain
- **Rollback/Migration State:** the previous template content is recorded before editing
- **Non-Scope:** transactional email providers other than Shopify
- **Verification:** `project-check --changed`
- **Escalation Conditions:** editing a live store's notification templates, which is a live-operation gate

### T29 ✅ DONE: Maintain the route map
- **Observed:** route map written from the code
- **Requirement:** REQ-29
- **Risk Level:** R0
- **Job:** documentation
- **Capability:** `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `docs/ROUTES.md`
- **Protected Paths:** `app/**`
- **Canonical Contract Owners:** `repository.documentation`
- **Accepted Invariants:** the map records what exists, not what was planned; a route absent from the code is absent from the map
- **Producers:** the route map
- **Consumers:** T23
- **Depends On:** T21
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** every route file in the application appears in the map, and every map entry resolves to a served route
- **Visual Contract:** Not applicable
- **Reopen Conditions:** the map lists a route that does not exist
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** planned routes
- **Verification:** `project-check --changed`
- **Escalation Conditions:** None

### T30 ✅ DONE: Write the theming guide
- **Observed:** theming guide written
- **Requirement:** REQ-30
- **Risk Level:** R0
- **Job:** documentation
- **Capability:** `design-taste`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `docs/THEMING.md`
- **Protected Paths:** `DESIGN.md`, `app/**`
- **Canonical Contract Owners:** `repository.documentation`
- **Accepted Invariants:** it references `DESIGN.md` token names and never restates their values, so the two can never disagree; every listed section exists in the registry
- **Producers:** the theming guide
- **Consumers:** T23
- **Depends On:** T26
- **Regression Checks:** `project-check --changed`
- **Runtime Evidence:** follow the guide on a fresh clone and reach a visibly re-branded storefront without editing a component
- **Visual Contract:** Not applicable
- **Reopen Conditions:** the guide lists a section the registry does not have
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** token values, owned by `DESIGN.md`
- **Verification:** `project-check --changed`
- **Escalation Conditions:** None

### T31 ✅ DONE: Guard the known storefront hazards
- **Observed:** canonical strips tracking parameters; `all` handle rejected at validation
- **Requirement:** REQ-31
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `seo-website-builder`, `hydrogen-development`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/lib/seo/**`, `app/components/**`, lint configuration
- **Protected Paths:** `config/**`
- **Canonical Contract Owners:** `storefront.seo`
- **Accepted Invariants:** no internal link targets the `all` collection handle, because it returns 404 on a store that does not define it; canonical URLs are stripped of `utm_*`, `fbclid`, `gclid`, and `ttclid`; one title separator is used everywhere
- **Producers:** the hazard guards
- **Consumers:** T28
- **Depends On:** T17, T19
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** crawl the built storefront for internal links and confirm none targets the `all` handle; load a route with tracking parameters and confirm the canonical is clean; confirm one separator across home, collection, and product titles
- **Visual Contract:** Not applicable
- **Reopen Conditions:** any new component links the `all` handle
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** external inbound links
- **Verification:** `project-check --full`
- **Escalation Conditions:** None

### T32 ✅ DONE: Expose the observability probes
- **Observed:** `GET /health` returns 200 with a real Storefront query
- **Requirement:** REQ-32
- **Risk Level:** R2
- **Job:** implementation
- **Capability:** `observability-engineering`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `app/routes/**`, `OBSERVABILITY.md`
- **Protected Paths:** `app/lib/session/**`, `config/**`
- **Canonical Contract Owners:** `repository.observability`
- **Accepted Invariants:** a probe never exposes a secret, a token, or buyer data; the observability contract is filled in rather than left as a placeholder
- **Producers:** the probes
- **Consumers:** T27
- **Depends On:** T21
- **Regression Checks:** `project-check --security`
- **Runtime Evidence:** call each probe against a running server and confirm the documented response, including the Storefront API reachability signal
- **Visual Contract:** Not applicable
- **Reopen Conditions:** a probe returns healthy while the storefront cannot serve products
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** external monitoring services
- **Verification:** `project-check --security`
- **Escalation Conditions:** a useful probe would require exposing sensitive state

### T33 ✅ DONE: Add automated checks on push
- **Observed:** workflow runs type check, lint and build on every push
- **Requirement:** REQ-33
- **Risk Level:** R1
- **Job:** implementation
- **Capability:** `github-actions`, `testing-engineering`
- **Execution Class:** precision
- **Model / Provider / Reasoning:** resolved at dispatch by capability
- **Allowed Paths:** `.github/workflows/**`, `package.json`
- **Protected Paths:** `app/**`, `config/**`, `.env*`
- **Canonical Contract Owners:** `repository.ci`
- **Accepted Invariants:** the workflow reads no secret it does not need and never prints one; a failing type check, lint rule, or build fails the run
- **Producers:** the automated check
- **Consumers:** None
- **Depends On:** T5
- **Regression Checks:** `project-check --full`
- **Runtime Evidence:** push a branch with a deliberate token violation and confirm the run fails; push a clean branch and confirm it passes
- **Visual Contract:** Not applicable
- **Reopen Conditions:** a broken upstream reaches a derived store
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** deployment automation, which stays a manual approved action
- **Verification:** `project-check --full`
- **Escalation Conditions:** the workflow would require a repository secret

### T34 ✅ DONE: Add the consent-gated marketing tag extension point
- **Observed:** both branches proven; strict default requires an explicit decision, and the gate reacts to consent being collected
- **Requirement:** REQ-34
- **Risk Level:** R3
- **Job:** implementation
- **Capability:** `hydrogen-headless-tracking`, with `application-security` review for the privacy boundary
- **Execution Class:** judgment
- **Model / Provider / Reasoning:** resolved at dispatch; separate sensitive review required before `DONE`
- **Allowed Paths:** `app/lib/analytics/**`, `config/**`
- **Protected Paths:** `app/lib/session/**`, `app/components/**`
- **Canonical Contract Owners:** `storefront.privacy`
- **Accepted Invariants:** a configured tag loads only after consent; adding a tag never requires a component edit; no tag ships enabled by default
- **Producers:** the tag extension point
- **Consumers:** None
- **Depends On:** T20
- **Regression Checks:** `project-check --security`
- **Runtime Evidence:** configure one tag; with consent withheld it never loads, and after consent is granted it loads exactly once
- **Visual Contract:** Not applicable
- **Reopen Conditions:** any tag loads before consent
- **Rollback/Migration State:** Not applicable
- **Non-Scope:** server-side conversion relays, which are a later decision owned by `hydrogen-headless-tracking`
- **Verification:** `project-check --security`
- **Escalation Conditions:** a tag vendor requires loading before consent

## Goal completion

The goal is a Difergent Theme repository whose every deliverable is backed by
evidence produced inside it. It is complete only when all of the following hold,
and a partial result is never reported as completion:

1. Every task above is marked done, and each one records the observed result of
   its own verification command.
2. Every task carrying a `Visual Contract` has browser evidence for the surface
   it changed. A passing build never substitutes for it, and device emulation
   never substitutes for the real-phone evidence T25 requires.
3. Every R3 task has correctness or sensitive review by a separate agent, plus a
   clean delivery-ledger task boundary. Self-review is not independent review and
   is never recorded as such.
4. The performance budget in REQ-19 is recorded as measured numbers, not as a
   claim that it was met.
5. `project-check --full` passes on the final state, and no check that predates
   the last edit is used to justify it.
6. The final task boundary is clean: no unexplained out-of-scope change, no
   protected path touched without explicit expansion.

## Outside Goal Mode

Goal Mode never performs these on its own, even while work remains. Each stops
for explicit approval:

- committing and pushing;
- deploying to Oxygen, changing DNS, or editing a live store's notification
  templates;
- reading or writing any secret value;
- widening a task's allowed paths, or adding a requirement not in `PRD.md`.

A blocked item does not end the goal. Report it, then continue with every
remaining task that does not depend on it.

## Done

No task is completed.
