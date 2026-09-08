import {Link} from 'react-router';

export type HeroProps = {
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
};

/**
 * Opening statement. One accent-coloured action and nothing competing with it.
 * No gradient, no overlay card stack: the image carries mood, the type carries
 * the message.
 */
export function Hero({heading, body, ctaLabel, ctaHref, image, imageAlt}: HeroProps) {
  return (
    <section className="section-rhythm" aria-labelledby="hero-heading">
      <div className="container-page grid gap-[var(--df-space-8)] lg:grid-cols-2 lg:items-center">
        <div>
          <h1
            id="hero-heading"
            className="text-[length:var(--df-size-4xl)] md:text-[length:var(--df-size-5xl)] lg:text-[length:var(--df-size-6xl)]"
          >
            {heading}
          </h1>
          {body ? (
            <p className="mt-[var(--df-space-4)] max-w-[46ch] text-[length:var(--df-size-lg)] text-[color:var(--df-color-ink-muted)]">
              {body}
            </p>
          ) : null}
          {ctaLabel && ctaHref ? (
            <Link
              to={ctaHref}
              className="touch-target mt-[var(--df-space-6)] inline-flex items-center rounded-[var(--df-radius-md)] bg-[color:var(--df-color-accent)] px-[var(--df-space-6)] py-[var(--df-space-3)] text-[color:var(--df-color-on-accent)]"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? ''}
            width={1600}
            height={900}
            className="w-full aspect-[16/9] object-cover"
            fetchPriority="high"
            decoding="async"
          />
        ) : null}
      </div>
    </section>
  );
}
