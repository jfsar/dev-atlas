import { z } from "zod";

/**
 * Canonical enum value lists. These mirror the Prisma enums in
 * `prisma/schema.prisma` but are declared locally so that validation modules
 * stay usable on the client without importing the generated Prisma client.
 */
export const publicationStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const userRoles = ["USER", "ADMIN"] as const;

export const edgeRelationships = [
  "PREREQUISITE",
  "RECOMMENDED",
  "OPTIONAL",
  "RELATED",
] as const;

export const difficulties = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

export const blockTypes = [
  "MARKDOWN",
  "CODE",
  "CALLOUT",
  "CHECKLIST",
  "TABLE",
  "RESOURCE_LIST",
  "FAQ",
] as const;

export const contentPointKinds = [
  "OBJECTIVE",
  "ACTOR",
  "ENTITY",
  "PROCESS_STEP",
  "STATE",
  "RULE",
  "CONTROL",
  "KPI",
  "SOFTWARE_IMPLICATION",
] as const;

export const resourceKinds = [
  "ARTICLE",
  "VIDEO",
  "COURSE",
  "DOCS",
  "TOOL",
  "BOOK",
  "OTHER",
] as const;

export const publicationStatusSchema = z.enum(publicationStatuses);
export const difficultySchema = z.enum(difficulties);
export const edgeRelationshipSchema = z.enum(edgeRelationships);
export const blockTypeSchema = z.enum(blockTypes);
export const contentPointKindSchema = z.enum(contentPointKinds);
export const resourceKindSchema = z.enum(resourceKinds);

/** Slugs are lowercase, hyphen-delimited, and stable once referenced. */
export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters.")
  .max(120, "Slug must be at most 120 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens.",
  );

export const idSchema = z
  .string()
  .trim()
  .min(1, "A record id is required.")
  .max(64, "That id is too long.");

export const titleSchema = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters.")
  .max(160, "Title must be at most 160 characters.");

export const summarySchema = z
  .string()
  .trim()
  .min(10, "Summary must be at least 10 characters.")
  .max(400, "Summary must be at most 400 characters.");

export const shortTextSchema = z.string().trim().min(1).max(280);

export const urlSchema = z
  .string()
  .trim()
  .max(2048, "URL is too long.")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http(s) URL.");

export const optionalUrlSchema = z
  .union([urlSchema, z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const orderSchema = z
  .number()
  .int("Position must be a whole number.")
  .min(0, "Position cannot be negative.")
  .max(10_000, "Position is out of range.");

export const estimatedMinutesSchema = z
  .number()
  .int()
  .min(1)
  .max(60_000)
  .optional();

export const estimatedHoursSchema = z
  .number()
  .int()
  .min(1)
  .max(10_000)
  .optional();

export const emojiSchema = z.string().trim().max(8).optional();

export const tagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(20, "Keep it to 20 tags or fewer.")
  .default([]);

/** Shared SEO columns present on every public entity. */
export const seoSchema = z.object({
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(200).optional(),
  seoImage: optionalUrlSchema,
});

/** Empty strings from HTML forms should be treated as absent. */
export function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

/** De-duplicates a list of strings while preserving first-seen order. */
export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export type SeoInput = z.infer<typeof seoSchema>;
export type PublicationStatus = (typeof publicationStatuses)[number];
