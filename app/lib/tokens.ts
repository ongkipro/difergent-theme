import type {ValidatedConfig} from './config';

/**
 * Turns the configured tokens into CSS custom properties. This is the only
 * bridge between configuration and rendered style: a component asks for a role
 * (`var(--color-action)`), never for a value.
 *
 * The accent falls back to the action color so an unbranded clone looks
 * intentional rather than broken.
 */
export function tokensToCss(tokens: ValidatedConfig['tokens']): string {
  const accent = tokens.color.accent || tokens.color.action;
  const onAccent = tokens.color.accent ? tokens.color.onAccent : tokens.color.onAction;

  const lines: string[] = [];
  // The `df` prefix keeps these clear of Tailwind's own theme namespace
  // (--color-*, --font-*, --radius-*, --shadow-*). Without it, a theme entry
  // like `--color-action: var(--color-action)` is circular and silently
  // resolves to nothing, which renders as black on black.
  const push = (name: string, value: string | number) =>
    lines.push(`--df-${name}:${value};`);

  for (const [key, value] of Object.entries(tokens.color)) {
    if (key === 'accent' || key === 'onAccent') continue;
    push(`color-${kebab(key)}`, value);
  }
  push('color-accent', accent);
  push('color-on-accent', onAccent);

  for (const [key, value] of Object.entries(tokens.font)) push(`font-${key}`, value);
  for (const [key, value] of Object.entries(tokens.size)) push(`size-${key}`, value);
  for (const [key, value] of Object.entries(tokens.space)) push(`space-${key}`, value);
  for (const [key, value] of Object.entries(tokens.radius)) push(`radius-${key}`, value);
  for (const [key, value] of Object.entries(tokens.shadow)) push(`shadow-${key}`, value);
  for (const [key, value] of Object.entries(tokens.motion)) push(`motion-${key}`, value);

  push('layout-max-width', tokens.layout.maxWidth);
  push('layout-gutter', tokens.layout.gutterBase);
  push('layout-gutter-md', tokens.layout.gutterMd);
  push('layout-gutter-lg', tokens.layout.gutterLg);
  push('layout-grid-columns', tokens.layout.gridColumns);
  push('layout-rhythm', tokens.layout.sectionRhythmMobile);
  push('layout-rhythm-desktop', tokens.layout.sectionRhythmDesktop);

  return `:root{${lines.join('')}}`;
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Page size for product grids. Derived from the desktop column count so the
 * last row is never a single orphan card, at desktop or at the two-column
 * mobile grid.
 */
export function gridPageSize(tokens: ValidatedConfig['tokens'], rows = 3): number {
  return tokens.layout.gridColumns * rows;
}
