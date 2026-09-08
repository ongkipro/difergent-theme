/**
 * The registry's vocabulary. Configuration may only name a type listed here;
 * anything else fails validation at build time.
 */
export const SECTION_TYPES = [
  'hero',
  'featuredCollection',
  'imageWithText',
  'collectionList',
  'richText',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];
