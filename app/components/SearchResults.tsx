import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="mb-[var(--df-space-12)]">
      <h2 className="mb-[var(--df-space-4)] text-[length:var(--df-size-2xl)]">Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="border-b border-[color:var(--df-color-hairline)] last:border-0" key={article.id}>
              <Link prefetch="intent" to={articleUrl} className="touch-target flex items-center py-[var(--df-space-2)] text-[length:var(--df-size-sm)]">
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="mb-[var(--df-space-12)]">
      <h2 className="mb-[var(--df-space-4)] text-[length:var(--df-size-2xl)]">Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="border-b border-[color:var(--df-color-hairline)] last:border-0" key={page.id}>
              <Link prefetch="intent" to={pageUrl} className="touch-target flex items-center py-[var(--df-space-2)] text-[length:var(--df-size-sm)]">
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="mb-[var(--df-space-12)]">
      <h2 className="mb-[var(--df-space-6)] text-[length:var(--df-size-2xl)]">Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <Link
                prefetch="intent"
                to={productUrl}
                key={product.id}
                className="flex h-full flex-col border-b border-[color:var(--df-color-hairline)] pb-[var(--df-space-4)]"
              >
                <div className="aspect-square w-full overflow-hidden bg-[color:var(--df-color-raised)]">
                  {image ? (
                    <Image
                      data={image}
                      alt={product.title}
                      sizes="(min-width: 900px) 25vw, 50vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src="/placeholders/product.svg"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="mt-[var(--df-space-3)] text-[length:var(--df-size-sm)]">
                  {product.title}
                </p>
                <p className="mt-auto pt-[var(--df-space-2)] text-[color:var(--df-color-ink-strong)]">
                  {price && <Money data={price} as="span" />}
                </p>
              </Link>
            );
          });

          return (
            <div>
              <div className="flex justify-center py-[var(--df-space-6)] empty:hidden">
                <PreviousLink className="touch-target inline-flex items-center justify-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[length:var(--df-size-sm)]">
                  {isLoading ? 'Loading…' : 'Load previous'}
                </PreviousLink>
              </div>
              <div className="grid grid-cols-2 gap-[var(--df-space-4)] md:grid-cols-3 lg:grid-cols-4 lg:gap-[var(--df-space-6)]">
                {ItemsMarkup}
              </div>
              <div className="flex justify-center py-[var(--df-space-8)] empty:hidden">
                <NextLink className="touch-target inline-flex items-center justify-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[length:var(--df-size-sm)]">
                  {isLoading ? 'Loading…' : 'Load more'}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </section>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="mt-[var(--df-space-8)] text-[color:var(--df-color-ink-muted)]">
      No results. Try a different search term.
    </p>
  );
}
