import type { Prisma, PublicationStatus } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { domainPublishIssues, type PublishingIssue } from "~/lib/publishing";
import {
  categoryConnectPayload,
  isUniqueConstraintError,
  paginationMeta,
  statusTimestampPatch,
  type AdminListParams,
  type PaginationMeta,
} from "~/lib/services/admin/shared";
import type { BusinessDomainInput } from "~/lib/validation/business-domain";

export interface AdminDomainRow {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  updatedAt: Date;
  pointCount: number;
  categories: { slug: string; name: string }[];
}

export interface AdminDomainList {
  rows: AdminDomainRow[];
  meta: PaginationMeta;
}

export async function listAdminDomains(
  params: AdminListParams,
): Promise<AdminDomainList> {
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
    prisma.businessDomain.count({ where }),
    prisma.businessDomain.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
        categories: {
          select: { category: { select: { slug: true, name: true } } },
        },
        _count: { select: { points: true } },
      },
    }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      updatedAt: row.updatedAt,
      pointCount: row._count.points,
      categories: row.categories.map((entry) => entry.category),
    })),
    meta: paginationMeta(total, params.page, params.pageSize),
  };
}

export interface AdminDomainDetail extends BusinessDomainInput {
  id: string;
  status: PublicationStatus;
  pointCount: number;
  categorySlugs: string[];
  topicSlugs: string[];
  resourceIds: string[];
  projectSlugs: string[];
}

export async function getAdminDomain(
  id: string,
): Promise<AdminDomainDetail | null> {
  const row = await prisma.businessDomain.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      definition: true,
      developerRelevance: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
      seoImage: true,
      categories: { select: { category: { select: { slug: true } } } },
      topics: { select: { slug: true } },
      projects: { select: { slug: true } },
      resources: { orderBy: { title: "asc" }, select: { id: true } },
      points: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          kind: true,
          title: true,
          body: true,
          order: true,
        },
      },
      _count: { select: { points: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    definition: row.definition ?? undefined,
    developerRelevance: row.developerRelevance ?? undefined,
    status: row.status,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    seoImage: row.seoImage ?? undefined,
    categorySlugs: row.categories.map((entry) => entry.category.slug),
    topicSlugs: row.topics.map((entry) => entry.slug),
    resourceIds: row.resources.map((entry) => entry.id),
    projectSlugs: row.projects.map((entry) => entry.slug),
    points: row.points.map((point, index) => ({
      id: point.id,
      kind: point.kind,
      title: point.title,
      body: point.body,
      order: index,
    })),
    pointCount: row._count.points,
  };
}

export type DomainWriteResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

function domainScalars(input: BusinessDomainInput) {
  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    definition: input.definition ?? null,
    developerRelevance: input.developerRelevance ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    seoImage: input.seoImage ?? null,
  };
}

function pointCreateData(
  domainId: string,
  points: BusinessDomainInput["points"],
) {
  return points.map((point, index) => ({
    domainId,
    kind: point.kind,
    title: point.title,
    body: point.body,
    order: index,
  }));
}

async function resolveTopicIds(
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

async function resolveProjectIds(
  db: Prisma.TransactionClient,
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = await db.project.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((value): value is string => Boolean(value));
}

export async function createDomain(
  input: BusinessDomainInput,
): Promise<DomainWriteResult> {
  try {
    const id = await prisma.$transaction(async (tx) => {
      const domain = await tx.businessDomain.create({
        data: {
          ...domainScalars(input),
          categories: { create: categoryConnectPayload(input.categorySlugs) },
        },
        select: { id: true },
      });

      if (input.points.length > 0) {
        await tx.businessDomainPoint.createMany({
          data: pointCreateData(domain.id, input.points),
        });
      }

      const topicIds = await resolveTopicIds(tx, input.topicSlugs);
      const projectIds = await resolveProjectIds(tx, input.projectSlugs);
      if (
        topicIds.length > 0 ||
        projectIds.length > 0 ||
        input.resourceIds.length > 0
      ) {
        await tx.businessDomain.update({
          where: { id: domain.id },
          data: {
            topics: { connect: topicIds.map((rid) => ({ id: rid })) },
            projects: { connect: projectIds.map((rid) => ({ id: rid })) },
            resources: {
              connect: input.resourceIds.map((rid) => ({ id: rid })),
            },
          },
        });
      }

      return domain.id;
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

export async function updateDomain(
  id: string,
  input: BusinessDomainInput,
): Promise<DomainWriteResult> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.businessDomain.update({
        where: { id },
        data: {
          ...domainScalars(input),
          categories: {
            deleteMany: {},
            create: categoryConnectPayload(input.categorySlugs),
          },
        },
      });

      await tx.businessDomainPoint.deleteMany({ where: { domainId: id } });
      if (input.points.length > 0) {
        await tx.businessDomainPoint.createMany({
          data: pointCreateData(id, input.points),
        });
      }

      const topicIds = await resolveTopicIds(tx, input.topicSlugs);
      const projectIds = await resolveProjectIds(tx, input.projectSlugs);
      await tx.businessDomain.update({
        where: { id },
        data: {
          topics: { set: topicIds.map((rid) => ({ id: rid })) },
          projects: { set: projectIds.map((rid) => ({ id: rid })) },
          resources: { set: input.resourceIds.map((rid) => ({ id: rid })) },
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

export async function setDomainStatus(
  id: string,
  status: PublicationStatus,
): Promise<{ ok: true } | { ok: false; issues: PublishingIssue[] }> {
  const existing = await prisma.businessDomain.findUnique({
    where: { id },
    select: {
      slug: true,
      title: true,
      summary: true,
      publishedAt: true,
      _count: { select: { points: true } },
    },
  });
  if (!existing) {
    return {
      ok: false,
      issues: [{ field: "_form", message: "Business domain not found." }],
    };
  }

  if (status === "PUBLISHED") {
    const issues = domainPublishIssues({
      slug: existing.slug,
      title: existing.title,
      summary: existing.summary,
      pointCount: existing._count.points,
    });
    if (issues.length > 0) return { ok: false, issues };
  }

  await prisma.businessDomain.update({
    where: { id },
    data: statusTimestampPatch(status, existing),
  });
  return { ok: true };
}

export async function deleteDomain(id: string): Promise<void> {
  await prisma.businessDomain.delete({ where: { id } });
}

/** Options for the domain picker (e.g. project relations). */
export async function listDomainOptions(): Promise<
  { slug: string; title: string }[]
> {
  return prisma.businessDomain.findMany({
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });
}
