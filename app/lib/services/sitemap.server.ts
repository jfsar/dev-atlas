import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";
import type { ChangeFrequency, SitemapEntry } from "~/lib/sitemap";

const staticEntries: SitemapEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/roadmaps", changeFrequency: "weekly", priority: 0.9 },
  { path: "/business-domains", changeFrequency: "weekly", priority: 0.8 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
];

function withPrefix(
  prefix: string,
  rows: { slug: string; updatedAt: Date }[],
  changeFrequency: ChangeFrequency,
  priority: number,
): SitemapEntry[] {
  return rows.map((row) => ({
    path: `/${prefix}/${row.slug}`,
    lastModified: row.updatedAt,
    changeFrequency,
    priority,
  }));
}

/**
 * Collect every publicly reachable URL: static directory pages plus each
 * published roadmap, topic, business domain, and project.
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const select = { slug: true, updatedAt: true } as const;
  const [roadmaps, topics, domains, projects] = await Promise.all([
    prisma.roadmap.findMany({
      where: { status: PUBLISHED },
      select,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.topic.findMany({
      where: { status: PUBLISHED },
      select,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.businessDomain.findMany({
      where: { status: PUBLISHED },
      select,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { status: PUBLISHED },
      select,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return [
    ...staticEntries,
    ...withPrefix("roadmaps", roadmaps, "weekly", 0.8),
    ...withPrefix("topics", topics, "monthly", 0.6),
    ...withPrefix("business-domains", domains, "monthly", 0.7),
    ...withPrefix("projects", projects, "monthly", 0.7),
  ];
}
