import type { MetadataRoute } from "next";

const BASE = "https://thekabari.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,                     lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/pickup`,         lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/leaderboard`,    lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/auth`,           lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
