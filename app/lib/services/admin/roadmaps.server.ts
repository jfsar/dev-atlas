import type { Difficulty, PublicationStatus } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { roadmapPublishIssues, type PublishingIssue } from "~/lib/publishing";
import {
  categoryConnectPayload,
  isUniqueConstraintError,
  paginationMeta,
  statusTimestampPatch,
  type AdminListParams,
  type PaginationMeta,
} from "~/lib/services/admin/shared";
import type { RoadmapSectionInput } from "~/lib/services/admin/parse";
import type { RoadmapInput } from "~/lib/validation/roadmap";

export interface AdminRoadmapRow {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  featured: boolean;
  difficulty: Difficulty | null;
  updatedAt: Date;
  nodeCount: number;
  categories: { slug: string; name: string }[];
}

export interface AdminRoadmapList {
  rows: AdminRoadmapRow[];
  meta: PaginationMeta;
}

export async function listAdminRoadmaps(
  params: AdminListParams,
): Promise<AdminRoadmapList> {
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
    prisma.roadmap.count({ where }),
    prisma.roadmap.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        featured: true,
        difficulty: true,
        updatedAt: true,
        categories: {
          select: { category: { select: { slug: true, name: true } } },
        },
        _count: { select: { nodes: true } },
      },
    }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      featured: row.featured,
      difficulty: row.difficulty,
      updatedAt: row.updatedAt,
      nodeCount: row._count.nodes,
      categories: row.categories.map((entry) => entry.category),
    })),
    meta: paginationMeta(total, params.page, params.pageSize),
  };
}

export interface AdminRoadmapSection {
  id: string;
  title: string;
  color: string | null;
}

export interface AdminRoadmapDetail extends RoadmapInput {
  id: string;
  status: PublicationStatus;
  nodeCount: number;
  edgeCount: number;
  categorySlugs: string[];
  relatedTopicSlugs: string[];
  sections: { id: string; title: string; color: string | null }[];
}

export async function getAdminRoadmap(
  id: string,
): Promise<AdminRoadmapDetail | null> {
  const row = await prisma.roadmap.findUnique({
    where: { id },
    select: {
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
      featured: true,
      order: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
      seoImage: true,
      categories: { select: { category: { select: { slug: true } } } },
      relatedTopics: { select: { slug: true } },
      sections: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, color: true },
      },
      _count: { select: { nodes: true, edges: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description ?? undefined,
    audience: row.audience ?? undefined,
    prerequisiteNotes: row.prerequisiteNotes ?? undefined,
    difficulty: row.difficulty ?? undefined,
    estimatedHours: row.estimatedHours ?? undefined,
    icon: row.icon ?? undefined,
    featured: row.featured,
    order: row.order,
    status: row.status,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    seoImage: row.seoImage ?? undefined,
    categorySlugs: row.categories.map((entry) => entry.category.slug),
    relatedTopicSlugs: row.relatedTopics.map((entry) => entry.slug),
    sections: row.sections,
    nodeCount: row._count.nodes,
    edgeCount: row._count.edges,
  };
}

export type RoadmapWriteResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

function roadmapScalars(input: RoadmapInput) {
  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    description: input.description ?? null,
    audience: input.audience ?? null,
    prerequisiteNotes: input.prerequisiteNotes ?? null,
    difficulty: input.difficulty ?? null,
    estimatedHours: input.estimatedHours ?? null,
    icon: input.icon ?? null,
    featured: input.featured,
    order: input.order,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    seoImage: input.seoImage ?? null,
  };
}

export async function createRoadmap(
  input: RoadmapInput,
): Promise<RoadmapWriteResult> {
  try {
    const roadmap = await prisma.roadmap.create({
      data: {
        ...roadmapScalars(input),
        categories: { create: categoryConnectPayload(input.categorySlugs) },
        relatedTopics: {
          connect: input.relatedTopicSlugs.map((slug) => ({ slug })),
        },
      },
      select: { id: true },
    });
    return { ok: true, id: roadmap.id };
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

export async function updateRoadmap(
  id: string,
  input: RoadmapInput,
): Promise<RoadmapWriteResult> {
  try {
    await prisma.roadmap.update({
      where: { id },
      data: {
        ...roadmapScalars(input),
        categories: {
          deleteMany: {},
          create: categoryConnectPayload(input.categorySlugs),
        },
        relatedTopics: {
          set: input.relatedTopicSlugs.map((slug) => ({ slug })),
        },
      },
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

export async function updateRoadmapSections(
  roadmapId: string,
  sections: RoadmapSectionInput[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.roadmapSection.findMany({
      where: { roadmapId },
      select: { id: true },
    });
    const keepIds = new Set(
      sections
        .map((section) => section.id)
        .filter((id): id is string => Boolean(id)),
    );
    const removeIds = existing
      .map((section) => section.id)
      .filter((id) => !keepIds.has(id));
    if (removeIds.length > 0) {
      await tx.roadmapSection.deleteMany({
        where: { id: { in: removeIds }, roadmapId },
      });
    }

    for (const [index, section] of sections.entries()) {
      if (section.id) {
        await tx.roadmapSection.updateMany({
          where: { id: section.id, roadmapId },
          data: {
            title: section.title,
            color: section.color ?? null,
            order: index,
          },
        });
      } else {
        await tx.roadmapSection.create({
          data: {
            roadmapId,
            title: section.title,
            color: section.color ?? null,
            order: index,
          },
        });
      }
    }
  });
}

export async function setRoadmapStatus(
  id: string,
  status: PublicationStatus,
): Promise<{ ok: true } | { ok: false; issues: PublishingIssue[] }> {
  const existing = await prisma.roadmap.findUnique({
    where: { id },
    select: {
      slug: true,
      title: true,
      summary: true,
      publishedAt: true,
      _count: { select: { nodes: true } },
    },
  });
  if (!existing) {
    return {
      ok: false,
      issues: [{ field: "_form", message: "Roadmap not found." }],
    };
  }

  if (status === "PUBLISHED") {
    const issues = roadmapPublishIssues({
      slug: existing.slug,
      title: existing.title,
      summary: existing.summary,
      nodeCount: existing._count.nodes,
    });
    if (issues.length > 0) return { ok: false, issues };
  }

  await prisma.roadmap.update({
    where: { id },
    data: statusTimestampPatch(status, existing),
  });
  return { ok: true };
}

export async function deleteRoadmap(id: string): Promise<void> {
  await prisma.roadmap.delete({ where: { id } });
}
