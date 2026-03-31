import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presidentielle2027.fr";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/candidats`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/sondages`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/actualites`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/agenda`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/comparateur`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/partis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Dynamic pages
  try {
    const [candidats, partis, actualites] = await Promise.all([
      prisma.candidat.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.parti.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.actualite.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const candidatPages: MetadataRoute.Sitemap = candidats.map((c) => ({
      url: `${baseUrl}/candidats/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const partiPages: MetadataRoute.Sitemap = partis.map((p) => ({
      url: `${baseUrl}/partis/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const actualitePages: MetadataRoute.Sitemap = actualites.map((a) => ({
      url: `${baseUrl}/actualites/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticPages, ...candidatPages, ...partiPages, ...actualitePages];
  } catch {
    return staticPages;
  }
}
