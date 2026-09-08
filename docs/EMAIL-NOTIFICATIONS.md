# Shopify email notifications on a headless storefront

A headless storefront introduces a failure that is invisible until the first
real order: Shopify's notification templates are Liquid, and their default link
variables resolve to the `*.myshopify.com` domain. A buyer who clicks one leaves
the storefront they just bought from and lands on a bare Shopify domain.

Editing a live store's notification templates is a live operation. It stops for
explicit approval.

## The rule

Repoint **presentation** links at the headless domain. Never rewrite the
**order status** link.

`order_status_url` is generated and signed by Shopify. It is the buyer's only
route to their order status and any post-purchase flow. Rewriting it breaks
both.

## Templates to change

| Template | What to repoint |
|---|---|
| Order confirmation | Logo link, "continue shopping", any collection or product link. Keep `order_status_url` as it is |
| Shipping confirmation | Same. Tracking links belong to the carrier and stay untouched |
| Abandoned checkout | The recovery link stays Shopify's; brand and catalogue links move to the headless domain |
| Account invite and password reset | Only relevant once customer accounts ship; out of scope for v1 |

## What to substitute

Replace `{{ shop.url }}` and `{{ routes.root_url }}` in **presentation** links
with your headless origin. Do not touch:

- `{{ order.order_status_url }}`
- carrier tracking URLs
- any Shopify-signed link

## Do not link the `all` collection

A recovery or "keep shopping" link pointing at `/collections/all` returns 404 on
a store that does not define that handle. Link `/collections` instead. The
storefront enforces this in configuration validation; the email templates live
in Shopify admin and cannot be linted, so it has to be checked by hand.

## Verification

- [ ] Place a test order.
- [ ] In the confirmation email, every buyer-facing link resolves to the
      headless domain.
- [ ] The order status link still opens the real order status page.
- [ ] No link returns 404, including any collection link.
- [ ] Repeat for shipping confirmation and abandoned checkout.
