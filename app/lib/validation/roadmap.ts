import { z } from "zod";

import {
  difficultySchema,
  edgeRelationshipSchema,
  emojiSchema,
  estimatedHoursSchema,
  estimatedMinutesSchema,
  idSchema,
  orderSchema,
  seoSchema,
  slugSchema,
  summarySchema,
  titleSchema,
  uniqueStrings,
} from "./common";

/** Fields an admin can edit on a roadmap. */
export const roadmapInputSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  summary: summarySchema,
  description: z.string().trim().max(40_000).optional(),
  audience: z.string().trim().max(400).optional(),
  prerequisiteNotes: z.string().trim().max(10_000).optional(),
  difficulty: difficultySchema.optional(),
  estimatedHours: estimatedHoursSchema,
  icon: emojiSchema,
  featured: z.boolean().default(false),
  order: orderSchema.default(0),
  categorySlugs: z.array(slugSchema).max(10).default([]).transform(uniqueStrings),
  ...seoSchema.shape,
});

export const createRoadmapSchema = roadmapInputSchema;

export const updateRoadmapSchema = roadmapInputSchema
  .partial()
  .extend({ id: idSchema });

export const createRoadmapSectionSchema = z.object({
  roadmapId: idSchema,
  title: titleSchema,
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #3366ff.")
    .optional(),
  order: orderSchema.default(0),
});

export const updateRoadmapSectionSchema = createRoadmapSectionSchema
  .omit({ roadmapId: true })
  .partial()
  .extend({ id: idSchema });

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #3366ff.");

/** Bulk roadmap sections payload used by the admin metadata form. */
export const roadmapSectionsInputSchema = z.object({
  roadmapId: idSchema,
  sections: z
    .array(
      z.object({
        id: idSchema.optional(),
        title: titleSchema,
        color: hexColorSchema.optional(),
      }),
    )
    .max(50),
});

const coordinateSchema = z.number().finite();

export const createRoadmapNodeSchema = z.object({
  roadmapId: idSchema,
  sectionId: idSchema.nullable().optional(),
  topicId: idSchema.nullable().optional(),
  title: titleSchema,
  summary: z.string().trim().max(400).optional(),
  x: coordinateSchema,
  y: coordinateSchema,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  difficulty: difficultySchema.optional(),
  estimatedMinutes: estimatedMinutesSchema,
  required: z.boolean().default(true),
  order: orderSchema.default(0),
});

export const updateRoadmapNodeSchema = createRoadmapNodeSchema
  .omit({ roadmapId: true })
  .partial()
  .extend({ id: idSchema });

export const createRoadmapEdgeSchema = z
  .object({
    roadmapId: idSchema,
    sourceId: idSchema,
    targetId: idSchema,
    relationship: edgeRelationshipSchema.default("RECOMMENDED"),
    order: orderSchema.default(0),
  })
  .refine((edge) => edge.sourceId !== edge.targetId, {
    message: "An edge cannot connect a node to itself.",
    path: ["targetId"],
  });

export const updateRoadmapEdgeSchema = z.object({
  id: idSchema,
  relationship: edgeRelationshipSchema.optional(),
  order: orderSchema.optional(),
});

const graphNodeId = z.string().trim().min(1).max(64);

const graphNodeSchema = z.object({
  id: graphNodeId.optional(),
  sectionId: graphNodeId.nullable().optional(),
  topicId: graphNodeId.nullable().optional(),
  title: titleSchema,
  summary: z.string().trim().max(400).optional(),
  x: coordinateSchema,
  y: coordinateSchema,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  difficulty: difficultySchema.optional(),
  estimatedMinutes: estimatedMinutesSchema,
  required: z.boolean().default(true),
  order: orderSchema.default(0),
});

const graphSectionSchema = z.object({
  id: graphNodeId.optional(),
  title: titleSchema,
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  order: orderSchema.default(0),
});

const graphEdgeSchema = z.object({
  id: graphNodeId.optional(),
  sourceId: graphNodeId,
  targetId: graphNodeId,
  relationship: edgeRelationshipSchema.default("RECOMMENDED"),
  order: orderSchema.default(0),
});

/**
 * Bulk payload for the visual editor (Chunk 8). Sections, nodes, and edges are
 * saved atomically; new records carry a client-generated temporary id that the
 * server maps to a real id.
 */
export const roadmapGraphSchema = z
  .object({
    roadmapId: idSchema,
    revision: z.number().int().nonnegative().optional(),
    sections: z.array(graphSectionSchema).max(50),
    nodes: z.array(graphNodeSchema).max(500),
    edges: z.array(graphEdgeSchema).max(2000),
  })
  .superRefine((graph, ctx) => {
    const nodeIds = new Set<string>();
    graph.nodes.forEach((node, index) => {
      if (node.id) {
        if (nodeIds.has(node.id)) {
          ctx.addIssue({
            code: "custom",
            message: "Duplicate node id.",
            path: ["nodes", index, "id"],
          });
        }
        nodeIds.add(node.id);
      }
    });

    const seenEdges = new Set<string>();
    graph.edges.forEach((edge, index) => {
      if (edge.sourceId === edge.targetId) {
        ctx.addIssue({
          code: "custom",
          message: "An edge cannot connect a node to itself.",
          path: ["edges", index, "targetId"],
        });
      }
      const key = `${edge.sourceId}->${edge.targetId}`;
      if (seenEdges.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate edge between these nodes.",
          path: ["edges", index],
        });
      }
      seenEdges.add(key);
    });
  });

export type RoadmapInput = z.infer<typeof roadmapInputSchema>;
export type RoadmapGraphInput = z.infer<typeof roadmapGraphSchema>;
