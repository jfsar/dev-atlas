import type { RoadmapGraphInput } from "~/lib/validation/roadmap";

/**
 * Referential integrity rules for the visual editor payload. These run after
 * Zod structural validation and before any Prisma write: an edge must connect
 * two nodes that exist in the payload, and a node must only point at a section
 * that is part of the same save. Kept pure so it can be unit tested and reused
 * on the client for inline feedback.
 */

export interface GraphReferenceIssue {
  field: string;
  message: string;
}

export function validateGraphReferences(
  graph: RoadmapGraphInput,
): GraphReferenceIssue[] {
  const issues: GraphReferenceIssue[] = [];

  const sectionIds = new Set(
    graph.sections
      .map((section) => section.id)
      .filter((id): id is string => Boolean(id)),
  );
  const nodeIds = new Set(
    graph.nodes
      .map((node) => node.id)
      .filter((id): id is string => Boolean(id)),
  );

  graph.nodes.forEach((node, index) => {
    if (node.sectionId && !sectionIds.has(node.sectionId)) {
      issues.push({
        field: `nodes.${index}.sectionId`,
        message:
          "This node points at a section that is no longer on the board.",
      });
    }
  });

  graph.edges.forEach((edge, index) => {
    if (!nodeIds.has(edge.sourceId)) {
      issues.push({
        field: `edges.${index}.sourceId`,
        message:
          "A connection starts at a node that is no longer on the board.",
      });
    }
    if (!nodeIds.has(edge.targetId)) {
      issues.push({
        field: `edges.${index}.targetId`,
        message: "A connection ends at a node that is no longer on the board.",
      });
    }
  });

  return issues;
}
