import { z } from "zod";

import {
  contentPointKindSchema,
  idSchema,
  orderSchema,
  seoSchema,
  slugSchema,
  summarySchema,
  titleSchema,
  uniqueStrings,
} from "./common";

export const domainPointInputSchema = z.object({
  id: idSchema.optional(),
  kind: contentPointKindSchema,
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(10_000),
  order: orderSchema.default(0),
});

export const businessDomainInputSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  summary: summarySchema,
  definition: z.string().trim().max(20_000).optional(),
  developerRelevance: z.string().trim().max(20_000).optional(),
  categorySlugs: z.array(slugSchema).max(10).default([]).transform(uniqueStrings),
  topicSlugs: z.array(slugSchema).max(50).default([]).transform(uniqueStrings),
  resourceIds: z.array(idSchema).max(50).default([]).transform(uniqueStrings),
  projectSlugs: z.array(slugSchema).max(50).default([]).transform(uniqueStrings),
  points: z.array(domainPointInputSchema).max(60).default([]),
  ...seoSchema.shape,
});

export const createBusinessDomainSchema = businessDomainInputSchema;

export const updateBusinessDomainSchema = businessDomainInputSchema
  .partial()
  .extend({ id: idSchema });

export const createDomainPointSchema = domainPointInputSchema.and(
  z.object({ domainId: idSchema }),
);

export const updateDomainPointSchema = domainPointInputSchema
  .partial()
  .extend({ id: idSchema });

export type BusinessDomainInput = z.infer<typeof businessDomainInputSchema>;
