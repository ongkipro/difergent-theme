import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {config} from '~/lib/config';
import {SECTION_REGISTRY, type SectionData} from '~/lib/sections/registry';
import {buildMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({location}) =>
  buildMeta({
    title: config.seo.defaultTitle,
    description: config.seo.defaultDescription,
    pathname: location.pathname,
    useTemplate: false,
  });

/**
 * Only the sections the store actually configured are queried. A section that
 * is not on the page costs nothing, which is the second half of the feature
 * gate: absence of UI and absence of request.
 */
export async function loader({context}: Route.LoaderArgs) {
  const types = new Set(config.sections.map((section) => section.type));
  const featuredSection = config.sections.find(
    (section) => section.type === 'featuredCollection',
  );
  const listSection = config.sections.find(
    (section) => section.type === 'collectionList',
  );

  const [featured, collections] = await Promise.all([
    types.has('featuredCollection')
      ? context.storefront
          .query(FEATURED_COLLECTION_QUERY, {
            variables: {
              handle: String(featuredSection?.props.handle ?? ''),
              first: clampLimit(featuredSection?.props.limit),
            },
          })
          .catch(() => null)
      : Promise.resolve(null),
    types.has('collectionList')
      ? context.storefront
          .query(COLLECTION_LIST_QUERY, {
            variables: {first: clampLimit(listSection?.props.limit)},
          })
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const source =
    featured?.collectionByHandle ?? featured?.collections?.nodes?.[0] ?? null;

  const data: SectionData = {
    featuredCollection: source
      ? {
          handle: source.handle,
          title: source.title,
          products: source.products.nodes,
        }
      : null,
    collections: collections?.collections.nodes ?? null,
  };

  return {sectionData: data};
}

function clampLimit(value: unknown): number {
  const n = typeof value === 'number' ? value : 4;
  return Math.min(12, Math.max(1, Math.trunc(n)));
}

export default function Homepage() {
  const {sectionData} = useLoaderData<typeof loader>();

  return (
    <>
      {config.sections.map((section, index) => {
        const render = SECTION_REGISTRY[section.type];
        return (
          // The section list is static per build: it only changes when
          // configuration changes, which rebuilds the page. Index is stable here.
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${section.type}-${index}`}>
            {render(section.props, sectionData)}
          </div>
        );
      })}
    </>
  );
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment HomeProductCard on Product {
    id
    title
    handle
    availableForSale
    featuredImage { id url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
  }
` as const;

const FEATURED_COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query HomeFeaturedCollection(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collectionByHandle(handle: $handle) {
      handle
      title
      products(first: $first) { nodes { ...HomeProductCard } }
    }
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        handle
        title
        products(first: $first) { nodes { ...HomeProductCard } }
      }
    }
  }
` as const;

const COLLECTION_LIST_QUERY = `#graphql
  query HomeCollectionList(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        image { id url altText width height }
      }
    }
  }
` as const;
