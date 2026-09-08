import type {ReactNode} from 'react';
import {Hero} from '~/components/sections/Hero';
import {RichText} from '~/components/sections/RichText';
import {ImageWithText} from '~/components/sections/ImageWithText';
import {
  FeaturedCollection,
  type FeaturedCollectionProps,
} from '~/components/sections/FeaturedCollection';
import {
  CollectionList,
  type CollectionListItem,
} from '~/components/sections/CollectionList';
import type {SectionType} from './types';

/** Data the home loader resolves for the data-backed section types. */
export type SectionData = {
  featuredCollection?: FeaturedCollectionProps['collection'];
  collections?: CollectionListItem[] | null;
};

type Renderer = (props: Record<string, any>, data: SectionData) => ReactNode;

/**
 * The registry is the whole extension point. Configuration selects a name from
 * here; a name that is not here fails validation before the page ever renders.
 */
export const SECTION_REGISTRY: Record<SectionType, Renderer> = {
  hero: (props) => (
    <Hero
      heading={String(props.heading ?? '')}
      body={props.body ? String(props.body) : undefined}
      ctaLabel={props.ctaLabel ? String(props.ctaLabel) : undefined}
      ctaHref={props.ctaHref ? String(props.ctaHref) : undefined}
      image={props.image ? String(props.image) : undefined}
      imageAlt={props.imageAlt ? String(props.imageAlt) : undefined}
    />
  ),
  'featuredCollection': (props, data) => (
    <FeaturedCollection
      heading={props.heading ? String(props.heading) : undefined}
      collection={data.featuredCollection}
    />
  ),
  'imageWithText': (props) => (
    <ImageWithText
      heading={String(props.heading ?? '')}
      body={String(props.body ?? '')}
      image={String(props.image ?? '')}
      imageAlt={props.imageAlt ? String(props.imageAlt) : undefined}
      align={props.align === 'end' ? 'end' : 'start'}
    />
  ),
  'collectionList': (props, data) => (
    <CollectionList
      heading={props.heading ? String(props.heading) : undefined}
      collections={data.collections}
    />
  ),
  'richText': (props) => (
    <RichText
      heading={props.heading ? String(props.heading) : undefined}
      body={String(props.body ?? '')}
    />
  ),
};

/** Section types that cost a Storefront API request. */
export const DATA_BACKED: ReadonlySet<SectionType> = new Set<SectionType>([
  'featuredCollection',
  'collectionList',
]);
