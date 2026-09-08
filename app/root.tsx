import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Link,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import tailwindStyles from '~/styles/tailwind.css?url';
import {config} from '~/lib/config';
import {tokensToCss} from '~/lib/tokens';
import {MarketingTags} from '~/components/MarketingTags';
import {tracking} from '../config/tracking';
import {PageLayout} from './components/PageLayout';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    ...(config.tokens.fontSource.href
      ? [
          // Preconnect to both hosts: the stylesheet comes from one and the
          // font files from the other, so connecting to only the first still
          // pays a full handshake before any glyph arrives.
          ...config.tokens.fontSource.origins.map((href) => ({
            rel: 'preconnect',
            href,
            crossOrigin: 'anonymous' as const,
          })),
          {rel: 'stylesheet', href: config.tokens.fontSource.href},
        ]
      : []),
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: tracking.privacyBanner,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="stylesheet" href={tailwindStyles}></link>
        <style
          nonce={nonce}
          dangerouslySetInnerHTML={{__html: tokensToCss(config.tokens)}}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <MarketingTags />
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const notFound = status === 404;

  // The internal message is logged, never rendered: a buyer cannot act on a
  // stack trace, and it can disclose implementation detail.
  if (!isRouteErrorResponse(error)) {
    console.error(error);
  }

  return (
    <div className="container-page section-rhythm">
      {/*
        React 19 hoists these into the document head. The response header set in
        entry.server.tsx says the same thing; both layers are required because
        either one alone has been observed to be insufficient.
      */}
      <title>{notFound ? 'Page not found' : 'Something went wrong'}</title>
      <meta name="robots" content="noindex, nofollow" />
      <h1 className="text-[length:var(--df-size-3xl)]">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-[var(--df-space-4)] max-w-[52ch] text-[color:var(--df-color-ink-muted)]">
        {notFound
          ? 'The page you requested does not exist. It may have been moved, or the link may be out of date.'
          : 'We could not load this page. Please try again, or continue browsing.'}
      </p>
      <nav
        aria-label="Recovery"
        className="mt-[var(--df-space-6)] flex flex-wrap gap-[var(--df-space-4)]"
      >
        <Link
          to="/"
          className="touch-target inline-flex items-center rounded-[var(--df-radius-md)] bg-[color:var(--df-color-accent)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[color:var(--df-color-on-accent)]"
        >
          Go to the homepage
        </Link>
        <Link
          to="/collections"
          className="touch-target inline-flex items-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-6)] py-[var(--df-space-3)]"
        >
          Browse collections
        </Link>
      </nav>
    </div>
  );
}
