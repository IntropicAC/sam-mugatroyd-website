import type { MetadataRoute } from "next";
import { articleEntries } from "@/lib/journal";
import { SITE_URL } from "@/lib/site";

const lastModified = new Date("2026-05-21");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/coaching`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/books`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articleEntries.map((entry) => ({
    url: `${SITE_URL}/articles/${entry.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.72,
  }));

  return [...staticRoutes, ...articleRoutes];
}
