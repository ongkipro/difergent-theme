# Difergent Theme

A reusable Shopify Hydrogen storefront. One upstream repository, cloned per
store, where launching a store is a configuration exercise rather than a
development project.

Branding, navigation, homepage composition and optional features all come from
`config/` and environment variables. No component or route file is edited to
launch a standard store.

- Product requirements: `PRD.md`
- Technical plan: `PLAN.md`
- Design owner and token contract: `DESIGN.md`
- Execution queue: `TASKS.md`
- Theming a store: `docs/THEMING.md`
- Deploying: `docs/DEPLOYMENT.md`
- Email notifications: `docs/EMAIL-NOTIFICATIONS.md`
- Route map: `docs/ROUTES.md`

## Setup

Requires Node 22 or 24, and npm.

```bash
git clone <this repository> my-store
cd my-store
npm install
```

Create a `.env` file at the repository root with the three required variables.
`.env` is git-ignored and must stay that way. Take the values from Shopify
admin; never paste one into a chat, a log, or a commit.

```bash
SESSION_SECRET=
PUBLIC_STORE_DOMAIN=
PUBLIC_STOREFRONT_API_TOKEN=
```

| Variable | Where it comes from |
|---|---|
| `SESSION_SECRET` | Any random string of at least 32 characters |
| `PUBLIC_STORE_DOMAIN` | Your `*.myshopify.com` domain |
| `PUBLIC_STOREFRONT_API_TOKEN` | The **public** Storefront API token from the Hydrogen or Headless channel |

Then:

```bash
npm run dev
```

Without a store yet, there are two options:

- `PUBLIC_STORE_DOMAIN=mock.shop` — no token needed, but a single fixed
  currency and no market behaviour.
- Shopify's public Hydrogen demo store, which exercises real markets and a real
  checkout: `PUBLIC_STORE_DOMAIN=hydrogen-preview.myshopify.com` with the
  publicly documented token `3b580e70970c4528da70c98e097c2fa0` and
  `PUBLIC_CHECKOUT_DOMAIN=checkout.hydrogen.shop`. Use it to verify market
  currency, variant selection and the checkout handoff before your own store
  exists.

A missing or empty `SESSION_SECRET` or `PUBLIC_STORE_DOMAIN` aborts the boot and
names the offending variable, rather than serving a broken page.

## Make it yours

Start at `docs/THEMING.md`. The shortest meaningful change is one line in
`config/tokens.ts`:

```ts
accent: '#1F6B4A',
```

That re-brands the primary purchase action everywhere without touching a
component.

## Checks

```bash
npm run typecheck   # configuration shape and route types
npm run lint        # includes the design token rule
npm run build       # production bundle
```

These three also run in CI on every push.

A green build is not evidence that a rendered surface works. For anything
buyer-visible, open it in a browser, and open it on a real phone from inside
Instagram or WhatsApp before trusting the purchase path.
