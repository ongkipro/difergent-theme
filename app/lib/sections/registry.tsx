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
  hero: (props) => {
    // One slide or many: configuration may give a single set of fields or a
    // `slides` array. Both shapes render the same component.
    const raw = Array.isArray(props.slides) ? props.slides : [props];
    const slides = raw
      .filter((slide: any) => slide && slide.heading)
      .map((slide: any) => ({
        eyebrow: slide.eyebrow ? String(slide.eyebrow) : undefined,
        heading: String(slide.heading),
        body: slide.body ? String(slide.body) : undefined,
        ctaLabel: slide.ctaLabel ? String(slide.ctaLabel) : undefined,
        ctaHref: slide.ctaHref ? String(slide.ctaHref) : undefined,
        image: slide.image ? String(slide.image) : undefined,
        imageAlt: slide.imageAlt ? String(slide.imageAlt) : undefined,
      }));
    return (
      <Hero
        slides={slides}
        overlay={props.overlay === true}
        scrim={typeof props.scrim === 'number' ? props.scrim : undefined}
      />
    );
  },
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
