"use client";

import { useState } from "react";

type Props = {
  number: string;
  title: string;
  items: string[];
  showDetailsLabel: string;
};

/**
 * Square card (leome-and-partners.com style). On hover / focus / tap it fills with red from the
 * top-right corner, the arrow turns from ↗ to ↙ and the list appears line by line.
 * The list is always in the DOM, so screen readers read it without any interaction.
 */
export function SkillCard({ number, title, items, showDetailsLabel }: Props) {
  const [open, setOpen] = useState(false);
  const listId = `skill-${number}-list`;

  const revealed =
    "group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100";
  const onFill = "group-data-[open=true]:text-cream group-focus-within:text-cream group-hover:text-cream";

  return (
    <li className="reveal-card group relative aspect-square overflow-hidden bg-bg" data-open={open}>
      <div className="corner-fill absolute inset-0 bg-red-500" aria-hidden="true" />
      <div className={`relative flex h-full flex-col p-6 transition-colors duration-700 md:p-8 ${onFill}`}>
        <div className="flex items-start justify-between">
          <span className={`eyebrow text-gold-text transition-colors duration-700 ${onFill}`} aria-hidden="true">
            {number}
          </span>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`${showDetailsLabel}: ${title}`}
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center bg-fg text-bg transition-colors duration-700 group-data-[open=true]:bg-cream group-data-[open=true]:text-red-600 group-hover:bg-cream group-hover:text-red-600"
          >
            <span
              className="text-xl leading-none transition-transform duration-700 ease-brand group-data-[open=true]:rotate-180 group-focus-within:rotate-180 group-hover:rotate-180"
              aria-hidden="true"
            >
              ↗
            </span>
          </button>
        </div>

        <ul id={listId} className="mt-6 space-y-1.5 text-base md:text-lg">
          {items.map((item, i) => (
            <li
              key={item}
              className={`translate-y-3 opacity-0 transition-[opacity,translate] duration-500 ease-reveal ${revealed}`}
              style={{ transitionDelay: `${120 + i * 70}ms` }}
            >
              {item}
            </li>
          ))}
        </ul>

        <h3 className="mt-auto text-3xl leading-[0.95] font-bold tracking-tight md:text-4xl">{title}</h3>
      </div>
    </li>
  );
}
