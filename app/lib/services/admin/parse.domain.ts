import type { BusinessDomainInput } from "~/lib/validation/business-domain";
import { businessDomainInputSchema } from "~/lib/validation/business-domain";
import { contentPointKindSchema } from "~/lib/validation/common";
import {
  formOptionalText,
  formText,
  formTextArray,
  zodFieldErrors,
} from "~/lib/services/admin/shared";

export interface DomainPointFormValue {
  id?: string;
  kind: string;
  title: string;
  body: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Coerces an untrusted value (parsed form JSON or a persisted Prisma row) into a
 * domain point form value. Unknown kinds fall back to OBJECTIVE so a bad payload
 * cannot break the editor.
 */
export function normalizeDomainPoint(
  raw: unknown,
  order = 0,
): DomainPointFormValue & { order: number } {
  const value = asRecord(raw);
  const id =
    typeof value.id === "string" && value.id.trim() !== ""
      ? value.id
      : undefined;
  const kindRaw = asString(value.kind);
  const kind = contentPointKindSchema.safeParse(kindRaw).success
    ? kindRaw
    : "OBJECTIVE";
  return {
    ...(id ? { id } : {}),
    kind,
    title: asString(value.title),
    body: asString(value.body),
    order,
  };
}

/** Normalizes a list and drops points that would fail validation. */
export function normalizeDomainPoints(
  raw: unknown,
): (DomainPointFormValue & { order: number })[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry, index) => normalizeDomainPoint(entry, index))
    .filter((point) => point.title.trim() !== "" && point.body.trim() !== "");
}

/** Rebuilds point editor state from an echoed form value after an error. */
export function domainPointsFromFormValue(
  value: unknown,
  fallback: DomainPointFormValue[],
): DomainPointFormValue[] {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((entry, index) => normalizeDomainPoint(entry, index));
  } catch {
    return fallback;
  }
}

export type DomainParseResult =
  | { success: true; data: BusinessDomainInput }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseDomainForm(form: FormData): DomainParseResult {
  let pointsRaw: unknown = [];
  const pointsText = formText(form, "points");
  if (pointsText.trim() !== "") {
    try {
      pointsRaw = JSON.parse(pointsText);
    } catch {
      return {
        success: false,
        fieldErrors: { points: ["Points could not be read."] },
      };
    }
  }

  const parsed = businessDomainInputSchema.safeParse({
    slug: formText(form, "slug"),
    title: formText(form, "title"),
    summary: formText(form, "summary"),
    definition: formOptionalText(form, "definition"),
    developerRelevance: formOptionalText(form, "developerRelevance"),
    categorySlugs: formTextArray(form, "categorySlugs"),
    topicSlugs: formTextArray(form, "topicSlugs"),
    resourceIds: formTextArray(form, "resourceIds"),
    projectSlugs: formTextArray(form, "projectSlugs"),
    points: normalizeDomainPoints(pointsRaw),
    seoTitle: formOptionalText(form, "seoTitle"),
    seoDescription: formOptionalText(form, "seoDescription"),
    seoImage: formOptionalText(form, "seoImage"),
  });
  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error);
    const pointErrors: string[] = [];
    for (const key of Object.keys(fieldErrors)) {
      if (key === "points" || key.startsWith("points.")) {
        pointErrors.push(...fieldErrors[key]);
        delete fieldErrors[key];
      }
    }
    if (pointErrors.length > 0) {
      fieldErrors.points = pointErrors;
    }
    return { success: false, fieldErrors };
  }
  return { success: true, data: parsed.data };
}
