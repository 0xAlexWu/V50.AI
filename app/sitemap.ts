import type { MetadataRoute } from "next";

import { getSkillAuthorHandle } from "@/lib/authors";
import { getAllSkills } from "@/lib/skills";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://v50.ai";
  const skills = await getAllSkills();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/skills`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/collections`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 }
  ];

  const skillRoutes: MetadataRoute.Sitemap = skills.map((skill) => ({
    url: `${base}/skills/${skill.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: skill.updatedAt ? new Date(skill.updatedAt) : undefined
  }));

  const authorRoutes: MetadataRoute.Sitemap = [...new Set(skills.map((skill) => getSkillAuthorHandle(skill)).filter(Boolean))]
    .slice(0, 800)
    .map((author) => ({
      url: `${base}/authors/${encodeURIComponent(author as string)}`,
      changeFrequency: "daily" as const,
      priority: 0.55
    }));

  return [...staticRoutes, ...skillRoutes, ...authorRoutes];
}
