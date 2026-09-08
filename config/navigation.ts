/** Header and footer link structure. Handles must exist in the store. */
export const navigation = {
  header: [
    {label: 'Shop', href: '/collections'},
    {label: 'Search', href: '/search'},
  ],
  footer: [
    {
      title: 'Shop',
      links: [{label: 'All collections', href: '/collections'}],
    },
    {
      title: 'Support',
      links: [{label: 'Policies', href: '/policies'}],
    },
  ],
} as const;

export type Navigation = typeof navigation;
