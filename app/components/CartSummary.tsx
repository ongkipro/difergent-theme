import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {features} from '../../config/features';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  const appliedDiscounts =
    cart?.discountCodes?.filter((code) => code.applicable) ?? [];
  const appliedGiftCards = cart?.appliedGiftCards ?? [];
  const hasCodes = appliedDiscounts.length + appliedGiftCards.length > 0;
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <div
      aria-labelledby={summaryId}
      className={
        layout === 'aside'
          ? 'sticky bottom-0 border-t border-[color:var(--df-color-hairline)] bg-[color:var(--df-color-surface)] pt-[var(--df-space-4)] pb-[max(0.75rem,env(safe-area-inset-bottom))]'
          : 'mt-[var(--df-space-8)] border-t border-[color:var(--df-color-hairline)] pt-[var(--df-space-6)]'
      }
    >
      <h2 id={summaryId} className="sr-only">
        Order summary
      </h2>

      <dl className="flex items-baseline justify-between text-[length:var(--df-size-lg)]">
        <dt className="text-[color:var(--df-color-ink-muted)]">
          Subtotal
          {itemCount > 0 ? (
            <span className="text-[length:var(--df-size-sm)]">
              {' '}
              · {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          ) : null}
        </dt>
        <dd className="m-0 text-[color:var(--df-color-ink-strong)]">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} as="span" />
          ) : (
            '\u2014'
          )}
        </dd>
      </dl>

      {/* The caveat belongs next to the number it qualifies, not under the button. */}
      <p className="mt-[var(--df-space-1)] text-[length:var(--df-size-xs)] text-[color:var(--df-color-ink-muted)]">
        Taxes and shipping are calculated at checkout.
      </p>

      {/*
        Two always-open input rows pushed the checkout action away from the
        subtotal it belongs to. Most buyers have no code, so the fields are
        disclosed on request — and opened automatically when a code is already
        applied, so an applied discount is never hidden from the buyer.
      */}
      <details open={hasCodes} className="group mt-[var(--df-space-4)]">
        <summary className="touch-target inline-flex cursor-pointer list-none items-center gap-[var(--df-space-2)] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-muted)] [&::-webkit-details-marker]:hidden">
          {/* A disclosure, not a link: the marker says it toggles rather than navigates. */}
          <span
            aria-hidden
            className="inline-flex h-5 w-5 items-center justify-center rounded-[var(--df-radius-sm)] border border-[color:var(--df-color-border-control)] leading-none"
          >
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">&minus;</span>
          </span>
          <span className="underline underline-offset-4">
            {hasCodes ? 'Discounts and gift cards' : 'Add a discount or gift card'}
          </span>
        </summary>
        <div className="pb-[var(--df-space-2)]">
          <CartDiscounts
            discountCodes={cart?.discountCodes}
            discountsHeadingId={discountsHeadingId}
            discountCodeInputId={discountCodeInputId}
          />
          {features.giftCards ? (
            <CartGiftCard
              giftCardCodes={cart?.appliedGiftCards}
              giftCardHeadingId={giftCardHeadingId}
              giftCardInputId={giftCardInputId}
            />
          ) : null}
        </div>
      </details>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} layout={layout} />
    </div>
  );
}

function CartCheckoutActions({
  checkoutUrl,
  layout,
}: {
  checkoutUrl?: string;
  layout: CartLayout;
}) {
  if (!checkoutUrl) return null;

  return (
    <div
      className={`mt-[var(--df-space-4)] ${
        // Full width in the drawer, where the column is already narrow. On the
        // page a button stretched across the content reads as a bar, not an
        // action, so it is capped.
        layout === 'page' ? 'sm:max-w-[360px]' : ''
      }`}
    >
      <a
        href={checkoutUrl}
        target="_self"
        className="touch-target flex w-full items-center justify-center rounded-[var(--df-radius-md)] bg-[color:var(--df-color-accent)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[color:var(--df-color-on-accent)]"
      >
        Continue to checkout
      </a>
      <p className="mt-[var(--df-space-2)] text-center text-[length:var(--df-size-xs)] text-[color:var(--df-color-ink-muted)]">
        Checkout is hosted by Shopify.
      </p>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts">
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt
            id={discountsHeadingId}
            className="text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-muted)]"
          >
            Discounts
          </dt>
          <UpdateDiscountForm>
            <div
              className="text-[length:var(--df-size-sm)] text-[color:var(--df-color-success)]"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code className="font-[family-name:var(--df-font-mono)]">
                {codes?.join(', ')}
              </code>
              <button
                type="submit"
                aria-label="Remove discount"
                className="touch-target ml-[var(--df-space-2)] inline-flex items-center text-[length:var(--df-size-sm)] underline underline-offset-4"
              >
                Remove
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="mt-[var(--df-space-4)] flex gap-[var(--df-space-2)]">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="touch-target min-w-0 flex-1 rounded-[var(--df-radius-sm)] px-[var(--df-space-3)] text-[length:var(--df-size-sm)]"
          />
          <button
            type="submit"
            aria-label="Apply discount code"
            className="touch-target inline-flex shrink-0 items-center justify-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-4)] text-[length:var(--df-size-sm)]"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Gift cards">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="text-[length:var(--df-size-sm)] text-[color:var(--df-color-success)]">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el: HTMLButtonElement | null) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code className="font-[family-name:var(--df-font-mono)]">
                  ***{giftCard.lastCharacters}
                </code>{' '}
                <Money data={giftCard.amountUsed} as="span" />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="mt-[var(--df-space-4)] flex gap-[var(--df-space-2)]">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="touch-target min-w-0 flex-1 rounded-[var(--df-radius-sm)] px-[var(--df-space-3)] text-[length:var(--df-size-sm)]"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Apply gift card code"
            className="touch-target inline-flex shrink-0 items-center justify-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-4)] text-[length:var(--df-size-sm)] disabled:text-[color:var(--df-color-ink-muted)]"
          >
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        aria-label={`Remove gift card ending in ${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        Remove
      </button>
    </CartForm>
  );
}
