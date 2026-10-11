import type { ContentPointKind } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";

export interface DomainCategoryRef {
  slug: string;
  name: string;
}

export interface DomainCardData {
  slug: string;
  title: string;
  summary: string;
  pointCount: number;
  categories: DomainCategoryRef[];
}

export interface DomainCategoryCount extends DomainCategoryRef {
  count: number;
}

const cardSelect = {
  slug: true,
  title: true,
  summary: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  _count: { select: { points: true } },
} as const;

export async function listPublishedDomains(options?: {
  categorySlug?: string;
}): Promise<DomainCardData[]> {
  const rows = await prisma.businessDomain.findMany({
    where: {
      status: PUBLISHED,
      ...(options?.categorySlug
        ? { categories: { some: { category: { slug: options.categorySlug } } } }
        : {}),
    },
    orderBy: { title: "asc" },
    select: cardSelect,
  });
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    pointCount: row._count.points,
    categories: row.categories.map((entry) => entry.category),
  }));
}

export async function listDomainCategories(): Promise<DomainCategoryCount[]> {
  const rows = await prisma.category.findMany({
    where: { domains: { some: { domain: { status: PUBLISHED } } } },
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          domains: { where: { domain: { status: PUBLISHED } } },
        },
      },
    },
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    count: row._count.domains,
  }));
}

const detailSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  definition: true,
  developerRelevance: true,
  seoTitle: true,
  seoDescription: true,
  seoImage: true,
  publishedAt: true,
  updatedAt: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  points: {
    orderBy: { order: "asc" },
    select: { id: true, kind: true, title: true, body: true, order: true },
  },
  topics: {
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: { slug: true, title: true, summary: true, difficulty: true },
  },
  projects: {
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      summary: true,
      difficulty: true,
      estimatedHours: true,
    },
  },
  resources: {
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: { id: true, url: true, title: true, summary: true, kind: true },
  },
} as const;

export interface DomainPoint {
  id: string;
  kind: ContentPointKind;
  title: string;
  body: string;
  order: number;
}

export type DomainDetail = NonNullable<
  Awaited<ReturnType<typeof getPublishedDomainBySlug>>
>;

/** Full published business domain with points and related content. */
export async function getPublishedDomainBySlug(slug: string) {
  const domain = await prisma.businessDomain.findFirst({
    where: { slug, status: PUBLISHED },
    select: detailSelect,
  });
  if (!domain) return null;
  return {
    ...domain,
    categories: domain.categories.map((entry) => entry.category),
  };
}
