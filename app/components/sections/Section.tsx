import type {ReactNode} from 'react';

/**
 * The shared section shell. Rhythm and width come from tokens, so a section
 * never invents its own spacing and the page reads as deliberate blocks rather
 * than a continuous scroll.
 */
export function Section({
  children,
  labelledBy,
  bleed = false,
}: {
  children: ReactNode;
  labelledBy?: string;
  bleed?: boolean;
}) {
  return (
    <section className="section-rhythm" aria-labelledby={labelledBy}>
      <div className={bleed ? '' : 'container-page'}>{children}</div>
    </section>
  );
}

export function SectionHeading({id, children}: {id: string; children: ReactNode}) {
  return (
    <h2 id={id} className="text-[length:var(--df-size-3xl)] md:text-[length:var(--df-size-4xl)] mb-[var(--df-space-6)]">
      {children}
    </h2>
  );
}
