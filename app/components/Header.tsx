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
  // The wordmark is store-owned identity from config/brand.ts, not the Shopify
  // store name. A merchant's admin name is an internal label ("Acme Test 2"),
  // and it is not the mark they want on their storefront.
  const shopName = config.brand.name;
  // Both side clusters share this basis so the wordmark stays centred; it
  // tracks the number of utility controls actually rendered.
  const sideBasis = config.features.predictiveSearch
    ? 'basis-[88px]'
    : 'basis-[44px]';

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--df-color-hairline)] bg-[color:var(--df-color-canvas)]">
      {/*
        Mobile is a three-column grid with equal outer columns, so the wordmark
        is optically centred no matter how many utilities sit beside it. A flex
        row would shift it every time a control appears or disappears.

        From `md` the grid collapses to a normal row: wordmark, then navigation,
        then utilities.
      */}
      {/*
        The two side clusters are given the same fixed basis, so the wordmark
        sits on the true centre line by construction rather than by grid
        arithmetic. Letting the columns size themselves put the icons over the
        text at 320px, because a zero-minimum column lets its content overflow.
      */}
      <div className="container-page flex h-14 items-center gap-[var(--df-space-2)] md:h-16 md:gap-[var(--df-space-3)]">
        <div
          className={`flex shrink-0 items-center md:hidden ${sideBasis}`}
        >
          <button
            type="button"
            onClick={() => open('mobile')}
            className="touch-target -ml-[var(--df-space-3)] inline-flex items-center justify-center"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        </div>

        <Link
          to="/"
          prefetch="intent"
          aria-label={`${shopName} home`}
          className="flex min-h-[44px] min-w-0 flex-1 items-center justify-center md:flex-none md:justify-start"
        >
          {/*
            Fluid rather than stepped: a long shop name has to fit between two
            icon clusters at 320px and still carry presence at 1440px, and a
            breakpoint would clip somewhere between the two.
          */}
          {/*
            `truncate` sets overflow:hidden, so the line box has to be tall
            enough to contain descenders. With a line height of 1 the tail of a
            g, y, p or j is clipped off.
          */}
          <span className="truncate px-[var(--df-space-2)] font-[family-name:var(--df-font-display)] text-[clamp(0.95rem,4.2vw,1.25rem)] leading-[1.35] tracking-tight text-[color:var(--df-color-ink-strong)] md:px-0">
            {shopName}
          </span>
        </Link>

        <nav
          className="ml-[var(--df-space-8)] hidden gap-[var(--df-space-6)] md:flex"
          aria-label="Primary"
        >
          {config.navigation.header.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              prefetch="intent"
              className="touch-target inline-flex items-center text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink)] aria-[current=page]:text-[color:var(--df-color-ink-strong)] aria-[current=page]:underline aria-[current=page]:underline-offset-8"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div
          className={`flex shrink-0 items-center justify-end md:ml-auto md:basis-auto ${sideBasis}`}
        >
          {config.features.predictiveSearch ? (
            <button
              type="button"
              onClick={() => open('search')}
              className="touch-target inline-flex items-center justify-center"
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
      className="touch-target relative inline-flex items-center justify-center"
      aria-label={
        count === null
          ? 'Cart'
          : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
      }
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
        <span
          aria-hidden
          className="absolute right-[6px] top-[6px] flex h-[18px] min-w-[18px] items-center justify-center rounded-[var(--df-radius-pill)] bg-[color:var(--df-color-accent)] px-[4px] text-[11px] font-medium leading-none text-[color:var(--df-color-on-accent)] ring-2 ring-[color:var(--df-color-canvas)]"
        >
          {count > 99 ? '99+' : count}
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
