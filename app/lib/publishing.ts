import { isValidSlug } from "~/lib/slug";

/**
 * Business rules that gate the transition from DRAFT/ARCHIVED to PUBLISHED.
 * These run after Zod validation and before the Prisma write, so the database
 * never receives content that would render as an empty or broken public page.
 */
export const PUBLISHED = "PUBLISHED" as const;

export interface PublishingIssue {
  field: string;
  message: string;
}

/** Prisma `where` fragment for queries that must only see public content. */
export function publishedFilter(): { status: typeof PUBLISHED } {
  return { status: PUBLISHED };
}

export function isPublishable(issues: PublishingIssue[]): boolean {
  return issues.length === 0;
}

interface PublishableBase {
  slug: string;
  title: string;
  summary?: string | null;
}

function baseIssues(entity: PublishableBase): PublishingIssue[] {
  const issues: PublishingIssue[] = [];
  if (!entity.slug || !isValidSlug(entity.slug)) {
    issues.push({ field: "slug", message: "A valid slug is required." });
  }
  if (!entity.title || entity.title.trim().length < 3) {
    issues.push({ field: "title", message: "A title is required." });
  }
  if (
    entity.summary !== undefined &&
    (entity.summary ?? "").trim().length < 10
  ) {
    issues.push({
      field: "summary",
      message: "Add a summary of at least 10 characters.",
    });
  }
  return issues;
}

export function roadmapPublishIssues(
  entity: PublishableBase & {
    nodeCount: number;
  },
): PublishingIssue[] {
  const issues = baseIssues(entity);
  if (entity.nodeCount < 1) {
    issues.push({
      field: "nodes",
      message: "Add at least one node before publishing.",
    });
  }
  return issues;
}

export function topicPublishIssues(
  entity: PublishableBase & {
    blockCount: number;
  },
): PublishingIssue[] {
  const issues = baseIssues(entity);
  if (entity.blockCount < 1) {
    issues.push({
      field: "blocks",
      message: "Add at least one content block before publishing.",
    });
  }
  return issues;
}

export function domainPublishIssues(
  entity: PublishableBase & {
    pointCount: number;
  },
): PublishingIssue[] {
  const issues = baseIssues(entity);
  if (entity.pointCount < 3) {
    issues.push({
      field: "points",
      message: "Add at least three domain points before publishing.",
    });
  }
  return issues;
}

export function projectPublishIssues(
  entity: PublishableBase & {
    scenario?: string | null;
    milestoneCount: number;
  },
): PublishingIssue[] {
  const issues = baseIssues(entity);
  if ((entity.scenario ?? "").trim().length < 20) {
    issues.push({
      field: "scenario",
      message: "Add a scenario description before publishing.",
    });
  }
  if (entity.milestoneCount < 1) {
    issues.push({
      field: "milestones",
      message: "Add at least one milestone before publishing.",
    });
  }
  return issues;
}

export function resourcePublishIssues(entity: {
  url: string;
  title: string;
}): PublishingIssue[] {
  const issues: PublishingIssue[] = [];
  if (!entity.title || entity.title.trim().length < 3) {
    issues.push({ field: "title", message: "A title is required." });
  }
  if (!/^https?:\/\//.test(entity.url ?? "")) {
    issues.push({ field: "url", message: "A valid URL is required." });
  }
  return issues;
}

export class PublishingError extends Error {
  readonly issues: PublishingIssue[];

  constructor(issues: PublishingIssue[]) {
    super("Content cannot be published yet.");
    this.name = "PublishingError";
    this.issues = issues;
  }
}

export function assertPublishable(issues: PublishingIssue[]): void {
  if (!isPublishable(issues)) {
    throw new PublishingError(issues);
  }
}
