import type {Route} from './+types/health';
import {config} from '~/lib/config';

/**
 * A deployed store can be checked without reading its logs. The probe reports
 * whether the storefront can actually answer a Storefront API query, because a
 * process that is up but cannot reach Shopify is not healthy.
 *
 * It never returns a secret, a token, or buyer data.
 */
export async function loader({context}: Route.LoaderArgs) {
  const startedAt = Date.now();
  let storefront: 'ok' | 'unreachable' = 'unreachable';

  try {
    const result = await context.storefront.query(HEALTH_QUERY);
    if (result?.shop?.name) storefront = 'ok';
  } catch {
    storefront = 'unreachable';
  }

  const healthy = storefront === 'ok';

  return new Response(
    JSON.stringify({
      status: healthy ? 'ok' : 'degraded',
      checks: {
        storefrontApi: storefront,
        configuration: 'ok',
        sections: config.sections.length,
      },
      durationMs: Date.now() - startedAt,
    }),
    {
      status: healthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}

const HEALTH_QUERY = `#graphql
  query DifergentHealth {
    shop {
      name
    }
  }
` as const;
