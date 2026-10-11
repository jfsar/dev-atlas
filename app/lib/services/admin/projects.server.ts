import type {
  Difficulty,
  Prisma,
  PublicationStatus,
} from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";
import { projectPublishIssues, type PublishingIssue } from "~/lib/publishing";
import {
  categoryConnectPayload,
  isUniqueConstraintError,
  paginationMeta,
  statusTimestampPatch,
  type AdminListParams,
  type PaginationMeta,
} from "~/lib/services/admin/shared";
import type { ProjectInput } from "~/lib/validation/project";

export interface AdminProjectRow {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  difficulty: Difficulty | null;
  updatedAt: Date;
  milestoneCount: number;
  categories: { slug: string; name: string }[];
}

export interface AdminProjectList {
  rows: AdminProjectRow[];
  meta: PaginationMeta;
}

export async function listAdminProjects(
  params: AdminListParams,
): Promise<AdminProjectList> {
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
    prisma.project.count({ where }),
    prisma.project.findMany({
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
        _count: { select: { milestones: true } },
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
      milestoneCount: row._count.milestones,
      categories: row.categories.map((entry) => entry.category),
    })),
    meta: paginationMeta(total, params.page, params.pageSize),
  };
}

export interface AdminProjectDetail extends ProjectInput {
  id: string;
  status: PublicationStatus;
  milestoneCount: number;
  categorySlugs: string[];
  topicSlugs: string[];
  domainSlugs: string[];
  resourceIds: string[];
}

export async function getAdminProject(
  id: string,
): Promise<AdminProjectDetail | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    select: {
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
      status: true,
      seoTitle: true,
      seoDescription: true,
      seoImage: true,
      categories: { select: { category: { select: { slug: true } } } },
      topics: { select: { slug: true } },
      domains: { select: { slug: true } },
      resources: { orderBy: { order: "asc" }, select: { resourceId: true } },
      milestones: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, body: true, order: true },
      },
      _count: { select: { milestones: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    scenario: row.scenario,
    difficulty: row.difficulty ?? undefined,
    estimatedHours: row.estimatedHours ?? undefined,
    learningGoals: row.learningGoals ?? undefined,
    requirements: row.requirements ?? undefined,
    features: row.features ?? undefined,
    architectureNotes: row.architectureNotes ?? undefined,
    databaseNotes: row.databaseNotes ?? undefined,
    apiNotes: row.apiNotes ?? undefined,
    testingNotes: row.testingNotes ?? undefined,
    status: row.status,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    seoImage: row.seoImage ?? undefined,
    categorySlugs: row.categories.map((entry) => entry.category.slug),
    topicSlugs: row.topics.map((entry) => entry.slug),
    domainSlugs: row.domains.map((entry) => entry.slug),
    resourceIds: row.resources.map((entry) => entry.resourceId),
    milestones: row.milestones.map((milestone, index) => ({
      id: milestone.id,
      title: milestone.title,
      body: milestone.body ?? undefined,
      order: index,
    })),
    milestoneCount: row._count.milestones,
  };
}

export type ProjectWriteResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

function projectScalars(input: ProjectInput) {
  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    scenario: input.scenario,
    difficulty: input.difficulty ?? null,
    estimatedHours: input.estimatedHours ?? null,
    learningGoals: input.learningGoals ?? null,
    requirements: input.requirements ?? null,
    features: input.features ?? null,
    architectureNotes: input.architectureNotes ?? null,
    databaseNotes: input.databaseNotes ?? null,
    apiNotes: input.apiNotes ?? null,
    testingNotes: input.testingNotes ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    seoImage: input.seoImage ?? null,
  };
}

function milestoneCreateData(
  projectId: string,
  milestones: ProjectInput["milestones"],
) {
  return milestones.map((milestone, index) => ({
    projectId,
    title: milestone.title,
    body: milestone.body ?? null,
    order: index,
  }));
}

function resourceCreateData(projectId: string, resourceIds: string[]) {
  return resourceIds.map((resourceId, index) => ({
    projectId,
    resourceId,
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

async function resolveDomainIds(
  db: Prisma.TransactionClient,
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = await db.businessDomain.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((value): value is string => Boolean(value));
}

export async function createProject(
  input: ProjectInput,
): Promise<ProjectWriteResult> {
  try {
    const id = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...projectScalars(input),
          categories: { create: categoryConnectPayload(input.categorySlugs) },
        },
        select: { id: true },
      });

      if (input.milestones.length > 0) {
        await tx.projectMilestone.createMany({
          data: milestoneCreateData(project.id, input.milestones),
        });
      }
      if (input.resourceIds.length > 0) {
        await tx.projectResource.createMany({
          data: resourceCreateData(project.id, input.resourceIds),
        });
      }

      const topicIds = await resolveTopicIds(tx, input.topicSlugs);
      const domainIds = await resolveDomainIds(tx, input.domainSlugs);
      if (topicIds.length > 0 || domainIds.length > 0) {
        await tx.project.update({
          where: { id: project.id },
          data: {
            topics: { connect: topicIds.map((rid) => ({ id: rid })) },
            domains: { connect: domainIds.map((rid) => ({ id: rid })) },
          },
        });
      }

      return project.id;
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

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<ProjectWriteResult> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          ...projectScalars(input),
          categories: {
            deleteMany: {},
            create: categoryConnectPayload(input.categorySlugs),
          },
        },
      });

      await tx.projectMilestone.deleteMany({ where: { projectId: id } });
      if (input.milestones.length > 0) {
        await tx.projectMilestone.createMany({
          data: milestoneCreateData(id, input.milestones),
        });
      }

      await tx.projectResource.deleteMany({ where: { projectId: id } });
      if (input.resourceIds.length > 0) {
        await tx.projectResource.createMany({
          data: resourceCreateData(id, input.resourceIds),
        });
      }

      const topicIds = await resolveTopicIds(tx, input.topicSlugs);
      const domainIds = await resolveDomainIds(tx, input.domainSlugs);
      await tx.project.update({
        where: { id },
        data: {
          topics: { set: topicIds.map((rid) => ({ id: rid })) },
          domains: { set: domainIds.map((rid) => ({ id: rid })) },
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

export async function setProjectStatus(
  id: string,
  status: PublicationStatus,
): Promise<{ ok: true } | { ok: false; issues: PublishingIssue[] }> {
  const existing = await prisma.project.findUnique({
    where: { id },
    select: {
      slug: true,
      title: true,
      summary: true,
      scenario: true,
      publishedAt: true,
      _count: { select: { milestones: true } },
    },
  });
  if (!existing) {
    return {
      ok: false,
      issues: [{ field: "_form", message: "Project not found." }],
    };
  }

  if (status === "PUBLISHED") {
    const issues = projectPublishIssues({
      slug: existing.slug,
      title: existing.title,
      summary: existing.summary,
      scenario: existing.scenario,
      milestoneCount: existing._count.milestones,
    });
    if (issues.length > 0) return { ok: false, issues };
  }

  await prisma.project.update({
    where: { id },
    data: statusTimestampPatch(status, existing),
  });
  return { ok: true };
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.project.delete({ where: { id } });
}

/** Options for the project picker (e.g. business-domain relations). */
export async function listProjectOptions(): Promise<
  { slug: string; title: string }[]
> {
  return prisma.project.findMany({
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });
}
