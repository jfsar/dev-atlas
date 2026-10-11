import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";

const topicSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  difficulty: true,
  estimatedMinutes: true,
  seoTitle: true,
  seoDescription: true,
  seoImage: true,
  publishedAt: true,
  updatedAt: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
  blocks: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      language: true,
      data: true,
      order: true,
    },
  },
  resources: {
    where: { resource: { status: PUBLISHED } },
    orderBy: { order: "asc" },
    select: {
      note: true,
      order: true,
      resource: {
        select: {
          id: true,
          url: true,
          title: true,
          summary: true,
          kind: true,
        },
      },
    },
  },
  relatedTopics: {
    where: { status: PUBLISHED },
    select: { slug: true, title: true, summary: true, difficulty: true },
  },
  domains: {
    where: { status: PUBLISHED },
    select: { slug: true, title: true, summary: true },
  },
  projects: {
    where: { status: PUBLISHED },
    select: {
      slug: true,
      title: true,
      summary: true,
      difficulty: true,
      estimatedHours: true,
    },
  },
} as const;

export type TopicDetail = NonNullable<
  Awaited<ReturnType<typeof getPublishedTopicBySlug>>
>;

/** Full published topic with content blocks, resources, and related content. */
export async function getPublishedTopicBySlug(slug: string) {
  const topic = await prisma.topic.findFirst({
    where: { slug, status: PUBLISHED },
    select: topicSelect,
  });
  if (!topic) return null;

  return {
    ...topic,
    categories: topic.categories.map((entry) => entry.category),
    resources: topic.resources.map((entry) => ({
      note: entry.note,
      ...entry.resource,
    })),
  };
}

/** Minimal published topics list (search/directory reuse later). */
export async function listPublishedTopics() {
  return prisma.topic.findMany({
    where: { status: PUBLISHED },
    orderBy: { title: "asc" },
    select: { slug: true, title: true, summary: true },
  });
}
