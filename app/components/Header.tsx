import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {config} from '~/lib/config';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

/**
 * A single compact row. Vertical space is the scarcest resource on the surface
 * where most buying happens, so navigation collapses into one labelled control
 * rather than spreading across the header.
 */
export function Header({header, cart}: HeaderProps) {
  const {open} = useAside();
  const shopName = header?.shop?.name || config.brand.name;

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--df-color-hairline)] bg-[color:var(--df-color-canvas)]">
      <div className="container-page flex h-16 items-center gap-[var(--df-space-3)]">
        <button
          type="button"
          onClick={() => open('mobile')}
          className="touch-target -ml-[var(--df-space-2)] inline-flex items-center gap-[var(--df-space-2)] px-[var(--df-space-2)] text-[length:var(--df-size-sm)] md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
          <span>Menu</span>
        </button>

        <Link to="/" prefetch="intent" className="touch-target flex items-center">
          <span className="font-[family-name:var(--df-font-display)] text-[length:var(--df-size-xl)] text-[color:var(--df-color-ink-strong)]">
            {shopName}
          </span>
        </Link>

        <nav className="ml-[var(--df-space-6)] hidden gap-[var(--df-space-6)] md:flex" aria-label="Primary">
          {config.navigation.header.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              prefetch="intent"
              className="touch-target inline-flex items-center text-[length:var(--df-size-sm)]"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-[var(--df-space-1)]">
          {config.features.predictiveSearch ? (
            <button
              type="button"
              onClick={() => open('search')}
              className="touch-target inline-flex items-center justify-center px-[var(--df-space-2)]"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          ) : null}
          <CartToggle cart={cart} />
        </div>
      </div>
    </header>
  );
}

/** Kept exported: PageLayout renders it inside the mobile menu aside. */
export function HeaderMenu({
  viewport,
}: {
  menu?: HeaderProps['header']['menu'];
  primaryDomainUrl?: string;
  viewport: 'desktop' | 'mobile';
  publicStoreDomain?: string;
}) {
  const {close} = useAside();

  return (
    <nav
      className={
        viewport === 'mobile'
          ? 'flex flex-col gap-[var(--df-space-2)]'
          : 'flex gap-[var(--df-space-6)]'
      }
      aria-label="Primary"
    >
      <NavLink to="/" onClick={close} prefetch="intent" className="touch-target flex items-center">
        Home
      </NavLink>
      {config.navigation.header.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={close}
          prefetch="intent"
          className="touch-target flex items-center"
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      className="touch-target relative inline-flex items-center justify-center px-[var(--df-space-2)]"
      aria-label={count === null ? 'Cart' : `Cart, ${count} items`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <CartIcon />
      {count !== null && count > 0 ? (
        <span className="absolute right-0 top-1 min-w-[18px] rounded-[var(--df-radius-pill)] bg-[color:var(--df-color-accent)] px-[5px] text-center text-[length:var(--df-size-xs)] leading-[18px] text-[color:var(--df-color-on-accent)]">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/* Inline icons: no icon dependency for three glyphs. */
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5 17 17" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h2l1.5 8.5h9L17 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="16.5" r="1.2" />
      <circle cx="15" cy="16.5" r="1.2" />
    </svg>
  );
}
