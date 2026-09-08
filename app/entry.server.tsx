import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';
import {tokens} from '../config/tokens';


/**
 * Routes that must never enter an index. The directive is set here as a
 * response header and again in the route's document markup: either layer alone
 * has been observed to be insufficient, so both are enforced.
 */
const NEVER_INDEXED = [
  /^\/cart(\/|$)/,
  /^\/account(\/|_|$)/,
  /^\/discount\//,
  /^\/search(\/|$)/,
];

function robotsHeaderFor(pathname: string, status: number): string | null {
  if (status >= 400) return 'noindex, nofollow';
  if (/^\/search(\/|$)/.test(pathname)) return 'noindex, follow';
  if (NEVER_INDEXED.some((pattern) => pattern.test(pathname))) {
    return 'noindex, nofollow';
  }
  return null;
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  // A font host absent from the policy is blocked silently: the page renders on
  // the fallback stack and nothing reports why. The origins come from the same
  // configuration as the stylesheet, and validation keeps the two in step.
  const fontOrigins = tokens.fontSource.href ? [...tokens.fontSource.origins] : [];

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    styleSrc: ["'self'", "'unsafe-inline'", ...fontOrigins],
    fontSrc: ["'self'", 'data:', ...fontOrigins],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  const robots = robotsHeaderFor(
    new URL(request.url).pathname,
    responseStatusCode,
  );
  if (robots) {
    responseHeaders.set('X-Robots-Tag', robots);
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
