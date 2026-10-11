import type { Difficulty } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";

export interface ProjectCategoryRef {
  slug: string;
  name: string;
}

export interface ProjectCardData {
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty | null;
  estimatedHours: number | null;
  milestoneCount: number;
  categories: ProjectCategoryRef[];
}

export interface ProjectCategoryCount extends ProjectCategoryRef {
  count: number;
}

const cardSelect = {
  slug: true,
  title: true,
  summary: true,
  difficulty: true,
  estimatedHours: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  _count: { select: { milestones: true } },
} as const;

export async function listPublishedProjects(options?: {
  categorySlug?: string;
  difficulty?: Difficulty;
}): Promise<ProjectCardData[]> {
  const rows = await prisma.project.findMany({
    where: {
      status: PUBLISHED,
      ...(options?.categorySlug
        ? { categories: { some: { category: { slug: options.categorySlug } } } }
        : {}),
      ...(options?.difficulty ? { difficulty: options.difficulty } : {}),
    },
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
    select: cardSelect,
  });
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    difficulty: row.difficulty,
    estimatedHours: row.estimatedHours,
    milestoneCount: row._count.milestones,
    categories: row.categories.map((entry) => entry.category),
  }));
}

export async function listProjectCategories(): Promise<ProjectCategoryCount[]> {
  const rows = await prisma.category.findMany({
    where: { projects: { some: { project: { status: PUBLISHED } } } },
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          projects: { where: { project: { status: PUBLISHED } } },
        },
      },
    },
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    count: row._count.projects,
  }));
}

const detailSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  scenario: true,
  difficulty: true,
  estimatedHours: true,
  learningGoals: true,
  requirements: true,
  features: true,
  architectureNotes: true,
  databaseNotes: true,
  apiNotes: true,
  testingNotes: true,
  seoTitle: true,
  seoDescription: true,
  seoImage: true,
  publishedAt: true,
  updatedAt: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  milestones: {
    orderBy: { order: "asc" },
    select: { id: true, title: true, body: true, order: true },
  },
  topics: {
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: { slug: true, title: true, summary: true, difficulty: true },
  },
  domains: {
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: { slug: true, title: true, summary: true },
  },
  resources: {
    where: { resource: { status: PUBLISHED } },
    orderBy: { order: "asc" },
    select: {
      note: true,
      order: true,
      resource: {
        select: { id: true, url: true, title: true, summary: true, kind: true },
      },
    },
  },
} as const;

export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getPublishedProjectBySlug>>
>;

/** Full published project brief with milestones and related content. */
export async function getPublishedProjectBySlug(slug: string) {
  const project = await prisma.project.findFirst({
    where: { slug, status: PUBLISHED },
    select: detailSelect,
  });
  if (!project) return null;
  return {
    ...project,
    categories: project.categories.map((entry) => entry.category),
    resources: project.resources.map((entry) => ({
      note: entry.note,
      ...entry.resource,
    })),
  };
}
