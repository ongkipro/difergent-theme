import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  if (!image) {
    return (
      <div className="aspect-square w-full bg-[color:var(--df-color-raised)]" />
    );
  }
  return (
    <div className="aspect-square w-full overflow-hidden bg-[color:var(--df-color-raised)]">
      {/*
        This is the largest contentful element on a product page. Hydrogen's
        Image lazy-loads by default, which puts the one image the score is
        measured on at the back of the queue.
      */}
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1200px) 50vw, (min-width: 900px) 55vw, 100vw"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
