"use client";

import { useEffect, useState } from "react";
import { links } from "@/content/links.config";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: links.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const offsetFormat = new Intl.DateTimeFormat("en-GB", { timeZone: links.timeZone, timeZoneName: "shortOffset" });

/** "GMT+2" → "UTC+2" – follows daylight saving time automatically. */
function utcOffset(date: Date): string {
  const name = offsetFormat.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  return name.replace("GMT", "UTC");
}

type Props = {
  label: string;
  showOffset?: boolean;
  className?: string;
};

/**
 * Live local time in Pilsen (Europe/Prague), ticking every second.
 * Rendered empty on the server so the static HTML never mismatches the visitor's clock.
 */
export function Clock({ label, showOffset = false, className = "" }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`font-label tabular-nums ${className}`}>
      <span className="sr-only">{label}: </span>
      {showOffset && now ? <span className="text-fg-muted">({utcOffset(now)}) </span> : null}
      <time dateTime={now?.toISOString()} suppressHydrationWarning>
        {now ? timeFormat.format(now) : "--:--:--"}
      </time>
    </span>
  );
}
