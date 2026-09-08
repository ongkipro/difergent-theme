import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
  priceRange: {minVariantPrice: MoneyV2; maxVariantPrice?: MoneyV2};
  compareAtPriceRange?: {minVariantPrice: MoneyV2} | null;
  availableForSale?: boolean;
};

/**
 * A comparison unit, not a marketing card. Fixed media ratio and a price
 * baseline that stays aligned across a row even when titles wrap, separated by
 * spacing and a hairline rather than an elevated box.
 */
export function ProductCard({
  product,
  loading = 'lazy',
  sizes = '(min-width: 1200px) 25vw, (min-width: 900px) 33vw, 50vw',
}: {
  product: ProductCardData;
  loading?: 'eager' | 'lazy';
  sizes?: string;
}) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount) ? compareAt : null;
  const soldOut = product.availableForSale === false;

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group flex h-full flex-col border-b border-[color:var(--df-color-hairline)] pb-[var(--df-space-4)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--df-color-raised)]">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            alt={product.featuredImage.altText || product.title}
            sizes={sizes}
            loading={loading}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src="/placeholders/product.svg"
            alt=""
            className="h-full w-full object-cover"
            loading={loading}
          />
        )}
        {soldOut ? (
          <span className="absolute left-[var(--df-space-2)] top-[var(--df-space-2)] rounded-[var(--df-radius-sm)] bg-[color:var(--df-color-surface)] px-[var(--df-space-2)] py-[var(--df-space-1)] text-[length:var(--df-size-xs)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">
            Sold out
          </span>
        ) : null}
      </div>

      {/* mt-auto keeps the price on a shared baseline when titles wrap */}
      <h3 className="mt-[var(--df-space-3)] font-[family-name:var(--df-font-body)] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink)]">
        {product.title}
      </h3>
      <p className="mt-auto pt-[var(--df-space-2)] text-[length:var(--df-size-base)] text-[color:var(--df-color-ink-strong)]">
        <Money data={price} as="span" />
        {onSale ? (
          <span className="ml-[var(--df-space-2)] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-muted)] line-through">
            <Money data={onSale} as="span" />
          </span>
        ) : null}
      </p>
    </Link>
  );
}
