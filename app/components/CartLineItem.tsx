import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li key={id} className="border-b border-[color:var(--df-color-hairline)] py-[var(--df-space-4)] last:border-0">
      <div className="flex gap-[var(--df-space-3)]">
        {image ? (
          <Link to={lineItemUrl} className="shrink-0" tabIndex={-1} aria-hidden>
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={88}
              loading="lazy"
              width={88}
              className="h-[88px] w-[88px] rounded-[var(--df-radius-sm)] bg-[color:var(--df-color-raised)] object-cover"
            />
          </Link>
        ) : (
          <div className="h-[88px] w-[88px] shrink-0 rounded-[var(--df-radius-sm)] bg-[color:var(--df-color-raised)]" />
        )}

        <div className="min-w-0 flex-1">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <span className="flex min-h-[44px] items-center text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink)]">
              {product.title}
            </span>
          </Link>
          <div className="mt-[var(--df-space-1)] text-[length:var(--df-size-base)] text-[color:var(--df-color-ink-strong)]">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
          {selectedOptions.length > 0 ? (
            <ul className="mt-[var(--df-space-1)] flex flex-wrap gap-x-[var(--df-space-3)] text-[length:var(--df-size-xs)] text-[color:var(--df-color-ink-muted)]">
              {selectedOptions.map((option) => (
                <li key={option.name}>
                  {option.name}: {option.value}
                </li>
              ))}
            </ul>
          ) : null}
          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="mt-[var(--df-space-2)] space-y-[var(--df-space-1)] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-muted)]">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="mt-[var(--df-space-2)] flex items-center gap-[var(--df-space-2)]">
      <span className="sr-only">Quantity: {quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="touch-target inline-flex items-center justify-center rounded-[var(--df-radius-sm)] border border-[color:var(--df-color-border-control)] text-[length:var(--df-size-base)] disabled:cursor-not-allowed disabled:border-[color:var(--df-color-border)] disabled:text-[color:var(--df-color-ink-muted)]"
        >
          &#8722;
        </button>
      </CartLineUpdateButton>

      <span
        aria-hidden
        className="min-w-[2ch] text-center text-[length:var(--df-size-sm)]"
      >
        {quantity}
      </span>

      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className="touch-target inline-flex items-center justify-center rounded-[var(--df-radius-sm)] border border-[color:var(--df-color-border-control)] text-[length:var(--df-size-base)] disabled:cursor-not-allowed disabled:border-[color:var(--df-color-border)] disabled:text-[color:var(--df-color-ink-muted)]"
        >
          &#43;
        </button>
      </CartLineUpdateButton>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="touch-target ml-auto inline-flex items-center px-[var(--df-space-2)] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-muted)] underline underline-offset-4 disabled:no-underline"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
