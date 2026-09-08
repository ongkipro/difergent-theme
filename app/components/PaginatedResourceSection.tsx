import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
/**
 * Pagination controls are buyer-facing taps, not decoration: they carry the
 * same 44px floor as every other control.
 */
const paginationLinkClass =
  'touch-target inline-flex items-center justify-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[length:var(--df-size-sm)] hover:bg-[color:var(--df-color-raised)]';

export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: (props: {node: NodesType; index: number}) => React.ReactNode;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <div className="flex justify-center py-[var(--df-space-6)] empty:hidden">
              <PreviousLink className={paginationLinkClass}>
                {isLoading ? 'Loading…' : 'Load previous'}
              </PreviousLink>
            </div>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <div className="flex justify-center py-[var(--df-space-8)] empty:hidden">
              <NextLink className={paginationLinkClass}>
                {isLoading ? 'Loading…' : 'Load more'}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
