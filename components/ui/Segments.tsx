import { Fragment, type ReactNode } from "react";

type Props = {
  /** The parts of the line – or one string with the parts joined by " · ". */
  items: string | ReactNode[];
  className?: string;
  /** Below md every part gets its own line (and no dots) – for long lines like the footer bar. */
  stack?: boolean;
  /** Keep even long parts on one line – where the column is known to be wide enough. */
  nowrap?: boolean;
};

/** Parts up to this many characters never break inside – longer ones may, on a narrow column. */
const NOWRAP_MAX = 18;

function partClass(content: ReactNode, stack: boolean, keep: boolean): string {
  const nowrap = keep || typeof content !== "string" || content.length <= NOWRAP_MAX ? "whitespace-nowrap" : "";
  return stack ? `block md:inline ${nowrap && "md:whitespace-nowrap"}` : nowrap;
}

/**
 * A line of parts joined by " · " (status line, degree, footer bar). It wraps only between whole
 * parts, each dot stays at the end of its line, and the lines are balanced – never a lone word or
 * part on the last line. The dots are decoration, hidden from screen readers.
 */
export function Segments({ items, className = "", stack = false, nowrap = false }: Props) {
  const parts = typeof items === "string" ? items.split(" · ") : items;
  const dot = stack ? "hidden md:inline" : "";

  return (
    <span className={`text-balance ${stack ? "flex flex-col gap-y-1 md:block" : "block"} ${className}`}>
      {parts.map((content, i) => (
        <Fragment key={i}>
          <span className={partClass(content, stack, nowrap)}>
            {content}
            {i < parts.length - 1 ? (
              <span aria-hidden="true" className={dot}>
                {"\u00a0·"}
              </span>
            ) : null}
          </span>
          {i < parts.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
