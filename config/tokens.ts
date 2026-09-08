/**
 * Design tokens. Names are the contract and never change; a derived store
 * changes values only. See DESIGN.md for the rationale and the accessibility
 * constraints that some of these values encode.
 */
export const tokens = {
  color: {
    canvas: '#FBFAF8',
    surface: '#FFFFFF',
    raised: '#F4F2EE',
    /** Decorative only. Fails the 3:1 non-text minimum. */
    hairline: '#EDEAE4',
    /** Decorative only. Fails the 3:1 non-text minimum. */
    border: '#E4E0D9',
    /** The only token allowed as an interactive control boundary. 3.3:1. */
    borderControl: '#8F8A80',
    inkStrong: '#1A1917',
    ink: '#3A3733',
    inkMuted: '#6E6960',
    action: '#1A1917',
    onAction: '#FFFFFF',
    /** Empty falls back to `action`, so an unbranded clone looks intentional. */
    accent: '',
    onAccent: '#FFFFFF',
    success: '#1F6B4A',
    warning: '#8A5A10',
    danger: '#9B2C2C',
  },
  font: {
    display: '"Instrument Serif", Georgia, "Times New Roman", serif',
    body: '"Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  /**
   * Where the families above come from.
   *
   * Only the weights actually used are requested: Instrument Serif has one
   * weight, and the body needs 400 and 500. `display=swap` renders the fallback
   * immediately and swaps when the file lands, so a slow font never blanks the
   * page.
   *
   * Set `href` to an empty string to drop the request entirely and run on the
   * fallback stacks. `origins` feeds the Content Security Policy, so a store
   * pointing at a different host must list it here or the browser blocks it.
   */
  fontSource: {
    href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Instrument+Serif&display=swap',
    origins: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  },
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.375rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  space: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem',
    24: '6rem',
    32: '8rem',
  },
  radius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
    pill: '9999px',
  },
  shadow: {
    overlay: '0 8px 32px rgb(26 25 23 / 0.16)',
  },
  motion: {
    fast: '120ms',
    base: '200ms',
    overlay: '320ms',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  layout: {
    /** Content width cap; gutters step with the breakpoints. */
    maxWidth: '1360px',
    gutterBase: '1rem',
    gutterMd: '1.5rem',
    gutterLg: '2rem',
    /** Desktop grid columns. REQ-9 derives the page size from this. */
    gridColumns: 4,
    /** Home section rhythm. */
    sectionRhythmMobile: '4rem',
    sectionRhythmDesktop: '6rem',
  },
} as const;

export type Tokens = typeof tokens;
