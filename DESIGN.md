# DESIGN: Difergent Theme

Design read: **a reusable multi-store storefront shell for the owner's own
stores, Storefront/Commerce mode, with a quiet-armature vibe, leaning toward a
neutral typographic system whose brand expression arrives entirely through
configuration.**

This artifact is the design owner for the template. Its tokens are law for every
derived store; a store changes token values, never component styling.

## Visual Direction

- **Audience/job and market model:** the owner launching their own storefronts,
  and through them buyers in a neutral multi-market audience. Nobody outside
  this account ever installs or configures this theme.
  Currency, language, and number format come from Shopify Markets, so the visual
  system must survive translation expansion, long product titles, and unfamiliar
  currency symbols without redesign.
- **Character expressed through concrete choices:** a fixed typographic and
  spatial armature carries all structure; a single accent token carries all
  brand. Product media and price do the talking. Hierarchy comes from type scale
  and spacing rather than from elevated cards, fills, or ornament.
- **Subject-derived signature:** the subject of this design is configuration
  itself. The signature is **one decisive accent per view**. The accent token
  appears on the primary purchase action and nowhere else by default, so
  swapping one token visibly re-brands the whole storefront while the layout
  stays untouched. That is the plug-and-play promise made visible, and it is a
  restrained choice rather than a loud one.
- **Anti-template rule:** no row of three equal cards; no uniform large corner
  radius; no elevated rounded card grid for products, which get hairlines and
  spacing instead; no nested frames or container-inside-container; no badge rows
  or icon soup; no gradient hero; no decorative KPI or stat shells.
- **Design dials:** variance 4, motion 2, density 5. Variance sits at the
  storefront default because merchandising, not the shell, deserves the
  variation. Motion sits one below the storefront default deliberately: motion
  baked into a template is inherited by every derived store and is awkward to
  remove per store, so the default is conservative and a store raises it through
  tokens if it wants more.

## Reference decision

| Reference | Observed principle | Transfer rationale | Do not copy |
|---|---|---|---|
| Impact by Maestrooo, Shopify Theme Store, read 2026-09-08 | Merchandising depth on the product route: media gallery with zoom, swatches, a size-chart slot, complementary products, and quick add on collection | These are the surfaces where a storefront actually earns money, and they define the registry roadmap beyond v1 | Its brand character. Gradients, oversized headings, and the entertainment/audio-brand energy are a strong identity, which is the wrong default for a shell many different brands clone |
| Impact preset variations, same source | One codebase shipping several presets proves that structure and character can be separated | Confirms the token-driven approach: presets are token sets, not forks | Its 35-plus section count. That is a marketplace product competing on feature lists, not a scope for v1 |
| Horizon by Shopify, Shopify Theme Store, read 2026-09-08 | Color restraint, large product cards, modern type, speed as a design constraint, minimal setup to a credible store | This is the correct posture for a default the owner inherits on day one, before any brand decisions exist | Its neutrality as a ceiling. A template that can only ever look generic has failed the owner too |
| Storefront commerce lens, `design-taste` references | The product decision path is the layout spine, and campaign sections may support it but never displace identity, price, availability, or the current action | Directly governs how the section registry may compose the home route | Nothing; this is the governing rule, not a reference |

| Candidate | Audience/job fit | Assets/content | Accessibility/responsive fit | Cost/risk | Decision |
|---|---|---|---|---|---|
| Impact character as default: bold type, gradients, high motion | Strong for one brand personality, weak for a shell cloned across unrelated brands | Demands art-directed photography every store must supply | Gradients and large motion raise contrast and reduced-motion risk across stores the owner cannot audit | High: every derived store inherits an identity it must fight | Rejected |
| Neutral armature with one decisive accent | Fits the owner's job directly. Credible on day one, and re-brands through tokens | Works with ordinary catalog photography, improves with better | Contrast and focus verified once, inherited everywhere | Low, and it is the only option that keeps the configuration contract honest | **Selected** |
| Multiple shipped presets, as Impact does | Attractive later, once real stores reveal which characters recur | Needs several complete token sets and their own visual QA | Multiplies the accessibility surface before any of it is validated | Premature: presets without evidence are guesses | Open, revisit after three derived stores |

The disagreement worth stating plainly: Impact is an excellent theme and a poor
default. Its value here is structural, and the template takes that. Its
character belongs to the brands that choose it, and a white-label shell that
ships someone else's character forces every derived store to undo it first.

## Tokens

Values are the shipped default. A derived store overrides values, never names.
Names are semantic, so a component never asks for a color, only for a role.

**Theme.** Light only in v1. Dark is out of scope rather than inverted, because
an undesigned dark mode inherited by every store is worse than none. Surface
temperature is warm neutral, which keeps product photography from reading cold
and separates the shell from the default cool-grey look.

**Colors.**

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#FBFAF8` | Page ground |
| `--color-surface` | `#FFFFFF` | Cards, drawers, sheets |
| `--color-raised` | `#F4F2EE` | Subtle fills, disabled fields |
| `--color-hairline` | `#EDEAE4` | Decorative separators only |
| `--color-border` | `#E4E0D9` | Non-interactive boundaries |
| `--color-border-control` | `#8F8A80` | Every interactive control boundary |
| `--color-ink-strong` | `#1A1917` | Headings, price |
| `--color-ink` | `#3A3733` | Body |
| `--color-ink-muted` | `#6E6960` | Secondary, compare-at price |
| `--color-action` | `#1A1917` | Primary purchase action, default |
| `--color-on-action` | `#FFFFFF` | Text on the action |
| `--color-accent` | unset, falls back to `--color-action` | The one brand token a store sets |
| `--color-success` | `#1F6B4A` | In stock, applied discount |
| `--color-warning` | `#8A5A10` | Low stock, pending recalculation |
| `--color-danger` | `#9B2C2C` | Line errors, unavailable |

The accent deliberately falls back to near-black. An unconfigured store looks
intentional rather than broken, which matters because the first render of a new
clone happens before any brand decision exists.

**Typography.** Display `"Instrument Serif"`, body `"Instrument Sans"`, numeric
and order references `ui-monospace`. The families are actually loaded, from the
source named in `tokens.fontSource`, requesting only the weights in use: one for
the serif, 400 and 500 for the sans. Both hosts are preconnected, because the
stylesheet and the font files come from different origins and connecting to only
the first still pays a full handshake before any glyph arrives.

`display=swap` renders the fallback immediately and swaps when the file lands,
so a slow font never blanks the page. Measured against the same build with the
source removed, the fonts cost nothing: performance 97 either way, LCP 2.0-2.1s
with them against 2.1-2.2s without, cumulative layout shift 0.001 against 0. A
store that wants no third-party request can set the source to an empty string
and run on the fallback stacks.

The font hosts must also appear in the Content Security Policy. A host missing
from it is blocked silently: the page renders on the fallback and nothing
reports why. Configuration carries both the stylesheet and its origins, and
validation rejects a source whose origin is not in the list. Base 16px. Scale: 12, 14, 16, 18,
20, 24, 30, 38, 48, 60. Body 16 at weight 400, headings weight 400 on the serif
so weight is never the only hierarchy signal, labels 14 at weight 500 with
slight positive tracking. Line height 1.5 body, 1.15 display.

**Spacing.** Base 4px. Scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section
rhythm on the home route uses 64 mobile and 96 desktop, so composition reads as
deliberate sections rather than a continuous scroll.

**Shape.** `--radius-sm` 2px for inputs and chips, `--radius-md` 4px for
buttons and drawers, `--radius-lg` 8px reserved for overlay containers. Product
media is square-cornered. Swatches are the single pill exception, because a pill
swatch is a recognized commerce convention rather than decoration.

**Elevation.** Borders and hairlines are the primary separation device. Exactly
one shadow token, `--shadow-overlay`, applies to drawers, sheets, and dialogs.
Product cards and sections never carry shadow.

**Motion.** `--motion-fast` 120ms for hover and press, `--motion-base` 200ms for
state change, `--motion-overlay` 320ms for drawer and sheet entry. Easing
`cubic-bezier(0.2, 0, 0, 1)`. Under reduced-motion, transform and opacity
transitions are removed and only focus and state color changes remain. Product
media never auto-rotates.

## Composition rules

- The home route is a sequence of sections separated by rhythm, not a bento
  grid. A section owns the full content width or an intentional offset, and
  never a nested frame inside another frame.
- Product cards are comparison units. Media ratio is fixed per grid, the price
  baseline aligns across a row even when titles wrap to two lines, and the card
  is defined by spacing and a hairline rather than a border-plus-shadow box.
- The product route composes a media region and a decision region whose desktop
  proportion follows the product's media needs. Title, price, options,
  availability, and the purchase action stay visually connected as one block.
- Variant controls follow option semantics: pills for short text sets, swatches
  with a visible text equivalent for color, an accessible select for long sets.
  State is never signalled by color alone.
- The cart is a drawer for editing and a page for review. Neither hides
  quantity, line price, discount, subtotal, or the checkout action behind
  recommendations.
- Responsive work changes composition, not column count. Filters become a
  bounded sheet that keeps the active-filter count and clear-all visible; the
  cart table becomes labelled line-item groups rather than clipped columns.

## Mobile and in-app browser

Mobile is the primary composition, not a narrowed desktop. The order below is
what a buyer sees on a phone, and the desktop layout is the variation.

**Breakpoints.** Mobile-first, four steps. Base covers 0 to 599 and is a single
column. `sm` at 600 introduces the two-column product grid. `md` at 900 moves
navigation inline and gives three columns. `lg` at 1200 gives four columns and
splits the product route into media and decision regions. Content width caps at
1360 with gutters of 16, 24, and 32 across the steps. The four-column desktop
grid is what fixes the page size in REQ-9 at 12, which also divides evenly by
the two-column mobile grid, so no page ends in an orphan card at either width.

**Shell.** The header carries logo, search entry, and cart entry only.
Navigation collapses into one labelled menu control, never a bare icon. Market
and locale live in the menu and the footer, not in a cramped header row. A
sticky header is allowed only if it stays a single compact row, because vertical
space is the scarcest resource on the surface where most buying happens.

**Collection.** Filter and sort collapse into one labelled control opening a
bounded sheet. The active filter count and clear-all stay visible on the results
surface while the sheet is closed. The grid drops to two columns and keeps the
comparison order, the fixed media ratio, and the aligned price baseline.

**Product.** The decision sequence is fixed: identity and price, representative
media, options and availability, purchase action, material fulfilment and
returns, then supporting detail. A sticky purchase bar is conditional. It may
appear only after the primary action scrolls out of view, must show the selected
variant and current price, must reserve safe-area space, and must never cover
consent UI, validation messages, or a chat launcher.

**Cart and search.** The cart drawer is full height on mobile and renders lines
as labelled groups rather than a clipped table. Search opens as a full-screen
overlay with the input focused and a visible dismiss control.

**In-app browsers.** Most ad traffic lands in an in-app browser inside
Instagram, TikTok, Facebook, or WhatsApp rather than in Safari or Chrome. That
surface is the default assumption here, not an edge case, and it breaks specific
things:

- Viewport height is unstable as the host chrome expands and collapses. Use the
  small and dynamic viewport units, never `100vh`, and never lock scrolling to a
  fixed pixel height.
- Any bottom-fixed element reserves `env(safe-area-inset-bottom)`, or it sits
  under the host browser's own toolbar and becomes untappable.
- New windows, downloads, and inline PDF viewing are unreliable. Nothing in the
  purchase path may depend on them, and the checkout handoff navigates in the
  same context rather than opening a new tab.
- Storage is more restricted and shorter-lived than in a full browser. The cart
  must survive on a first-party session cookie, so a cart that depends on
  `sessionStorage` or a third-party cookie is a defect even when it passes on a
  desktop browser.
- Accelerated payment buttons may be unavailable. Render them conditionally on
  actual availability rather than reserving a slot that renders broken or empty.
- Consent UI competes for the same bottom region as a sticky purchase bar. The
  consent surface wins; the purchase bar yields.

Device emulation in browser devtools does not reproduce any of this. Evidence
for these constraints comes from a real phone opening the storefront through a
link inside the host app.

## Hero composition

The hero is an **inset card**, not a full-bleed banner. The margin of canvas
around it is the composition: it is what makes the image read as a deliberate
object rather than a page-wide advertisement, and it is what keeps the section
consistent with the rest of the page rhythm.

Four parts, in order: an eyebrow naming the category, a display heading, an
optional supporting line, and one pill action. The pill is the single exception
to the shape system, and it is deliberate: a fully rounded action reads as an
invitation where the rest of the interface reads as structure.

**Text sits beside the image by default, not on it.** Text over photography is a
contrast lottery once a store supplies its own art direction, and nobody audits
it afterwards. The default keeps the copy on a surface, where contrast is fixed
by tokens and verified once for every store.

The overlay composition, where copy sits over the image, is available per store
and carries a scrim. The scrim is a flat colour at a configurable strength, not
a gradient: a constant buys the same contrast on every image a store supplies,
while a gradient's protection depends on where the text lands. The default
strength of 65 is chosen against the worst case a store can hand it, a light
image, and measured white body text at 5.83:1 there.

A store lowering the scrim is taking on the obligation to check the result.
Automated accessibility checks do not cover text over images: they cannot
resolve the background, so they score such a page as passing whether it is
readable or not.

**Slides advance only when the buyer asks.** Pagination is numbered and sits
clear of the action, never on top of it. Nothing auto-rotates, which follows
from the motion dial and from the plain fact that a moving hero takes the
decision away from the reader.

## Header

The wordmark is the logo. A text wordmark scales, translates, stays legible at
any size, and costs a store nothing to supply, which an image logo does not.

It comes from `config/brand.ts`, not from the Shopify store name. The name a
merchant types into their admin is an internal label; the mark on the storefront
is a brand decision, and it belongs with the other brand decisions. One word
works best: it centres cleanly and leaves the utilities room at every width.

On mobile the header is one 56px row: a menu control on the left, the wordmark
centred, search and cart on the right. Centring is achieved by giving the two
side clusters the same fixed basis rather than by letting the grid size them.
Content-sized columns put the icons over the wordmark at 320px, because the
right cluster holds two controls and the left holds one.

The wordmark's size is fluid rather than stepped, so a long shop name fits
between the clusters at 320px and still carries presence at 1440px. When a name
is too long for the space it truncates rather than wrapping: a second header row
pushes the whole page down, which is the worse failure. Truncation is expected
below 390px for a long name and must not happen above it.

From the `md` breakpoint the row becomes a normal sequence: wordmark, primary
navigation, then utilities, at 64px.

The cart count is a badge on the cart control with a ring in the canvas colour,
so it separates from the icon beneath it, and it caps at `99+`. The accessible
name carries the count in words; the badge itself is hidden from assistive
technology to avoid announcing the number twice.

## Overlay surfaces

Three surfaces, three shapes, because they answer different questions.

**The menu is a sheet.** It rises from the bottom edge, where a thumb already
is. A grabber bar above the heading says so before anyone touches it.

**The cart is a sheet on a phone and a right-hand panel from `sm`.** It is a
working surface: on a narrow screen it belongs under the thumb, on a wide one it
belongs beside the page it was opened from, so the buyer can still see what they
were looking at.

**Search is a centred modal.** A question is not a place. It sits over the page
rather than beside it, returns the reader where they were, and opens on
`Cmd+K` as well as the visible control. The field stays pinned while results
scroll, which is what makes it read as a command surface rather than a form.

Result rows carry a fixed square thumbnail whatever shape the merchant's
photography is, so a list of five products is five rows of equal height rather
than a ragged column. Products come first and query suggestions after: a shopper
wants the thing, not a rephrasing of what they typed.

Opening a surface moves focus to its input when it has one, and to the panel
itself when it does not. Focusing the first link instead paints a focus ring on
a menu item nobody chose, which reads as a defect to a pointer user while
helping no one.

## Accessibility Notes

Contrast computed against `--color-canvas` `#FBFAF8`:

| Pair | Ratio | Verdict |
|---|---|---|
| `ink-strong` on canvas | 16.9:1 | Passes AAA |
| `ink-muted` on canvas | 5.2:1 | Passes AA normal text |
| `border-control` on canvas | 3.3:1 | Passes the 3:1 non-text minimum |
| `border` on canvas | 1.3:1 | **Fails 3:1** |
| `hairline` on canvas | below 1.3:1 | **Fails 3:1** |

The trap this design carries: `--color-border` and `--color-hairline` are
decorative only. Using either as the boundary of an input, select, checkbox, or
any other interactive control is an accessibility failure, and every interactive
boundary must use `--color-border-control`. This is the first thing to check in
a design review of a derived store.

Further constraints: touch targets at least 44px including variant swatches;
a visible focus ring on every interactive element that does not rely on the
accent token, since a store may set the accent to a low-contrast brand color;
layout reflows to 320px width without horizontal scroll; text remains readable
at 200% zoom.

Known limitation: the default font families cover Latin scripts. A store serving
a non-Latin market must override the family tokens, and the fallback stack
handles the interim. This is a token override, not a code change, and it is the
reason the family is a token at all.

## Validation

Every rule above is checked in the browser against the built storefront, on a
mobile viewport and a desktop viewport, using long titles, missing media, a
sold-out variant, a discounted price, an empty result set, and a cart error. A
passing build is not evidence that any of this renders correctly.
