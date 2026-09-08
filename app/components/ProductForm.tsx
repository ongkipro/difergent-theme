import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="mt-[var(--df-space-6)]">
      {productOptions.map((option) => {
        // A single value is the platform's synthetic default, not a buyer
        // choice, so it is not shown.
        if (option.optionValues.length === 1) return null;

        return (
          <fieldset
            className="mb-[var(--df-space-6)] border-0 p-0"
            key={option.name}
          >
            <legend className="mb-[var(--df-space-3)] p-0 text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">
              {option.name}
            </legend>
            <div className="flex flex-wrap gap-[var(--df-space-2)]">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                // State is signalled by border weight, strikethrough and the
                // accessible label as well as colour, never by colour alone.
                const base =
                  'touch-target inline-flex items-center justify-center rounded-[var(--df-radius-sm)] px-[var(--df-space-3)] text-[length:var(--df-size-sm)] border';
                const state = selected
                  ? ' border-[color:var(--df-color-ink-strong)] border-2 bg-[color:var(--df-color-raised)]'
                  : ' border-[color:var(--df-color-border-control)]';
                const unavailable = available
                  ? ''
                  : ' line-through text-[color:var(--df-color-ink-muted)]';

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={base + state + unavailable}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      aria-current={selected ? 'true' : undefined}
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                      {available ? null : (
                        <span className="sr-only"> (unavailable)</span>
                      )}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={base + state + unavailable}
                    key={option.name + name}
                    aria-pressed={selected}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                    {available ? null : (
                      <span className="sr-only"> (unavailable)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="inline-block h-5 w-5 rounded-[var(--df-radius-pill)] border border-[color:var(--df-color-border-control)]"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
