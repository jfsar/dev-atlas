import { z } from "zod";

import {
  difficultySchema,
  estimatedMinutesSchema,
  idSchema,
  orderSchema,
  seoSchema,
  slugSchema,
  summarySchema,
  titleSchema,
  uniqueStrings,
  urlSchema,
} from "./common";

const markdownText = z
  .string()
  .trim()
  .min(1, "This block needs content.")
  .max(60_000);

const blockBase = {
  id: idSchema.optional(),
  title: z.string().trim().max(160).optional(),
  order: orderSchema.default(0),
};

export const markdownBlockSchema = z.object({
  type: z.literal("MARKDOWN"),
  ...blockBase,
  body: markdownText,
});

export const codeBlockSchema = z.object({
  type: z.literal("CODE"),
  ...blockBase,
  body: markdownText,
  language: z.string().trim().max(40).optional(),
});

export const calloutBlockSchema = z.object({
  type: z.literal("CALLOUT"),
  ...blockBase,
  body: markdownText,
  data: z
    .object({
      variant: z.enum(["info", "warning", "success", "danger"]).default("info"),
    })
    .default({ variant: "info" }),
});

export const checklistBlockSchema = z.object({
  type: z.literal("CHECKLIST"),
  ...blockBase,
  data: z.object({
    items: z
      .array(z.object({ text: z.string().trim().min(1).max(280) }))
      .min(1, "Add at least one checklist item.")
      .max(50),
  }),
});

export const faqBlockSchema = z.object({
  type: z.literal("FAQ"),
  ...blockBase,
  data: z.object({
    items: z
      .array(
        z.object({
          question: z.string().trim().min(1).max(280),
          answer: markdownText,
        }),
      )
      .min(1, "Add at least one question.")
      .max(50),
  }),
});

export const tableBlockSchema = z
  .object({
    type: z.literal("TABLE"),
    ...blockBase,
    data: z.object({
      headers: z.array(z.string().trim().min(1).max(80)).min(1).max(10),
      rows: z
        .array(z.array(z.string().trim().max(500)))
        .min(1)
        .max(100),
    }),
  })
  .superRefine((block, ctx) => {
    block.data.rows.forEach((row, index) => {
      if (row.length !== block.data.headers.length) {
        ctx.addIssue({
          code: "custom",
          message:
            "Each row must have the same number of cells as the headers.",
          path: ["data", "rows", index],
        });
      }
    });
  });

export const resourceListBlockSchema = z.object({
  type: z.literal("RESOURCE_LIST"),
  ...blockBase,
  data: z.object({
    items: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(200),
          url: urlSchema,
        }),
      )
      .min(1, "Add at least one resource.")
      .max(50),
  }),
});

export const topicBlockSchema = z.discriminatedUnion("type", [
  markdownBlockSchema,
  codeBlockSchema,
  calloutBlockSchema,
  checklistBlockSchema,
  faqBlockSchema,
  tableBlockSchema,
  resourceListBlockSchema,
]);

export const createTopicContentBlockSchema = topicBlockSchema.and(
  z.object({ topicId: idSchema }),
);

export const updateTopicContentBlockSchema = z.object({
  ...blockBase,
  id: idSchema,
  body: markdownText.optional(),
  language: z.string().trim().max(40).optional(),
  data: z.unknown().optional(),
});

export const topicInputSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  summary: summarySchema,
  difficulty: difficultySchema.optional(),
  estimatedMinutes: estimatedMinutesSchema,
  categorySlugs: z.array(slugSchema).max(10).default([]).transform(uniqueStrings),
  relatedSlugs: z.array(slugSchema).max(20).default([]).transform(uniqueStrings),
  resourceIds: z.array(idSchema).max(50).default([]).transform(uniqueStrings),
  blocks: z.array(topicBlockSchema).max(100).default([]),
  ...seoSchema.shape,
});

export const createTopicSchema = topicInputSchema;

export const updateTopicSchema = topicInputSchema
  .partial()
  .extend({ id: idSchema });

export const topicResourceLinkSchema = z.object({
  topicId: idSchema,
  resourceId: idSchema,
  order: orderSchema.default(0),
  note: z.string().trim().max(280).optional(),
});

export type TopicBlockInput = z.infer<typeof topicBlockSchema>;
export type TopicInput = z.infer<typeof topicInputSchema>;
