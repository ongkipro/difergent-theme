# Deploying to Oxygen

No secret value appears in this file. Only names.

Deployment is a production action. It stops for explicit approval and is never
performed automatically.

## Prerequisites

- The Hydrogen sales channel installed on the store.
- A repository linked to the Hydrogen storefront in Shopify admin, so Oxygen
  builds on push.
- Storefront API access scopes on the token:
  `unauthenticated_read_product_listings`,
  `unauthenticated_read_product_inventory`,
  `unauthenticated_read_collection_listings`.

## Environment variables

Set these in the Oxygen environment, not in the repository. `.env` is ignored by
git and must stay that way.

| Name | Required | Notes |
|---|---|---|
| `SESSION_SECRET` | yes | At least 32 characters. Rotating it signs every visitor out |
| `PUBLIC_STORE_DOMAIN` | yes | The `*.myshopify.com` domain |
| `PUBLIC_STOREFRONT_API_TOKEN` | yes | The **public** token. A private token in this variable is a disclosure |
| `PUBLIC_STOREFRONT_ID` | no | Enables Shopify analytics attribution |
| `PUBLIC_CHECKOUT_DOMAIN` | no | Needed for the consent API and checkout continuity |
| `PUBLIC_STOREFRONT_API_VERSION` | no | Defaults to the version the installed Hydrogen targets |

`SESSION_SECRET` and `PUBLIC_STORE_DOMAIN` are validated at boot. A missing one
aborts the worker with the offending name rather than serving a broken page.

Read development credentials through `secrets-env`; never `source` a secrets
file, and never paste a value into a prompt, a log, or this document.

## Before the first deploy

- [ ] `config/brand.ts` → `publicHost` is the real production origin, with no
      trailing slash. Canonical URLs and the robots policy both derive from it.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` all pass locally.
- [ ] `GET /health` returns 200 against a local production preview.

## Domain cutover

- [ ] Point the apex or subdomain at Oxygen per Shopify's current DNS
      instructions for the linked storefront.
- [ ] Set the storefront domain as the Primary Online Store domain so checkout
      stays on a domain the buyer recognises.
- [ ] Redirect apex to `www`, or the reverse. Pick one and be consistent; the
      canonical URL must match the one you keep.
- [ ] Confirm `https://<public host>/robots.txt` allows crawling, and that the
      `*.oxygen.net` preview host still disallows it. That switch is automatic:
      it keys off `publicHost`.
- [ ] Repoint the Shopify email templates. See `EMAIL-NOTIFICATIONS.md`; the
      defaults send buyers to `*.myshopify.com`.

## After deploying

- [ ] `GET /health` returns 200 on the production host.
- [ ] Home, a collection and a product each return 200 and render.
- [ ] A nonexistent product returns 404 with `X-Robots-Tag: noindex, nofollow`.
- [ ] Open the storefront on a real phone, from a link inside Instagram or
      WhatsApp, and complete browse → add to cart → checkout handoff. Device
      emulation does not reproduce an in-app browser.
