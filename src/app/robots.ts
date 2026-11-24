import type { MetadataRoute } from "next";
import { AI_BOTS } from "@/lib/blocked-bots";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI crawlers / scrapers may not read or copy the site.
      { userAgent: AI_BOTS, disallow: "/" },
      // Search engines and everyone else: the site, but not the assistant API.
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: "https://agenticai.theskilltek.com/sitemap.xml",
  };
}
