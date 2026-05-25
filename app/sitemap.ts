import type { MetadataRoute } from "next";
import { bookList } from "@/lib/books";
import { articleEntries } from "@/lib/journal";
import { SITE_URL } from "@/lib/site";

const lastModified = new Date("2026-05-25");

function imageUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      images: [
        imageUrl("/images/sam-headshot.jpg"),
        imageUrl("/images/perception-47-logo.png"),
      ],
    },
    {
      url: `${SITE_URL}/coaching`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.95,
      images: [imageUrl("/images/sam-headshot.jpg")],
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
      images: [imageUrl("/images/sam-headshot.jpg")],
    },
    {
      url: `${SITE_URL}/books`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
      images: bookList.map((book) => imageUrl(book.coverImage)),
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [imageUrl("/images/sam-headshot.jpg")],
    },
    {
      url: `${SITE_URL}/testimonials`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articleEntries.map((entry) => ({
    url: `${SITE_URL}/articles/${entry.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.72,
    images: [imageUrl("/images/sam-headshot.jpg")],
  }));

  return [...staticRoutes, ...articleRoutes];
}
