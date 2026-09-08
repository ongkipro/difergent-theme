import {Link, useFetcher, type Fetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from './Aside';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null;

  return (
    <div className="mb-[var(--df-space-6)]" key="articles">
      <h3 className="mb-[var(--df-space-2)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">Articles</h3>
      <ul>
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li className="border-b border-[color:var(--df-color-hairline)] last:border-0" key={article.id}>
              <Link className="touch-target flex items-center gap-[var(--df-space-3)] py-[var(--df-space-2)]" onClick={closeSearch} to={articleUrl}>
                {/* One fixed square per row, whatever shape the image is. */}
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--df-radius-sm)] bg-[color:var(--df-color-raised)]">
                  {article.image?.url ? (
                    <Image
                      alt={article.image.altText ?? ''}
                      src={article.image.url}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-[length:var(--df-size-sm)]">
                  {article.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  if (!collections.length) return null;

  return (
    <div className="mb-[var(--df-space-6)]" key="collections">
      <h3 className="mb-[var(--df-space-2)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">Collections</h3>
      <ul>
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          });

          return (
            <li className="border-b border-[color:var(--df-color-hairline)] last:border-0" key={collection.id}>
              <Link className="touch-target flex items-center gap-[var(--df-space-3)] py-[var(--df-space-2)]" onClick={closeSearch} to={collectionUrl}>
                {/* One fixed square per row, whatever shape the image is. */}
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--df-radius-sm)] bg-[color:var(--df-color-raised)]">
                  {collection.image?.url ? (
                    <Image
                      alt={collection.image.altText ?? ''}
                      src={collection.image.url}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-[length:var(--df-size-sm)]">
                  {collection.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null;

  return (
    <div className="mb-[var(--df-space-6)]" key="pages">
      <h3 className="mb-[var(--df-space-2)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">Pages</h3>
      <ul>
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li className="border-b border-[color:var(--df-color-hairline)] last:border-0" key={page.id}>
              <Link className="touch-target flex items-center gap-[var(--df-space-3)] py-[var(--df-space-2)]" onClick={closeSearch} to={pageUrl}>
                <div>
                  <span>{page.title}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  if (!products.length) return null;

  return (
    <div className="mb-[var(--df-space-6)]" key="products">
      <h3 className="mb-[var(--df-space-2)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">Products</h3>
      <ul className="m-0 list-none p-0">
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const price = product?.selectedOrFirstAvailableVariant?.price;
          const image = product?.selectedOrFirstAvailableVariant?.image;
          return (
            <li className="border-b border-[color:var(--df-color-hairline)] last:border-0" key={product.id}>
              <Link
                to={productUrl}
                onClick={closeSearch}
                className="flex items-center gap-[var(--df-space-3)] py-[var(--df-space-2)]"
              >
                {/* A fixed square keeps every row the same height whatever
                    shape the merchant's photography happens to be. */}
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--df-radius-sm)] bg-[color:var(--df-color-raised)]">
                  {image ? (
                    <Image
                      alt={image.altText ?? ''}
                      src={image.url}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src="/placeholders/product.svg"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink)]">
                    {product.title}
                  </span>
                  <span className="block text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-strong)]">
                    {price && <Money data={price} as="span" />}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string;
}) {
  if (!queries.length) return null;

  /*
    Styled suggestions rather than a native datalist. The datalist draws the
    browser's own dropdown arrow inside the field and opens a list we cannot
    style, which reads as an artefact beside our own results. These are links,
    so a suggestion goes straight to the full results for it.
  */
  return (
    <div className="mb-[var(--df-space-6)]" id={queriesDatalistId}>
      <h3 className="mb-[var(--df-space-2)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">
        Suggestions
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-[var(--df-space-2)] p-0">
        {queries.slice(0, 4).map((suggestion) => {
          if (!suggestion) return null;
          return (
            <li key={suggestion.text}>
              <Link
                to={`/search?q=${encodeURIComponent(suggestion.text)}`}
                className="touch-target inline-flex items-center rounded-[var(--df-radius-pill)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-4)] text-[length:var(--df-size-sm)]"
              >
                {suggestion.text}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  if (!term.current) {
    return null;
  }

  return (
    <p>
      No results found for <q>{term.current}</q>
    </p>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}
