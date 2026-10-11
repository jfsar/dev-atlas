import type { TopicInput } from "~/lib/validation/topic";
import {
  formNumber,
  formOptionalText,
  formText,
  formTextArray,
  zodFieldErrors,
} from "~/lib/services/admin/shared";
import { normalizeTopicBlocks } from "~/lib/services/admin/topic-utils";
import { topicInputSchema } from "~/lib/validation/topic";

export type TopicParseResult =
  | { success: true; data: TopicInput }
  | { success: false; fieldErrors: Record<string, string[]> };

export function parseTopicForm(form: FormData): TopicParseResult {
  let blocksRaw: unknown = [];
  const blocksText = formText(form, "blocks");
  if (blocksText.trim() !== "") {
    try {
      blocksRaw = JSON.parse(blocksText);
    } catch {
      return {
        success: false,
        fieldErrors: { blocks: ["Blocks could not be read."] },
      };
    }
  }

  const difficulty = formText(form, "difficulty");
  const parsed = topicInputSchema.safeParse({
    slug: formText(form, "slug"),
    title: formText(form, "title"),
    summary: formText(form, "summary"),
    difficulty:
      difficulty === "" || difficulty === "NONE" ? undefined : difficulty,
    estimatedMinutes: formNumber(form, "estimatedMinutes"),
    categorySlugs: formTextArray(form, "categorySlugs"),
    relatedSlugs: formTextArray(form, "relatedSlugs"),
    resourceIds: formTextArray(form, "resourceIds"),
    blocks: normalizeTopicBlocks(blocksRaw),
    seoTitle: formOptionalText(form, "seoTitle"),
    seoDescription: formOptionalText(form, "seoDescription"),
    seoImage: formOptionalText(form, "seoImage"),
  });
  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error);
    const blockErrors: string[] = [];
    for (const key of Object.keys(fieldErrors)) {
      if (key === "blocks" || key.startsWith("blocks.")) {
        blockErrors.push(...fieldErrors[key]);
        delete fieldErrors[key];
      }
    }
    if (blockErrors.length > 0) {
      fieldErrors.blocks = blockErrors;
    }
    return { success: false, fieldErrors };
  }
  return { success: true, data: parsed.data };
}
