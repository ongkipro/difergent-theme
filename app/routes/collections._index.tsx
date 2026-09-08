import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

import {buildMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({location}) =>
  buildMeta({
    title: 'Collections',
    description: 'Browse every collection in the store.',
    pathname: location.pathname,
  });

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="container-page section-rhythm">
      <h1 className="text-[length:var(--df-size-3xl)] md:text-[length:var(--df-size-4xl)]">
        Collections
      </h1>
      <PaginatedResourceSection<CollectionFragment>
        connection={collections}
        ariaLabel="Collections"
        resourcesClassName="mt-[var(--df-space-8)] grid grid-cols-2 gap-[var(--df-space-4)] md:grid-cols-3 lg:grid-cols-4 lg:gap-[var(--df-space-6)]"
      >
        {({node: collection, index}) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      className="group block"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div className="aspect-square w-full overflow-hidden bg-[color:var(--df-color-raised)]">
        {collection?.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 4 ? 'eager' : 'lazy'}
            sizes="(min-width: 1200px) 25vw, (min-width: 900px) 33vw, 50vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src="/placeholders/collection.svg"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <h2 className="mt-[var(--df-space-3)] font-[family-name:var(--df-font-body)] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink)]">
        {collection.title}
      </h2>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
