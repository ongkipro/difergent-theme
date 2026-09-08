# Theming a derived store

Everything a store changes lives in two places: `config/` and `public/`. If a
change seems to require editing a component, the token for it is missing; add
the token rather than the exception.

Token **values** live in `config/tokens.ts`. Token **names** and the reasoning
behind them live in `DESIGN.md`, which is the design owner. This guide never
repeats a value, so the two cannot drift apart.

## 1. Identity

`config/brand.ts` — store name, tagline, logo path, public host, contact
details, social links. Empty contact and social values are omitted from the
footer rather than rendered as dead links.

`publicHost` matters beyond display: canonical URLs are built from it, and
`robots.txt` disallows every host that does not match it, which is what keeps a
preview deployment out of a search index.

## 2. Look

`config/tokens.ts`. The fastest meaningful change is one line:

```ts
accent: '#1F6B4A',   // was '' — an empty accent falls back to the action colour
```

That re-brands the primary purchase action across the home, collection, product
and cart surfaces without touching a component.

Two constraints from `DESIGN.md` are enforced, not advisory:

- `hairline` and `border` are decorative. They fail the 3:1 minimum for a
  non-text boundary, so an interactive control must use `borderControl`.
- Focus indicators never use the accent, because a store may set a low-contrast
  brand colour and focus must survive it.

A literal colour, font stack, radius, shadow or transition duration written
into a component fails `npm run lint`.

## 3. Navigation

`config/navigation.ts` — header links and footer groups. Validation rejects a
link to the `all` collection handle, which 404s on a store that does not define
it.

## 4. Home page

`config/sections.ts` is an ordered array. Reorder it to reorder the page; delete
an entry to remove a section. A section type absent from the registry fails the
build and names itself, rather than rendering nothing at runtime.

Available types, defined in `app/lib/sections/types.ts`:

`hero`, `featuredCollection`, `imageWithText`, `collectionList`, `richText`.

Adding a sixth type is a framework change: add the component, register it in
`app/lib/sections/registry.tsx`, and add the name to `types.ts`.

## 5. Features

`config/features.ts`. A disabled flag removes the UI **and** the Storefront API
request behind it, so turning a feature off is a cost decision as well as a
display one.

## 6. Marketing tags

`config/tracking.ts`. Nothing loads until the buyer grants the consent category
the tag declares. No tag ships enabled.

## 7. Images

Replace the files in `public/placeholders/` with real assets at the same aspect
ratios, or point the section props at your own paths. The bundled placeholders
are deliberately obvious: they are stand-ins, never fabricated brand content.

## Check your work

```bash
npm run lint       # token discipline
npm run typecheck  # configuration shape
npm run dev        # then open the storefront and look at it
```

A green build is not evidence that a rendered surface works.
