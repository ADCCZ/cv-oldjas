// English – the main language, on /.
import type { Metadata, Viewport } from "next";
import { SiteLayout, siteMetadata, siteViewport } from "../_site/SiteLayout";

export const viewport: Viewport = siteViewport;

export function generateMetadata(): Metadata {
  return siteMetadata("en");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
