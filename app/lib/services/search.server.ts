import {
  formatDifficulty,
  formatHours,
  formatMinutes,
  formatResourceKind,
} from "~/lib/format";
import { prisma } from "~/lib/prisma";
import { PUBLISHED } from "~/lib/publishing";
import {
  SEARCH_TYPE_LABELS,
  SEARCH_TYPES,
  type SearchType,
} from "~/lib/search";

export interface SearchResultItem {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  external?: boolean;
  meta?: string | null;
}

export interface SearchGroup {
  type: SearchType;
  label: string;
  total: number;
  items: SearchResultItem[];
}

export interface SearchResults {
  query: string;
  type: SearchType | null;
  groups: SearchGroup[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PER_TYPE_LIMIT = 6;
const DEFAULT_PAGE_SIZE = 12;
const insensitivity = { mode: "insensitive" as const };

function metaFromParts(parts: (string | null | undefined)[]): string | null {
  const joined = parts.filter(Boolean).join(" · ");
  return joined.length > 0 ? joined : null;
}

interface TypeResults {
  items: SearchResultItem[];
  total: number;
}

/** Runs one content-type search with pagination. */
async function runSearchType(
  type: SearchType,
  query: string,
  skip: number,
  take: number,
): Promise<TypeResults> {
  switch (type) {
    case "roadmap": {
      const where = {
        status: PUBLISHED,
        OR: [
          { title: { contains: query, ...insensitivity } },
          { summary: { contains: query, ...insensitivity } },
        ],
      };
      const [rows, total] = await Promise.all([
        prisma.roadmap.findMany({
          where,
          orderBy: [{ featured: "desc" }, { order: "asc" }],
          skip,
          take,
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            difficulty: true,
            estimatedHours: true,
          },
        }),
        prisma.roadmap.count({ where }),
      ]);
      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          url: `/roadmaps/${row.slug}`,
          meta: metaFromParts([
            formatDifficulty(row.difficulty),
            formatHours(row.estimatedHours),
          ]),
        })),
      };
    }
    case "topic": {
      const where = {
        status: PUBLISHED,
        OR: [
          { title: { contains: query, ...insensitivity } },
          { summary: { contains: query, ...insensitivity } },
        ],
      };
      const [rows, total] = await Promise.all([
        prisma.topic.findMany({
          where,
          orderBy: { title: "asc" },
          skip,
          take,
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            difficulty: true,
            estimatedMinutes: true,
          },
        }),
        prisma.topic.count({ where }),
      ]);
      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          url: `/topics/${row.slug}`,
          meta: metaFromParts([
            formatDifficulty(row.difficulty),
            formatMinutes(row.estimatedMinutes),
          ]),
        })),
      };
    }
    case "domain": {
      const where = {
        status: PUBLISHED,
        OR: [
          { title: { contains: query, ...insensitivity } },
          { summary: { contains: query, ...insensitivity } },
          { definition: { contains: query, ...insensitivity } },
        ],
      };
      const [rows, total] = await Promise.all([
        prisma.businessDomain.findMany({
          where,
          orderBy: { title: "asc" },
          skip,
          take,
          select: { id: true, slug: true, title: true, summary: true },
        }),
        prisma.businessDomain.count({ where }),
      ]);
      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          url: `/business-domains/${row.slug}`,
        })),
      };
    }
    case "project": {
      const where = {
        status: PUBLISHED,
        OR: [
          { title: { contains: query, ...insensitivity } },
          { summary: { contains: query, ...insensitivity } },
          { scenario: { contains: query, ...insensitivity } },
        ],
      };
      const [rows, total] = await Promise.all([
        prisma.project.findMany({
          where,
          orderBy: [{ difficulty: "asc" }, { title: "asc" }],
          skip,
          take,
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            difficulty: true,
            estimatedHours: true,
          },
        }),
        prisma.project.count({ where }),
      ]);
      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          url: `/projects/${row.slug}`,
          meta: metaFromParts([
            formatDifficulty(row.difficulty),
            formatHours(row.estimatedHours),
          ]),
        })),
      };
    }
    case "resource": {
      const where = {
        status: PUBLISHED,
        OR: [
          { title: { contains: query, ...insensitivity } },
          { summary: { contains: query, ...insensitivity } },
        ],
      };
      const [rows, total] = await Promise.all([
        prisma.resource.findMany({
          where,
          orderBy: { title: "asc" },
          skip,
          take,
          select: {
            id: true,
            url: true,
            title: true,
            summary: true,
            kind: true,
          },
        }),
        prisma.resource.count({ where }),
      ]);
      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          url: row.url,
          external: true,
          meta: formatResourceKind(row.kind),
        })),
      };
    }
  }
}

/**
 * Database-backed public search across all content types. With a `type` the
 * result is paginated; without one, results are grouped per type (capped).
 */
export async function searchPublicContent({
  query,
  type = null,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  query: string;
  type?: SearchType | null;
  page?: number;
  pageSize?: number;
}): Promise<SearchResults> {
  const trimmed = query.trim();
  const safePage = Math.max(1, Math.trunc(page) || 1);
  const safePageSize = Math.max(1, Math.trunc(pageSize) || DEFAULT_PAGE_SIZE);

  if (trimmed.length === 0) {
    return {
      query: "",
      type,
      groups: [],
      total: 0,
      page: 1,
      pageSize: safePageSize,
      totalPages: 0,
    };
  }

  if (type) {
    const { items, total } = await runSearchType(
      type,
      trimmed,
      (safePage - 1) * safePageSize,
      safePageSize,
    );
    return {
      query: trimmed,
      type,
      groups: [
        {
          type,
          label: SEARCH_TYPE_LABELS[type],
          total,
          items,
        },
      ],
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize),
    };
  }

  const typeResults = await Promise.all(
    SEARCH_TYPES.map(async (searchType): Promise<SearchGroup> => {
      const { items, total } = await runSearchType(
        searchType,
        trimmed,
        0,
        PER_TYPE_LIMIT,
      );
      return {
        type: searchType,
        label: SEARCH_TYPE_LABELS[searchType],
        total,
        items,
      };
    }),
  );

  const groups = typeResults.filter((group) => group.items.length > 0);
  const total = typeResults.reduce((sum, group) => sum + group.total, 0);

  return {
    query: trimmed,
    type: null,
    groups,
    total,
    page: 1,
    pageSize: safePageSize,
    totalPages: 0,
  };
}
