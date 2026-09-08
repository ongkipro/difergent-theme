import {Section, SectionHeading} from './Section';

export type ImageWithTextProps = {
  heading: string;
  body: string;
  image: string;
  imageAlt?: string;
  align?: 'start' | 'end';
};

export function ImageWithText({
  heading,
  body,
  image,
  imageAlt,
  align = 'start',
}: ImageWithTextProps) {
  const id = 'image-with-text-heading';
  return (
    <Section labelledBy={id}>
      <div className="grid gap-[var(--df-space-8)] md:grid-cols-2 md:items-center">
        <img
          src={image}
          alt={imageAlt ?? ''}
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className={`w-full aspect-[4/3] object-cover ${
            align === 'end' ? 'md:order-2' : ''
          }`}
        />
        <div>
          <SectionHeading id={id}>{heading}</SectionHeading>
          <p className="max-w-[52ch] text-[color:var(--df-color-ink-muted)]">{body}</p>
        </div>
      </div>
    </Section>
  );
}
