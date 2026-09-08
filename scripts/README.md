# Browser checks

A green build is not evidence that a rendered surface works. These scripts drive
a real Chrome over the DevTools protocol and assert the properties that only
show up in a browser.

## Running them

Start a production preview and a headless Chrome with remote debugging, then
point each script at the preview:

```bash
npm run build
npx shopify hydrogen preview --port 3150 &
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir=/tmp/df-check-profile about:blank &

node scripts/check-responsive.mjs     http://localhost:3150 / /collections/men /products/hoodie-old
node scripts/check-commerce.mjs       http://localhost:3150
node scripts/check-inapp-browser.mjs  http://localhost:3150
node scripts/check-consent.mjs        http://localhost:3150
```

Each exits non-zero on failure.

## What each one asserts

**check-responsive** — no horizontal overflow at 320, 360, 390, 414, 768, 1024,
1280 and 1440 pixels; zoom never locked; every interactive target at least 44
pixels, ignoring `inert` subtrees.

**check-commerce** — variant selection updates the URL without a document
navigation; the sticky purchase bar stays hidden until the real action scrolls
away; add to cart moves the badge; the cart survives navigation and a full
reload; checkout hands off to Shopify. Runs in an isolated browser context so a
previous run's cart cookie cannot leak in.

**check-inapp-browser** — the invariants that break inside Instagram, TikTok,
Facebook and WhatsApp browsers: the cart lives on a first-party cookie and
survives browser storage being wiped; the layout survives the host chrome
resizing; every bottom-fixed control region reserves safe-area space; checkout
stays in the same browsing context.

**check-consent** — with a tag configured, nothing loads while the visitor has
not decided, and it loads once consent is granted. Requires a probe tag in
`config/tracking.ts` while running.

## What they cannot replace

A real phone opening the storefront from inside a host application. Device
emulation reproduces the viewport, not the host browser. Run the purchase path
on a physical device before trusting it.
