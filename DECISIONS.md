# Decision Register — difergent-theme

Updated: 2026-09-08

Record accepted decisions that materially constrain product behavior,
architecture, security, data, operations, or delivery. Repository evidence must
support each decision; AI output alone is not evidence.

| ID | Status | Decision | Drivers | Evidence | Supersedes |
|---|---|---|---|---|---|
| — | — | No decision recorded yet | — | — | — |

Use stable IDs such as `DEC-001`. When a decision needs detailed alternatives or
consequences, add a repository-owned ADR and link it from this register. Never
rewrite history silently: mark the old decision superseded and add the new one.

## 2026-09-08 — Accepted decisions

### D1. Tokens are emitted under a `--df-*` namespace
Runtime tokens are emitted as `--df-color-*`, `--df-space-*` and so on, and
Tailwind's `@theme` carries only breakpoints.

**Why:** naming them `--color-*` collided with Tailwind v4's own theme
namespace. A theme entry of the form `--color-action: var(--color-action)` is
circular and resolves to nothing, which rendered the primary purchase action as
black text on a black background at a contrast ratio of 1.19 to 1. The build was
green throughout.

**Consequence:** components reference `var(--df-*)` directly rather than
Tailwind colour utilities. Any new token follows the same prefix.

### D2. The skeleton's stylesheets were removed, not adapted
`app/styles/reset.css` and `app/styles/app.css` are deleted; Tailwind's preflight
is the only reset.

**Why:** they were unlayered, and an unlayered rule outranks every Tailwind
utility regardless of specificity. `a { color: #000 }` in the reset silently beat
every link colour utility in the project. Layer order decides across layers, not
specificity, so reasoning about it as a specificity contest gives the wrong
answer.

**Consequence:** every component that relied on those class names was restyled
with tokens. Any project CSS added later must sit inside an `@layer`.

### D3. Hydrogen's `Money` renders a block element
Every `Money` in an inline context passes `as="span"`.

**Why:** the default is a `div`, and a `div` inside a `p` or a `small` is invalid
HTML. React repaired the DOM on the client, which produced hydration error #418
on every page carrying a price.

**Consequence:** a price added to an inline context must set `as="span"`.

### D4. The storefront blocks indexing on any host that is not the configured one
`robots.txt` disallows everything unless the request origin equals
`config.brand.publicHost`, and the response also carries `X-Robots-Tag`.

**Why:** a preview deployment serves the same catalogue as production. Indexed,
it competes with the real storefront.

**Consequence:** `publicHost` is load-bearing, not cosmetic. A wrong value makes
a live store uncrawlable, which is the safer direction to fail.

### D5. Development runs against mock.shop
No Storefront API token exists on this machine, so local verification uses
Shopify's mock catalogue through an env file outside the repository.

**Why:** the repository `.env` is protected by the secret gate and cannot be
edited from this session, and no token was available to place in it.

**Consequence:** market currency switching, consent behaviour and email
notification links remain unverified until a real token is supplied.
