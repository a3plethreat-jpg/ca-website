import type { MetadataRoute } from "next";
import { site } from "./lib/content";

// robots.txt points crawlers at /sitemap.xml. The site is a single page; the merch
// store lives on its own host, so it is linked from the footer site map instead
// (sitemaps may only list URLs on their own host).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "weekly", priority: 1 }];
}
