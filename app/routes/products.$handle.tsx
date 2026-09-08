import {useRef} from 'react';
import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {StickyAddToCart} from '~/components/StickyAddToCart';
import {
  breadcrumbJsonLd,
  buildMeta,
  canonicalUrl,
  productJsonLd,
} from '~/lib/seo';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data, location}) => {
  const product = data?.product;
  const variant = product?.selectedOrFirstAvailableVariant;
  const url = canonicalUrl(location.pathname);

  const tags = buildMeta({
    title: product?.title,
    description: product?.description,
    pathname: location.pathname,
    image: variant?.image?.url,
    type: 'product',
  });

  if (product && variant) {
    // Structured data describes the variant the buyer is actually looking at,
    // so the price and availability in search results match the page.
    tags.push({
      'script:ld+json': productJsonLd({
        name: product.title,
        description: product.description,
        images: variant.image?.url ? [variant.image.url] : [],
        sku: variant.sku,
        price: variant.price.amount,
        currency: variant.price.currencyCode,
        available: Boolean(variant.availableForSale),
        url,
        brandName: product.vendor,
      }),
    });
    tags.push({
      'script:ld+json': breadcrumbJsonLd([
        {name: 'Home', path: '/'},
        {name: product.title, path: location.pathname},
      ]),
    });
  }

  return tags;
};

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
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const purchaseRef = useRef<HTMLDivElement>(null);

  // The sticky bar submits the real form rather than duplicating cart logic,
  // so there is one add-to-cart path and one place for it to be wrong.
  const submitPurchase = () => {
    purchaseRef.current
      ?.querySelector<HTMLButtonElement>('button[type="submit"]')
      ?.click();
  };

  return (
    <div className="container-page section-rhythm grid gap-[var(--df-space-8)] lg:grid-cols-2 lg:items-start">
      {/*
        Mobile decision sequence: identity and price, then media, then options
        and availability, then the purchase action, then supporting detail.
        On desktop the media moves alongside the decision region.
      */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-24">
        <h1 className="text-[length:var(--df-size-3xl)] md:text-[length:var(--df-size-4xl)] lg:hidden">
          {title}
        </h1>
        <div className="mt-[var(--df-space-2)] text-[length:var(--df-size-xl)] text-[color:var(--df-color-ink-strong)] lg:hidden">
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>
      </div>

      <div className="order-2 lg:order-1">
        <ProductImage image={selectedVariant?.image} />
      </div>

      <div className="order-3 lg:order-3 lg:col-start-2 lg:row-start-1 lg:mt-0">
        <h1 className="hidden text-[length:var(--df-size-4xl)] lg:block">
          {title}
        </h1>
        <div className="mt-[var(--df-space-2)] hidden text-[length:var(--df-size-xl)] text-[color:var(--df-color-ink-strong)] lg:block">
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>

        <p
          className={`mt-[var(--df-space-3)] text-[length:var(--df-size-sm)] ${
            selectedVariant?.availableForSale
              ? 'text-[color:var(--df-color-success)]'
              : 'text-[color:var(--df-color-danger)]'
          }`}
        >
          {selectedVariant?.availableForSale ? 'In stock' : 'Sold out'}
        </p>

        <div ref={purchaseRef}>
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
        </div>

        <StickyAddToCart
          watchRef={purchaseRef}
          title={title}
          variantTitle={
            selectedVariant?.title === 'Default Title'
              ? null
              : selectedVariant?.title
          }
          price={selectedVariant?.price}
          available={Boolean(selectedVariant?.availableForSale)}
          onAdd={submitPurchase}
        />

        {descriptionHtml ? (
          <section className="mt-[var(--df-space-8)] border-t border-[color:var(--df-color-hairline)] pt-[var(--df-space-6)]">
            <h2 className="text-[length:var(--df-size-lg)]">Description</h2>
            <div
              className="mt-[var(--df-space-3)] max-w-[68ch] text-[color:var(--df-color-ink)] [&_a]:underline [&_p]:mb-[var(--df-space-3)]"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          </section>
        ) : null}
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
