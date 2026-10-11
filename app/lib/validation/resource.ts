import { z } from "zod";

import {
  idSchema,
  orderSchema,
  resourceKindSchema,
  slugSchema,
  urlSchema,
} from "./common";

export const resourceInputSchema = z.object({
  url: urlSchema,
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(400).optional(),
  kind: resourceKindSchema.default("ARTICLE"),
  categorySlugs: z.array(slugSchema).max(10).default([]),
});

export const createResourceSchema = resourceInputSchema;

export const updateResourceSchema = resourceInputSchema
  .partial()
  .extend({ id: idSchema });

export const attachResourceSchema = z.object({
  entityId: idSchema,
  resourceId: idSchema,
  order: orderSchema.default(0),
  note: z.string().trim().max(280).optional(),
});

export const categoryInputSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).optional(),
  order: orderSchema.default(0),
});

export const createCategorySchema = categoryInputSchema;

export const updateCategorySchema = categoryInputSchema
  .partial()
  .extend({ id: idSchema });

export type ResourceInput = z.infer<typeof resourceInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
