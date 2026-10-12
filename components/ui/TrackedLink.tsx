"use client";

import { track, type AnalyticsEventName, type AnalyticsEvents } from "@/lib/analytics";

type Props<E extends AnalyticsEventName> = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: E;
  data: AnalyticsEvents[E];
};

/** Plain <a> that also sends a Vercel Analytics event on click. */
export function TrackedLink<E extends AnalyticsEventName>({ event, data, onClick, ...props }: Props<E>) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, data);
        onClick?.(e);
      }}
    />
  );
}
