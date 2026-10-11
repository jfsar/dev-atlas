import type { ProjectInput } from "~/lib/validation/project";
import { projectInputSchema } from "~/lib/validation/project";
import {
  formNumber,
  formOptionalText,
  formText,
  formTextArray,
  zodFieldErrors,
} from "~/lib/services/admin/shared";

export interface MilestoneFormValue {
  id?: string;
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

/** Coerces an untrusted value into a milestone form value. */
export function normalizeProjectMilestone(
  raw: unknown,
  order = 0,
): MilestoneFormValue & { order: number } {
  const value = asRecord(raw);
  const id =
    typeof value.id === "string" && value.id.trim() !== ""
      ? value.id
      : undefined;
  return {
    ...(id ? { id } : {}),
    title: asString(value.title),
    body: asString(value.body),
    order,
  };
}

/** Normalizes a list and drops milestones missing a title. */
export function normalizeProjectMilestones(
  raw: unknown,
): (MilestoneFormValue & { order: number })[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry, index) => normalizeProjectMilestone(entry, index))
    .filter((milestone) => milestone.title.trim() !== "");
}

/** Rebuilds milestone editor state from an echoed form value after an error. */
export function milestonesFromFormValue(
  value: unknown,
  fallback: MilestoneFormValue[],
): MilestoneFormValue[] {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((entry, index) =>
      normalizeProjectMilestone(entry, index),
    );
  } catch {
    return fallback;
  }
}

export type ProjectParseResult =
  | { success: true; data: ProjectInput }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseProjectForm(form: FormData): ProjectParseResult {
  let milestonesRaw: unknown = [];
  const milestonesText = formText(form, "milestones");
  if (milestonesText.trim() !== "") {
    try {
      milestonesRaw = JSON.parse(milestonesText);
    } catch {
      return {
        success: false,
        fieldErrors: { milestones: ["Milestones could not be read."] },
      };
    }
  }

  const difficulty = formText(form, "difficulty");
  const parsed = projectInputSchema.safeParse({
    slug: formText(form, "slug"),
    title: formText(form, "title"),
    summary: formText(form, "summary"),
    scenario: formText(form, "scenario"),
    difficulty:
      difficulty === "" || difficulty === "NONE" ? undefined : difficulty,
    estimatedHours: formNumber(form, "estimatedHours"),
    learningGoals: formOptionalText(form, "learningGoals"),
    requirements: formOptionalText(form, "requirements"),
    features: formOptionalText(form, "features"),
    architectureNotes: formOptionalText(form, "architectureNotes"),
    databaseNotes: formOptionalText(form, "databaseNotes"),
    apiNotes: formOptionalText(form, "apiNotes"),
    testingNotes: formOptionalText(form, "testingNotes"),
    categorySlugs: formTextArray(form, "categorySlugs"),
    topicSlugs: formTextArray(form, "topicSlugs"),
    domainSlugs: formTextArray(form, "domainSlugs"),
    resourceIds: formTextArray(form, "resourceIds"),
    milestones: normalizeProjectMilestones(milestonesRaw),
    seoTitle: formOptionalText(form, "seoTitle"),
    seoDescription: formOptionalText(form, "seoDescription"),
    seoImage: formOptionalText(form, "seoImage"),
  });
  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error);
    const milestoneErrors: string[] = [];
    for (const key of Object.keys(fieldErrors)) {
      if (key === "milestones" || key.startsWith("milestones.")) {
        milestoneErrors.push(...fieldErrors[key]);
        delete fieldErrors[key];
      }
    }
    if (milestoneErrors.length > 0) {
      fieldErrors.milestones = milestoneErrors;
    }
    return { success: false, fieldErrors };
  }
  return { success: true, data: parsed.data };
}
