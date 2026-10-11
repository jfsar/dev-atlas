import type { PublicationStatus } from "~/generated/prisma/client";
import type { PublishingIssue } from "~/lib/publishing";
import type { ZodError } from "zod";
import { publicationStatuses } from "~/lib/validation/common";

export const ADMIN_PAGE_SIZE = 20;

export interface AdminListParams {
  q: string;
  status: PublicationStatus | null;
  page: number;
  pageSize: number;
}

function isPublicationStatus(value: string): value is PublicationStatus {
  return (publicationStatuses as readonly string[]).includes(value);
}

/** Normalizes the `q` / `status` / `page` query params used by admin lists. */
export function parseAdminListParams(
  request: Request,
  pageSize = ADMIN_PAGE_SIZE,
): AdminListParams {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const rawStatus = url.searchParams.get("status") ?? "";
  const rawPage = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, 9999) : 1;

  return {
    q,
    status: isPublicationStatus(rawStatus) ? rawStatus : null,
    page,
    pageSize,
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export function paginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface AdminActionData {
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  issues?: PublishingIssue[];
  values?: Record<string, string | string[]>;
}

/** Snapshot of submitted form fields, used to repopulate a form on error. */
export function formDataToValues(
  form: FormData,
): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    const existing = values[key];
    if (existing === undefined) values[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else values[key] = [existing, value];
  }
  return values;
}

export function valueOf(
  values: Record<string, string | string[]> | undefined,
  key: string,
  fallback = "",
): string {
  const value = values?.[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function valuesOf(
  values: Record<string, string | string[]> | undefined,
  key: string,
  fallback: string[] = [],
): string[] {
  const value = values?.[key];
  if (value === undefined) return fallback;
  return Array.isArray(value) ? value : [value];
}

/** Flattens a Zod error into `field -> messages` for form rendering. */
export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/** A `where` fragment for an optional status filter. */
export function statusFilter(
  status: PublicationStatus | null,
): { status: PublicationStatus } | Record<string, never> {
  return status ? { status } : {};
}

/** Timestamp columns to persist when moving an entity between statuses. */
export function statusTimestampPatch(
  status: PublicationStatus,
  existing: { publishedAt?: Date | null },
  now = new Date(),
): {
  status: PublicationStatus;
  publishedAt: Date | null;
  archivedAt: Date | null;
} {
  if (status === "PUBLISHED") {
    return {
      status,
      publishedAt: existing.publishedAt ?? now,
      archivedAt: null,
    };
  }
  if (status === "ARCHIVED") {
    return {
      status,
      publishedAt: existing.publishedAt ?? null,
      archivedAt: now,
    };
  }
  return { status, publishedAt: null, archivedAt: null };
}

/** Nested `create` payload that attaches categories by unique slug. */
export function categoryConnectPayload(slugs: string[]) {
  return [...new Set(slugs)].map((slug) => ({
    category: { connect: { slug } },
  }));
}

// --- FormData coercion helpers -------------------------------------------

export function formText(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export function formOptionalText(
  form: FormData,
  key: string,
): string | undefined {
  const value = formText(form, key).trim();
  return value === "" ? undefined : value;
}

export function formNumber(form: FormData, key: string): number | undefined {
  const raw = formText(form, key).trim();
  if (raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export function formBoolean(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function formTextArray(form: FormData, key: string): string[] {
  return form
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value !== "");
}

/** Best-effort Prisma unique-constraint detection without importing the class. */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
