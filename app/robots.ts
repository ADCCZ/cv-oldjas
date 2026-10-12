import type { MetadataRoute } from "next";
import { links } from "@/content/links.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/cv/print" },
    sitemap: `${links.site}/sitemap.xml`,
  };
}
