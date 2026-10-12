import type { Difficulty } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";

export interface RoadmapCategoryRef {
  slug: string;
  name: string;
}

export interface RoadmapCardData {
  slug: string;
  title: string;
  summary: string;
  icon: string | null;
  difficulty: Difficulty | null;
  estimatedHours: number | null;
  featured: boolean;
  nodeCount: number;
  categories: RoadmapCategoryRef[];
}

export interface RoadmapCategoryCount extends RoadmapCategoryRef {
  count: number;
}

const cardSelect = {
  slug: true,
  title: true,
  summary: true,
  icon: true,
  difficulty: true,
  estimatedHours: true,
  featured: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  _count: { select: { nodes: true } },
} as const;

type CardRow = {
  slug: string;
  title: string;
  summary: string;
  icon: string | null;
  difficulty: Difficulty | null;
  estimatedHours: number | null;
  featured: boolean;
  categories: { category: RoadmapCategoryRef }[];
  _count: { nodes: number };
};

function toCard(row: CardRow): RoadmapCardData {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    icon: row.icon,
    difficulty: row.difficulty,
    estimatedHours: row.estimatedHours,
    featured: row.featured,
    nodeCount: row._count.nodes,
    categories: row.categories.map((entry) => entry.category),
  };
}

/** Published roadmaps for the directory, optionally filtered by category. */
export async function listPublishedRoadmaps(options?: {
  categorySlug?: string;
}): Promise<RoadmapCardData[]> {
  const rows = await prisma.roadmap.findMany({
    where: {
      status: PUBLISHED,
      ...(options?.categorySlug
        ? { categories: { some: { category: { slug: options.categorySlug } } } }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { title: "asc" }],
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getFeaturedRoadmaps(
  limit = 6,
): Promise<RoadmapCardData[]> {
  const rows = await prisma.roadmap.findMany({
    where: { status: PUBLISHED, featured: true },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

/** Categories that still have at least one published roadmap. */
export async function listRoadmapCategories(): Promise<RoadmapCategoryCount[]> {
  const rows = await prisma.category.findMany({
    where: { roadmaps: { some: { roadmap: { status: PUBLISHED } } } },
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          roadmaps: { where: { roadmap: { status: PUBLISHED } } },
        },
      },
    },
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    count: row._count.roadmaps,
  }));
}

const detailSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  description: true,
  audience: true,
  prerequisiteNotes: true,
  difficulty: true,
  estimatedHours: true,
  icon: true,
  seoTitle: true,
  seoDescription: true,
  seoImage: true,
  publishedAt: true,
  updatedAt: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  sections: {
    orderBy: { order: "asc" },
    select: { id: true, title: true, color: true, order: true },
  },
  nodes: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      summary: true,
      x: true,
      y: true,
      width: true,
      height: true,
      required: true,
      order: true,
      difficulty: true,
      estimatedMinutes: true,
      sectionId: true,
      topic: {
        select: { slug: true, title: true, summary: true, status: true },
      },
    },
  },
  edges: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      sourceId: true,
      targetId: true,
      relationship: true,
    },
  },
  relatedTopics: {
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: { slug: true, title: true, summary: true, difficulty: true },
  },
} as const;

export type RoadmapDetail = NonNullable<
  Awaited<ReturnType<typeof getPublishedRoadmapBySlug>>
>;

export interface RelatedRoadmapContent {
  topics: {
    slug: string;
    title: string;
    summary: string;
    difficulty: Difficulty | null;
  }[];
  projects: {
    slug: string;
    title: string;
    summary: string;
    difficulty: Difficulty | null;
    estimatedHours: number | null;
  }[];
  domains: { slug: string; title: string; summary: string }[];
}

/**
 * Full published roadmap by slug with graph, sections, and related content
 * derived from the topics its nodes link to.
 */
export async function getPublishedRoadmapBySlug(slug: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: { slug, status: PUBLISHED },
    select: detailSelect,
  });
  if (!roadmap) return null;

  const sourceNodes = roadmap.nodes.map((node) => ({
    ...node,
    topic:
      node.topic && node.topic.status === PUBLISHED
        ? {
            slug: node.topic.slug,
            title: node.topic.title,
            summary: node.topic.summary,
          }
        : null,
  }));

  const topicIds = [
    ...new Set(
      sourceNodes
        .map((node) => node.topic?.slug)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  const related: RelatedRoadmapContent = {
    topics: roadmap.relatedTopics,
    projects: [],
    domains: [],
  };

  if (topicIds.length > 0) {
    const [projects, domains] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: PUBLISHED,
          topics: { some: { slug: { in: topicIds } } },
        },
        orderBy: { title: "asc" },
        take: 6,
        select: {
          slug: true,
          title: true,
          summary: true,
          difficulty: true,
          estimatedHours: true,
        },
      }),
      prisma.businessDomain.findMany({
        where: {
          status: PUBLISHED,
          topics: { some: { slug: { in: topicIds } } },
        },
        orderBy: { title: "asc" },
        take: 6,
        select: { slug: true, title: true, summary: true },
      }),
    ]);
    related.projects = projects;
    related.domains = domains;
  }

  const { relatedTopics: _relatedTopics, ...roadmapRest } = roadmap;

  return {
    ...roadmapRest,
    nodes: sourceNodes,
    categories: roadmap.categories.map((entry) => entry.category),
    related,
  };
}
