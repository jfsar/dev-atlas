import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";

export interface CatalogStats {
  roadmaps: number;
  topics: number;
  businessDomains: number;
  projects: number;
  resources: number;
}

/** Counts of published content, used for lightweight home/directory stats. */
export async function getCatalogStats(): Promise<CatalogStats> {
  const [roadmaps, topics, businessDomains, projects, resources] =
    await prisma.$transaction([
      prisma.roadmap.count({ where: { status: PUBLISHED } }),
      prisma.topic.count({ where: { status: PUBLISHED } }),
      prisma.businessDomain.count({ where: { status: PUBLISHED } }),
      prisma.project.count({ where: { status: PUBLISHED } }),
      prisma.resource.count({ where: { status: PUBLISHED } }),
    ]);

  return { roadmaps, topics, businessDomains, projects, resources };
}

export interface AdminContentStat {
  key: "roadmaps" | "topics" | "businessDomains" | "projects" | "resources";
  label: string;
  total: number;
  published: number;
  draft: number;
  archived: number;
}

type StatusCount = { status: string; _count: { _all: number } };

function summarize(counts: StatusCount[]) {
  let total = 0;
  let published = 0;
  let draft = 0;
  let archived = 0;
  for (const row of counts) {
    const count = row._count._all;
    total += count;
    if (row.status === PUBLISHED) published += count;
    else if (row.status === "DRAFT") draft += count;
    else if (row.status === "ARCHIVED") archived += count;
  }
  return { total, published, draft, archived };
}

/** Full (all statuses) content counts for the admin dashboard. */
export async function getAdminContentStats(): Promise<AdminContentStat[]> {
  const [roadmaps, topics, businessDomains, projects, resources] =
    await prisma.$transaction([
      prisma.roadmap.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
      prisma.topic.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
      prisma.businessDomain.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
      prisma.project.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
      prisma.resource.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
    ]);

  return [
    {
      key: "roadmaps",
      label: "Roadmaps",
      ...summarize(roadmaps as StatusCount[]),
    },
    { key: "topics", label: "Topics", ...summarize(topics as StatusCount[]) },
    {
      key: "businessDomains",
      label: "Business domains",
      ...summarize(businessDomains as StatusCount[]),
    },
    {
      key: "projects",
      label: "Projects",
      ...summarize(projects as StatusCount[]),
    },
    {
      key: "resources",
      label: "Resources",
      ...summarize(resources as StatusCount[]),
    },
  ];
}
