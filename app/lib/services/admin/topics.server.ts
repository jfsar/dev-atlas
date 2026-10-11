import type {
  Difficulty,
  Prisma,
  PublicationStatus,
} from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { topicPublishIssues, type PublishingIssue } from "~/lib/publishing";
import {
  categoryConnectPayload,
  isUniqueConstraintError,
  paginationMeta,
  statusTimestampPatch,
  type AdminListParams,
  type PaginationMeta,
} from "~/lib/services/admin/shared";
import { normalizeTopicBlock } from "~/lib/services/admin/topic-utils";
import type { TopicBlockInput, TopicInput } from "~/lib/validation/topic";

export interface AdminTopicRow {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  difficulty: Difficulty | null;
  updatedAt: Date;
  blockCount: number;
  categories: { slug: string; name: string }[];
}

export interface AdminTopicList {
  rows: AdminTopicRow[];
  meta: PaginationMeta;
}

export async function listAdminTopics(
  params: AdminListParams,
): Promise<AdminTopicList> {
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" as const } },
            { summary: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.topic.count({ where }),
    prisma.topic.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        difficulty: true,
        updatedAt: true,
        categories: {
          select: { category: { select: { slug: true, name: true } } },
        },
        _count: { select: { blocks: true } },
      },
    }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      difficulty: row.difficulty,
      updatedAt: row.updatedAt,
      blockCount: row._count.blocks,
      categories: row.categories.map((entry) => entry.category),
    })),
    meta: paginationMeta(total, params.page, params.pageSize),
  };
}

export interface AdminTopicDetail extends TopicInput {
  id: string;
  status: PublicationStatus;
  blockCount: number;
  categorySlugs: string[];
  relatedSlugs: string[];
  resourceIds: string[];
  blocks: TopicBlockInput[];
}

export async function getAdminTopic(
  id: string,
): Promise<AdminTopicDetail | null> {
  const row = await prisma.topic.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      difficulty: true,
      estimatedMinutes: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
      seoImage: true,
      categories: { select: { category: { select: { slug: true } } } },
      relatedTopics: { select: { slug: true } },
      resources: {
        orderBy: { order: "asc" },
        select: { resourceId: true },
      },
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
      _count: { select: { blocks: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    difficulty: row.difficulty ?? undefined,
    estimatedMinutes: row.estimatedMinutes ?? undefined,
    status: row.status,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    seoImage: row.seoImage ?? undefined,
    categorySlugs: row.categories.map((entry) => entry.category.slug),
    relatedSlugs: row.relatedTopics.map((entry) => entry.slug),
    resourceIds: row.resources.map((entry) => entry.resourceId),
    blocks: row.blocks.map((block) => normalizeTopicBlock(block, block.order)),
    blockCount: row._count.blocks,
  };
}

export type TopicWriteResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

function topicScalars(input: TopicInput) {
  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    difficulty: input.difficulty ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    seoImage: input.seoImage ?? null,
  };
}

function blockCreateData(topicId: string, blocks: TopicBlockInput[]) {
  return blocks.map((block, index) => ({
    topicId,
    type: block.type,
    title: block.title ?? null,
    body: "body" in block ? block.body : null,
    language: "language" in block ? (block.language ?? null) : null,
    data: "data" in block ? (block.data ?? undefined) : undefined,
    order: index,
  }));
}

async function resolveRelatedIds(
  db: Prisma.TransactionClient,
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = await db.topic.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((value): value is string => Boolean(value));
}

export async function createTopic(
  input: TopicInput,
): Promise<TopicWriteResult> {
  try {
    const id = await prisma.$transaction(async (tx) => {
      const topic = await tx.topic.create({
        data: {
          ...topicScalars(input),
          categories: { create: categoryConnectPayload(input.categorySlugs) },
        },
        select: { id: true },
      });

      if (input.blocks.length > 0) {
        await tx.topicContentBlock.createMany({
          data: blockCreateData(topic.id, input.blocks),
        });
      }
      if (input.resourceIds.length > 0) {
        await tx.topicResource.createMany({
          data: input.resourceIds.map((resourceId, index) => ({
            topicId: topic.id,
            resourceId,
            order: index,
          })),
        });
      }

      const related = await resolveRelatedIds(tx, input.relatedSlugs);
      const relatedIds = related.filter((relatedId) => relatedId !== topic.id);
      if (relatedIds.length > 0) {
        await tx.topic.update({
          where: { id: topic.id },
          data: {
            relatedTopics: { connect: relatedIds.map((rid) => ({ id: rid })) },
          },
        });
      }

      return topic.id;
    });
    return { ok: true, id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        fieldErrors: { slug: ["That slug is already used."] },
      };
    }
    throw error;
  }
}

export async function updateTopic(
  id: string,
  input: TopicInput,
): Promise<TopicWriteResult> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.topic.update({
        where: { id },
        data: {
          ...topicScalars(input),
          categories: {
            deleteMany: {},
            create: categoryConnectPayload(input.categorySlugs),
          },
        },
      });

      await tx.topicContentBlock.deleteMany({ where: { topicId: id } });
      if (input.blocks.length > 0) {
        await tx.topicContentBlock.createMany({
          data: blockCreateData(id, input.blocks),
        });
      }

      await tx.topicResource.deleteMany({ where: { topicId: id } });
      if (input.resourceIds.length > 0) {
        await tx.topicResource.createMany({
          data: input.resourceIds.map((resourceId, index) => ({
            topicId: id,
            resourceId,
            order: index,
          })),
        });
      }

      const relatedIds = (
        await resolveRelatedIds(tx, input.relatedSlugs)
      ).filter((relatedId) => relatedId !== id);
      await tx.topic.update({
        where: { id },
        data: {
          relatedTopics: { set: relatedIds.map((rid) => ({ id: rid })) },
        },
      });
    });
    return { ok: true, id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        fieldErrors: { slug: ["That slug is already used."] },
      };
    }
    throw error;
  }
}

export async function setTopicStatus(
  id: string,
  status: PublicationStatus,
): Promise<{ ok: true } | { ok: false; issues: PublishingIssue[] }> {
  const existing = await prisma.topic.findUnique({
    where: { id },
    select: {
      slug: true,
      title: true,
      summary: true,
      publishedAt: true,
      _count: { select: { blocks: true } },
    },
  });
  if (!existing) {
    return {
      ok: false,
      issues: [{ field: "_form", message: "Topic not found." }],
    };
  }

  if (status === "PUBLISHED") {
    const issues = topicPublishIssues({
      slug: existing.slug,
      title: existing.title,
      summary: existing.summary,
      blockCount: existing._count.blocks,
    });
    if (issues.length > 0) return { ok: false, issues };
  }

  await prisma.topic.update({
    where: { id },
    data: statusTimestampPatch(status, existing),
  });
  return { ok: true };
}

export async function deleteTopic(id: string): Promise<void> {
  await prisma.topic.delete({ where: { id } });
}

/** Options for the topic form's related-topics picker. */
export async function listTopicOptions(): Promise<
  { slug: string; title: string }[]
> {
  return prisma.topic.findMany({
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });
}

/** Options for the topic form's resource picker. */
export async function listResourceOptions(): Promise<
  { id: string; title: string; url: string }[]
> {
  return prisma.resource.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, url: true },
  });
}
