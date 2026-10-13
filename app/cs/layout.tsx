// Czech, on /cs.
import type { Metadata, Viewport } from "next";
import { SiteLayout, siteMetadata, siteViewport } from "../_site/SiteLayout";

export const viewport: Viewport = siteViewport;

export function generateMetadata(): Metadata {
  return siteMetadata("cs");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="cs">{children}</SiteLayout>;
}
