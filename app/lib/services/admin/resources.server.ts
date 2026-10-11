import type {
  PublicationStatus,
  ResourceKind,
} from "~/generated/prisma/client";
import type { Prisma } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { resourcePublishIssues } from "~/lib/publishing";
import {
  categoryConnectPayload,
  isUniqueConstraintError,
  paginationMeta,
  statusTimestampPatch,
  type AdminListParams,
  type PaginationMeta,
} from "~/lib/services/admin/shared";
import type { ResourceInput } from "~/lib/validation/resource";

export interface AdminResourceRow {
  id: string;
  url: string;
  title: string;
  kind: ResourceKind;
  status: PublicationStatus;
  updatedAt: Date;
  categories: { slug: string; name: string }[];
  usage: number;
}

export interface AdminResourceList {
  rows: AdminResourceRow[];
  meta: PaginationMeta;
}

export async function listAdminResources(
  params: AdminListParams,
): Promise<AdminResourceList> {
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
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: {
        id: true,
        url: true,
        title: true,
        kind: true,
        status: true,
        updatedAt: true,
        categories: {
          select: { category: { select: { slug: true, name: true } } },
        },
        _count: {
          select: { topicLinks: true, projectLinks: true, domains: true },
        },
      },
    }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      url: row.url,
      title: row.title,
      kind: row.kind,
      status: row.status,
      updatedAt: row.updatedAt,
      categories: row.categories.map((entry) => entry.category),
      usage:
        row._count.topicLinks + row._count.projectLinks + row._count.domains,
    })),
    meta: paginationMeta(total, params.page, params.pageSize),
  };
}

export interface AdminResourceDetail {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  kind: ResourceKind;
  status: PublicationStatus;
  categorySlugs: string[];
}

export async function getAdminResource(
  id: string,
): Promise<AdminResourceDetail | null> {
  const row = await prisma.resource.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      title: true,
      summary: true,
      kind: true,
      status: true,
      categories: { select: { category: { select: { slug: true } } } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    summary: row.summary,
    kind: row.kind,
    status: row.status,
    categorySlugs: row.categories.map((entry) => entry.category.slug),
  };
}

export type ResourceWriteResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

export async function createResource(
  input: ResourceInput,
): Promise<ResourceWriteResult> {
  try {
    const resource = await prisma.resource.create({
      data: {
        url: input.url,
        title: input.title,
        summary: input.summary ?? null,
        kind: input.kind,
        categories: { create: categoryConnectPayload(input.categorySlugs) },
      },
      select: { id: true },
    });
    return { ok: true, id: resource.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, fieldErrors: { url: ["That URL already exists."] } };
    }
    throw error;
  }
}

export async function updateResource(
  id: string,
  input: ResourceInput,
): Promise<ResourceWriteResult> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.resource.update({
        where: { id },
        data: {
          url: input.url,
          title: input.title,
          summary: input.summary ?? null,
          kind: input.kind,
        },
      });
      await tx.resourceCategory.deleteMany({ where: { resourceId: id } });
      const categoryIds = await resolveCategoryIds(tx, input.categorySlugs);
      if (categoryIds.length > 0) {
        await tx.resourceCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            resourceId: id,
            categoryId,
          })),
        });
      }
    });
    return { ok: true, id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, fieldErrors: { url: ["That URL already exists."] } };
    }
    throw error;
  }
}

export async function setResourceStatus(
  id: string,
  status: PublicationStatus,
): Promise<
  { ok: true } | { ok: false; issues: { field: string; message: string }[] }
> {
  const existing = await prisma.resource.findUnique({
    where: { id },
    select: { url: true, title: true, publishedAt: true },
  });
  if (!existing)
    return {
      ok: false,
      issues: [{ field: "_form", message: "Resource not found." }],
    };

  if (status === "PUBLISHED") {
    const issues = resourcePublishIssues(existing);
    if (issues.length > 0) return { ok: false, issues };
  }

  await prisma.resource.update({
    where: { id },
    data: statusTimestampPatch(status, existing),
  });
  return { ok: true };
}

export async function deleteResource(id: string): Promise<void> {
  await prisma.resource.delete({ where: { id } });
}

/**
 * Resolves category slugs to ids for the join-table rewrite. Slugs unknown to
 * the database are dropped rather than failing the whole write.
 */
export async function resolveCategoryIds(
  db: Prisma.TransactionClient,
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = await db.category.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((id): id is string => Boolean(id));
}
