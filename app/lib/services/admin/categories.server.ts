import type { CategoryInput } from "~/lib/validation/resource";
import { prisma } from "~/lib/prisma";
import { isUniqueConstraintError } from "~/lib/services/admin/shared";

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  usage: number;
  counts: {
    roadmaps: number;
    topics: number;
    projects: number;
    resources: number;
    domains: number;
  };
}

const categorySelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  order: true,
  _count: {
    select: {
      roadmaps: true,
      topics: true,
      projects: true,
      resources: true,
      domains: true,
    },
  },
} as const;

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  _count: {
    roadmaps: number;
    topics: number;
    projects: number;
    resources: number;
    domains: number;
  };
};

function toRow(row: CategoryRow): AdminCategoryRow {
  const counts = row._count;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    order: row.order,
    counts,
    usage:
      counts.roadmaps +
      counts.topics +
      counts.projects +
      counts.resources +
      counts.domains,
  };
}

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: categorySelect,
  });
  return (rows as CategoryRow[]).map(toRow);
}

/** Lightweight options for the admin pickers. */
export async function listCategoryOptions(): Promise<
  { slug: string; name: string }[]
> {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, name: true },
  });
}

export async function getAdminCategory(
  id: string,
): Promise<AdminCategoryRow | null> {
  const row = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });
  return row ? toRow(row) : null;
}

export type CategoryWriteResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

export async function createCategory(
  input: CategoryInput,
): Promise<CategoryWriteResult> {
  try {
    const category = await prisma.category.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description ?? null,
        order: input.order,
      },
      select: { id: true },
    });
    return { ok: true, id: category.id };
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

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<CategoryWriteResult> {
  try {
    await prisma.category.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description ?? null }
          : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
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

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}
