import {Link} from 'react-router';
import {Section, SectionHeading} from './Section';
import {ProductCard, type ProductCardData} from '../ProductCard';

export type FeaturedCollectionProps = {
  heading?: string;
  collection?: {handle: string; title: string; products: ProductCardData[]} | null;
};

/**
 * Omitted entirely when its data is unavailable, rather than rendering an empty
 * frame that a buyer has to interpret.
 */
export function FeaturedCollection({heading, collection}: FeaturedCollectionProps) {
  if (!collection || collection.products.length === 0) return null;
  const id = 'featured-collection-heading';
  const title = heading || collection.title;

  return (
    <Section labelledBy={id}>
      <div className="mb-[var(--df-space-6)] flex flex-wrap items-baseline justify-between gap-[var(--df-space-4)]">
        <SectionHeading id={id}>{title}</SectionHeading>
        <Link
          to={`/collections/${collection.handle}`}
          className="touch-target inline-flex items-center text-[length:var(--df-size-sm)] underline underline-offset-4"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-[var(--df-space-4)] md:grid-cols-3 lg:grid-cols-4 lg:gap-[var(--df-space-6)]">
        {collection.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
