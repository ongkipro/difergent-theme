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
  'touch-target mx-auto my-[var(--df-space-6)] inline-flex w-fit items-center justify-center rounded-[var(--df-radius-md)] border border-[color:var(--df-color-border-control)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[length:var(--df-size-sm)]';

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
            <PreviousLink className={paginationLinkClass}>
              {isLoading ? 'Loading…' : 'Load previous'}
            </PreviousLink>
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
            <NextLink className={paginationLinkClass}>
              {isLoading ? 'Loading…' : 'Load more'}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
