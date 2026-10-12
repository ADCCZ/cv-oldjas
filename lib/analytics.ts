"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { Locale } from "@/content/types";

/**
 * Custom events for Vercel Web Analytics (cookieless – no consent banner needed).
 * The map keeps event names and their parameters type-checked across the codebase.
 */
export type AnalyticsEvents = {
  cv_download: { lang: Locale; version: "design" | "plain" };
  email_click: { place: string };
  github_click: { place: string };
  project_open: { id: string; target: "demo" | "repo" };
  lang_switch: { from: Locale; to: Locale };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

export function track<E extends AnalyticsEventName>(event: E, data: AnalyticsEvents[E]): void {
  vercelTrack(event, data);
}
