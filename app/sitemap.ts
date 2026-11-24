import type { MetadataRoute } from "next";
import { merch, site } from "./lib/content";

// robots.txt points crawlers at /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}${merch.path}`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
