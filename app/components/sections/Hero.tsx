import {useState} from 'react';
import {Link} from 'react-router';

export type HeroSlide = {
  /** Small label above the heading. Names the category, not the offer. */
  eyebrow?: string;
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
};

export type HeroProps = {
  slides: HeroSlide[];
  /**
   * Scrim strength behind overlaid text, 0-100.
   *
   * Defaults to 65 because that is what keeps white body text above 4.5:1 on a
   * *light* image, which is the worst case a store can hand this component.
   * Lower it only after checking the result against the actual photography.
   */
  scrim?: number;
  /**
   * Place the text over the image instead of beside it.
   *
   * Off by default and deliberately so: text over photography is a contrast
   * lottery once a store supplies its own art direction, and nobody audits it
   * afterwards. Turn it on only with images that are dark and calm behind the
   * text, and check the result.
   */
  overlay?: boolean;
};

/**
 * An inset card that floats on the page rather than bleeding to the viewport
 * edge. The white margin around it is the composition: it is what makes the
 * image read as a deliberate object instead of a banner.
 */
export function Hero({slides, overlay = false, scrim = 65}: HeroProps) {
  const [index, setIndex] = useState(0);
  if (slides.length === 0) return null;

  const slide = slides[Math.min(index, slides.length - 1)];
  const many = slides.length > 1;

  return (
    <section
      className="container-page pt-[var(--df-space-6)]"
      aria-labelledby="hero-heading"
      aria-roledescription={many ? 'carousel' : undefined}
    >
      <div
        className={`relative overflow-hidden rounded-[var(--df-radius-lg)] bg-[color:var(--df-color-surface)] ${
          overlay ? '' : 'border border-[color:var(--df-color-hairline)]'
        }`}
      >
        {overlay ? (
          <OverlaySlide slide={slide} scrim={scrim} />
        ) : (
          <SplitSlide slide={slide} />
        )}

        {many ? (
          <div className="flex justify-end gap-[var(--df-space-2)] px-[var(--df-space-6)] pb-[var(--df-space-6)] lg:absolute lg:bottom-[var(--df-space-4)] lg:right-[var(--df-space-4)] lg:p-0">
            {slides.map((item, i) => (
              <button
                key={item.heading}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show slide ${i + 1} of ${slides.length}`}
                aria-current={i === index}
                className={`touch-target inline-flex items-center justify-center rounded-[var(--df-radius-pill)] border text-[length:var(--df-size-sm)] ${
                  i === index
                    ? 'border-[color:var(--df-color-ink-strong)] bg-[color:var(--df-color-surface)] text-[color:var(--df-color-ink-strong)]'
                    : 'border-[color:var(--df-color-border-control)] bg-[color:var(--df-color-surface)]/80 text-[color:var(--df-color-ink-muted)]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** The clean-white default: the text sits on a surface, so contrast is fixed. */
function SplitSlide({slide}: {slide: HeroSlide}) {
  return (
    <div className="grid lg:grid-cols-[5fr_7fr] lg:items-stretch">
      <div className="order-2 flex flex-col justify-center px-[var(--df-space-6)] py-[var(--df-space-8)] lg:order-1 lg:px-[var(--df-space-12)] lg:py-[var(--df-space-16)]">
        <HeroCopy slide={slide} />
      </div>
      <div className="order-1 lg:order-2">
        <HeroImage slide={slide} className="aspect-[4/3] lg:aspect-auto lg:h-full" />
      </div>
    </div>
  );
}

/** Opt-in: the reference composition, for stores whose imagery can carry text. */
function OverlaySlide({slide, scrim}: {slide: HeroSlide; scrim: number}) {
  return (
    <div className="relative">
      <HeroImage slide={slide} className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]" />
      {/*
        A single flat scrim, not a gradient. It is a constant, so the contrast
        it buys is the same on every image a store supplies.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[color:var(--df-color-ink-strong)]"
        style={{opacity: Math.min(95, Math.max(0, scrim)) / 100}}
      />
      <div className="absolute inset-0 flex items-center">
        <div className="px-[var(--df-space-6)] lg:px-[var(--df-space-12)] lg:max-w-[52%]">
          <HeroCopy slide={slide} onImage />
        </div>
      </div>
    </div>
  );
}

function HeroCopy({slide, onImage = false}: {slide: HeroSlide; onImage?: boolean}) {
  const ink = onImage ? 'var(--df-color-surface)' : 'var(--df-color-ink-strong)';
  const muted = onImage ? 'var(--df-color-surface)' : 'var(--df-color-ink-muted)';

  return (
    <>
      {slide.eyebrow ? (
        <p
          className="mb-[var(--df-space-4)] text-[length:var(--df-size-sm)] uppercase tracking-[0.08em]"
          style={{color: muted}}
        >
          {slide.eyebrow}
        </p>
      ) : null}

      <h1
        id="hero-heading"
        className="text-[length:var(--df-size-4xl)] md:text-[length:var(--df-size-5xl)] lg:text-[length:var(--df-size-6xl)]"
        style={{color: ink}}
      >
        {slide.heading}
      </h1>

      {slide.body ? (
        <p
          className="mt-[var(--df-space-4)] max-w-[46ch] text-[length:var(--df-size-lg)]"
          style={{color: muted}}
        >
          {slide.body}
        </p>
      ) : null}

      {slide.ctaLabel && slide.ctaHref ? (
        <Link
          to={slide.ctaHref}
          className={`touch-target mt-[var(--df-space-8)] inline-flex w-fit items-center rounded-[var(--df-radius-pill)] px-[var(--df-space-8)] py-[var(--df-space-3)] ${
            onImage
              ? 'bg-[color:var(--df-color-surface)] text-[color:var(--df-color-ink-strong)]'
              : 'bg-[color:var(--df-color-accent)] text-[color:var(--df-color-on-accent)]'
          }`}
        >
          {slide.ctaLabel}
        </Link>
      ) : null}
    </>
  );
}

function HeroImage({slide, className}: {slide: HeroSlide; className: string}) {
  if (!slide.image) {
    return <div className={`w-full bg-[color:var(--df-color-raised)] ${className}`} />;
  }
  return (
    <img
      src={slide.image}
      alt={slide.imageAlt ?? ''}
      width={1600}
      height={900}
      fetchPriority="high"
      decoding="async"
      className={`w-full object-cover ${className}`}
    />
  );
}
