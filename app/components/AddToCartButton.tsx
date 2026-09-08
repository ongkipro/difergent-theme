import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="touch-target mt-[var(--df-space-4)] flex w-full items-center justify-center rounded-[var(--df-radius-md)] bg-[color:var(--df-color-accent)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[color:var(--df-color-on-accent)] disabled:cursor-not-allowed disabled:bg-[color:var(--df-color-raised)] disabled:text-[color:var(--df-color-ink-muted)]"
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}
