import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Section, SectionHeading} from './Section';

export type CollectionListItem = {
  id: string;
  handle: string;
  title: string;
  image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
};

export function CollectionList({
  heading,
  collections,
}: {
  heading?: string;
  collections?: CollectionListItem[] | null;
}) {
  if (!collections || collections.length === 0) return null;
  const id = 'collection-list-heading';

  return (
    <Section labelledBy={id}>
      <SectionHeading id={id}>{heading || 'Browse'}</SectionHeading>
      <div className="grid grid-cols-2 gap-[var(--df-space-4)] md:grid-cols-4 lg:gap-[var(--df-space-6)]">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="block"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[color:var(--df-color-raised)]">
              {collection.image ? (
                <Image
                  data={collection.image}
                  alt={collection.image.altText || collection.title}
                  sizes="(min-width: 900px) 25vw, 50vw"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img src="/placeholders/collection.svg" alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>
            <h3 className="mt-[var(--df-space-3)] font-[family-name:var(--df-font-body)] text-[length:var(--df-size-sm)]">
              {collection.title}
            </h3>
          </Link>
        ))}
      </div>
    </Section>
  );
}
