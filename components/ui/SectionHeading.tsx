type Props = {
  id: string;
  number: string;
  children: React.ReactNode;
  /** Optional mono note on the right end of the rule (e.g. the project counter). */
  aside?: React.ReactNode;
  className?: string;
  /** Size of the H2 – the default display size, overridden only by the contact headline. */
  headingClassName?: string;
  /** Line-by-line reveal on scroll (MotionRoot). Off where a section animates its heading itself. */
  reveal?: boolean;
};

/**
 * Section head on the ruled grid (griflan.com style): a hairline with the gold section number,
 * then the big H2. The id is referenced by the section's aria-labelledby.
 */
export function SectionHeading({ id, number, children, aside, className = "", headingClassName = "text-h2", reveal = true }: Props) {
  return (
    <div className={className}>
      <div className="eyebrow flex items-center justify-between gap-4 border-t border-line pt-3">
        <span className="text-gold-text" aria-hidden="true">
          {number}
        </span>
        {aside ? <span className="text-fg-muted">{aside}</span> : null}
      </div>
      <h2
        id={id}
        data-reveal={reveal ? "lines" : undefined}
        data-skew
        className={`mt-10 font-bold md:mt-16 ${headingClassName}`}
      >
        {children}
      </h2>
    </div>
  );
}
