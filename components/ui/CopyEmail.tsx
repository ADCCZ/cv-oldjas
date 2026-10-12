"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { ScrambleText } from "./ScrambleText";

type Props = {
  email: string;
  copyLabel: string;
  copiedLabel: string;
  writeLabel: string;
};

/** E-mail that copies itself on click (with a "Copied" toast) plus a separate mailto icon. */
export function CopyEmail({ email, copyLabel, copiedLabel, writeLabel }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      track("email_click", { place: "contact-copy" });
    } catch {
      // Clipboard not available (insecure context, permissions) – fall back to the mail client.
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <span className="relative inline-flex items-center gap-3">
      <button type="button" onClick={copy} title={copyLabel} className="link-draw text-left">
        <ScrambleText text={email} />
        <span className="sr-only"> – {copyLabel}</span>
      </button>
      <a
        href={`mailto:${email}`}
        aria-label={writeLabel}
        onClick={() => track("email_click", { place: "contact-mailto" })}
        className="grid size-7 place-items-center border border-line-strong transition-colors duration-300 hover:border-gold hover:text-gold-text"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
          <path d="M3 5h18v14H3z" />
          <path d="m3 6 9 7 9-7" />
        </svg>
      </a>
      <span
        role="status"
        aria-live="polite"
        className={`eyebrow pointer-events-none absolute -top-9 left-0 bg-gold px-3 py-1.5 text-ink transition-opacity duration-300 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        {copied ? copiedLabel : ""}
      </span>
    </span>
  );
}
