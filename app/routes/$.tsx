import {Link} from 'react-router';
import type {Route} from './+types/$';
import {NOINDEX, buildMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({location}) =>
  buildMeta({
    title: 'Page not found',
    description: 'The page you requested does not exist.',
    pathname: location.pathname,
    robots: NOINDEX,
  });

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return (
    <div className="container-page section-rhythm">
      <h1 className="text-[length:var(--df-size-3xl)]">Page not found</h1>
      <p className="mt-[var(--df-space-4)] max-w-[52ch] text-[color:var(--df-color-ink-muted)]">
        The page you requested does not exist. It may have been moved, or the
        link may be out of date.
      </p>
      <Link
        to="/collections"
        className="touch-target mt-[var(--df-space-6)] inline-flex items-center rounded-[var(--df-radius-md)] bg-[color:var(--df-color-accent)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[color:var(--df-color-on-accent)]"
      >
        Browse collections
      </Link>
    </div>
  );
}
