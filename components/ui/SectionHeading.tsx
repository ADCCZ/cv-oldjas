type Props = {
  id: string;
  number: string;
  children: React.ReactNode;
  className?: string;
};

/** Gold mono section number + big H2. The id is referenced by the section's aria-labelledby. */
export function SectionHeading({ id, number, children, className = "" }: Props) {
  return (
    <div className={`flex items-start gap-3 md:gap-5 ${className}`}>
      <span className="eyebrow mt-[0.6em] text-gold-text" aria-hidden="true">
        {number}
      </span>
      <h2 id={id} className="text-h2 font-bold">
        {children}
      </h2>
    </div>
  );
}
