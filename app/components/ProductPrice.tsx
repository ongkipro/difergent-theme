import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div aria-label="Price" className="flex flex-wrap items-baseline gap-[var(--df-space-2)]" role="group">
      {compareAtPrice ? (
        <div className="flex flex-wrap items-baseline gap-[var(--df-space-2)]">
          {price ? <Money data={price} as="span" /> : null}
          <s>
            <Money data={compareAtPrice} as="span" />
          </s>
        </div>
      ) : price ? (
        <Money data={price} as="span" />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
