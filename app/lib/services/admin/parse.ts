import type { RoadmapInput } from "~/lib/validation/roadmap";
import type { CategoryInput, ResourceInput } from "~/lib/validation/resource";
import {
  categoryInputSchema,
  resourceInputSchema,
} from "~/lib/validation/resource";
import {
  roadmapInputSchema,
  roadmapSectionsInputSchema,
} from "~/lib/validation/roadmap";
import {
  formBoolean,
  formNumber,
  formOptionalText,
  formText,
  formTextArray,
  zodFieldErrors,
} from "~/lib/services/admin/shared";

export interface RoadmapSectionInput {
  id?: string;
  title: string;
  color?: string;
}

export type RoadmapParseResult =
  | { success: true; data: RoadmapInput }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseRoadmapForm(form: FormData): RoadmapParseResult {
  const difficulty = formText(form, "difficulty");
  const parsed = roadmapInputSchema.safeParse({
    slug: formText(form, "slug"),
    title: formText(form, "title"),
    summary: formText(form, "summary"),
    description: formOptionalText(form, "description"),
    audience: formOptionalText(form, "audience"),
    prerequisiteNotes: formOptionalText(form, "prerequisiteNotes"),
    difficulty:
      difficulty === "" || difficulty === "NONE" ? undefined : difficulty,
    estimatedHours: formNumber(form, "estimatedHours"),
    icon: formOptionalText(form, "icon"),
    featured: formBoolean(form, "featured"),
    order: formNumber(form, "order") ?? 0,
    categorySlugs: formTextArray(form, "categorySlugs"),
    relatedTopicSlugs: formTextArray(form, "relatedTopicSlugs"),
    seoTitle: formOptionalText(form, "seoTitle"),
    seoDescription: formOptionalText(form, "seoDescription"),
    seoImage: formOptionalText(form, "seoImage"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

function sanitizeSections(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    const color = typeof record.color === "string" ? record.color.trim() : "";
    const id = typeof record.id === "string" ? record.id.trim() : "";
    return {
      ...(id ? { id } : {}),
      title: typeof record.title === "string" ? record.title : "",
      ...(color ? { color } : {}),
    };
  });
}

export type RoadmapSectionsParseResult =
  | { success: true; data: RoadmapSectionInput[] }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseRoadmapSectionsForm(
  form: FormData,
  roadmapId: string,
): RoadmapSectionsParseResult {
  let raw: unknown = [];
  const text = formText(form, "sections");
  if (text.trim() !== "") {
    try {
      raw = JSON.parse(text);
    } catch {
      return {
        success: false,
        fieldErrors: { sections: ["Sections could not be read."] },
      };
    }
  }
  const parsed = roadmapSectionsInputSchema.safeParse({
    roadmapId,
    sections: sanitizeSections(raw),
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: {
        sections: parsed.error.issues.map((issue) => issue.message),
      },
    };
  }
  return { success: true, data: parsed.data.sections };
}

export type ResourceParseResult =
  | { success: true; data: ResourceInput }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseResourceForm(form: FormData): ResourceParseResult {
  const parsed = resourceInputSchema.safeParse({
    url: formText(form, "url"),
    title: formText(form, "title"),
    summary: formOptionalText(form, "summary"),
    kind: formText(form, "kind") || "ARTICLE",
    categorySlugs: formTextArray(form, "categorySlugs"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

export type CategoryParseResult =
  | { success: true; data: CategoryInput }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseCategoryForm(form: FormData): CategoryParseResult {
  const parsed = categoryInputSchema.safeParse({
    slug: formText(form, "slug"),
    name: formText(form, "name"),
    description: formOptionalText(form, "description"),
    order: formNumber(form, "order") ?? 0,
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }
  return { success: true, data: parsed.data };
}
