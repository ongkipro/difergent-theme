import {useEffect, useRef, useState} from 'react';
import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {config} from '~/lib/config';

/**
 * Conditional, not a default. It appears only once the real purchase action has
 * scrolled out of view, and it carries enough context to be a purchase decision
 * rather than a nag: the variant and its current price.
 *
 * The bottom inset is not cosmetic. In an in-app browser the host's own toolbar
 * sits over the viewport, and a bar without it becomes untappable.
 */
export function StickyAddToCart({
  watchRef,
  title,
  variantTitle,
  price,
  available,
  onAdd,
}: {
  watchRef: React.RefObject<HTMLElement | null>;
  title: string;
  variantTitle?: string | null;
  price?: MoneyV2 | null;
  available: boolean;
  onAdd: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config.features.stickyAddToCart) return;
    const target = watchRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      {rootMargin: '0px 0px -10% 0px'},
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  if (!config.features.stickyAddToCart) return null;

  return (
    <div
      ref={barRef}
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--df-color-hairline)] bg-[color:var(--df-color-surface)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[var(--df-space-3)] shadow-[var(--df-shadow-overlay)] transition-transform duration-[var(--df-motion-base)] lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container-page flex items-center gap-[var(--df-space-3)]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink)]">
            {title}
            {variantTitle ? (
              <span className="text-[color:var(--df-color-ink-muted)]">
                {' '}
                · {variantTitle}
              </span>
            ) : null}
          </p>
          {price ? (
            <p className="text-[length:var(--df-size-base)] text-[color:var(--df-color-ink-strong)]">
              <Money data={price} as="span" />
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!available}
          className="touch-target inline-flex shrink-0 items-center justify-center rounded-[var(--df-radius-md)] bg-[color:var(--df-color-accent)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[color:var(--df-color-on-accent)] disabled:bg-[color:var(--df-color-raised)] disabled:text-[color:var(--df-color-ink-muted)]"
        >
          {available ? 'Add to cart' : 'Sold out'}
        </button>
      </div>
    </div>
  );
}
