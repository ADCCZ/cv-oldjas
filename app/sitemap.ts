import type { MetadataRoute } from "next";
import { links } from "@/content/links.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${links.site}/`, cs: `${links.site}/cs` };
  return [
    { url: `${links.site}/`, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${links.site}/cs`, changeFrequency: "monthly", priority: 0.8, alternates: { languages } },
  ];
}
