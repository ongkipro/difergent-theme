import {Section, SectionHeading} from './Section';

export type RichTextProps = {heading?: string; body: string};

export function RichText({heading, body}: RichTextProps) {
  const id = 'rich-text-heading';
  return (
    <Section labelledBy={heading ? id : undefined}>
      {heading ? <SectionHeading id={id}>{heading}</SectionHeading> : null}
      <p className="max-w-[68ch] text-[length:var(--df-size-lg)] text-[color:var(--df-color-ink)]">
        {body}
      </p>
    </Section>
  );
}
