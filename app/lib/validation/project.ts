import { z } from "zod";

import {
  difficultySchema,
  estimatedHoursSchema,
  idSchema,
  orderSchema,
  seoSchema,
  slugSchema,
  summarySchema,
  titleSchema,
  uniqueStrings,
} from "./common";

export const projectMilestoneInputSchema = z.object({
  id: idSchema.optional(),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().max(10_000).optional(),
  order: orderSchema.default(0),
});

export const projectInputSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  summary: summarySchema,
  scenario: z
    .string()
    .trim()
    .min(20, "Describe the scenario in at least 20 characters.")
    .max(20_000),
  difficulty: difficultySchema.optional(),
  estimatedHours: estimatedHoursSchema,
  learningGoals: z.string().trim().max(10_000).optional(),
  requirements: z.string().trim().max(10_000).optional(),
  features: z.string().trim().max(20_000).optional(),
  architectureNotes: z.string().trim().max(20_000).optional(),
  databaseNotes: z.string().trim().max(20_000).optional(),
  apiNotes: z.string().trim().max(20_000).optional(),
  testingNotes: z.string().trim().max(20_000).optional(),
  categorySlugs: z.array(slugSchema).max(10).default([]).transform(uniqueStrings),
  topicSlugs: z.array(slugSchema).max(50).default([]).transform(uniqueStrings),
  domainSlugs: z.array(slugSchema).max(50).default([]).transform(uniqueStrings),
  resourceIds: z.array(idSchema).max(50).default([]).transform(uniqueStrings),
  milestones: z.array(projectMilestoneInputSchema).max(40).default([]),
  ...seoSchema.shape,
});

export const createProjectSchema = projectInputSchema;

export const updateProjectSchema = projectInputSchema
  .partial()
  .extend({ id: idSchema });

export const createProjectMilestoneSchema = projectMilestoneInputSchema.and(
  z.object({ projectId: idSchema }),
);

export const updateProjectMilestoneSchema = projectMilestoneInputSchema
  .partial()
  .extend({ id: idSchema });

export type ProjectInput = z.infer<typeof projectInputSchema>;
