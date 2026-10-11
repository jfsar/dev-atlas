import { prisma } from "~/lib/prisma";
import type {
  AdminGraphEdge,
  AdminGraphNode,
  AdminGraphSection,
  AdminGraphTopicOption,
  AdminRoadmapGraph,
} from "~/lib/roadmap-graph-model";
import {
  validateGraphReferences,
  type GraphReferenceIssue,
} from "~/lib/roadmap-graph-rules";
import type { RoadmapGraphInput } from "~/lib/validation/roadmap";

/**
 * Admin-side roadmap graph reads and writes for the visual editor. Saving is a
 * single transaction that upserts sections and nodes, maps client-generated
 * temporary ids to the real ids Prisma assigns, then rebuilds edges so the
 * persisted graph always matches the payload exactly.
 */

export type GraphSaveResult =
  | { ok: true }
  | { ok: false; issues: GraphReferenceIssue[] }
  | { ok: false; conflict: true; message: string };

export async function getAdminRoadmapGraph(
  id: string,
): Promise<AdminRoadmapGraph | null> {
  const row = await prisma.roadmap.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      sections: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, color: true, order: true },
      },
      nodes: {
        orderBy: [{ order: "asc" }, { y: "asc" }],
        select: {
          id: true,
          sectionId: true,
          topicId: true,
          title: true,
          summary: true,
          x: true,
          y: true,
          width: true,
          height: true,
          difficulty: true,
          estimatedMinutes: true,
          required: true,
          order: true,
        },
      },
      edges: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          sourceId: true,
          targetId: true,
          relationship: true,
          order: true,
        },
      },
    },
  });
  if (!row) return null;

  const topics: AdminGraphTopicOption[] = await prisma.topic.findMany({
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true },
  });

  const sections: AdminGraphSection[] = row.sections;
  const nodes: AdminGraphNode[] = row.nodes.map((node) => ({
    ...node,
    summary: node.summary ?? "",
  }));
  const edges: AdminGraphEdge[] = row.edges;

  return {
    roadmap: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      revision: row.updatedAt.getTime(),
    },
    sections,
    nodes,
    edges,
    topics,
  };
}

export async function saveRoadmapGraph(
  input: RoadmapGraphInput,
): Promise<GraphSaveResult> {
  const referenceIssues = validateGraphReferences(input);
  if (referenceIssues.length > 0) return { ok: false, issues: referenceIssues };

  const stale = await prisma.$transaction(async (tx) => {
    const roadmap = await tx.roadmap.findUnique({
      where: { id: input.roadmapId },
      select: { id: true, updatedAt: true },
    });
    if (!roadmap) throw new Error("Roadmap not found.");

    if (
      input.revision !== undefined &&
      roadmap.updatedAt.getTime() !== input.revision
    ) {
      return true;
    }

    const requestedTopicIds = [
      ...new Set(
        input.nodes
          .map((node) => node.topicId)
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    const validTopicIds = new Set(
      requestedTopicIds.length > 0
        ? (
            await tx.topic.findMany({
              where: { id: { in: requestedTopicIds } },
              select: { id: true },
            })
          ).map((topic) => topic.id)
        : [],
    );

    const existingSections = await tx.roadmapSection.findMany({
      where: { roadmapId: input.roadmapId },
      select: { id: true },
    });
    const existingSectionIds = new Set(
      existingSections.map((section) => section.id),
    );
    const sectionIdMap = new Map<string, string>();
    const incomingSectionIds = new Set<string>();

    for (const [index, section] of input.sections.entries()) {
      if (section.id) incomingSectionIds.add(section.id);
      if (section.id && existingSectionIds.has(section.id)) {
        await tx.roadmapSection.update({
          where: { id: section.id },
          data: {
            title: section.title,
            color: section.color ?? null,
            order: index,
          },
        });
        sectionIdMap.set(section.id, section.id);
      } else {
        const created = await tx.roadmapSection.create({
          data: {
            roadmapId: input.roadmapId,
            title: section.title,
            color: section.color ?? null,
            order: index,
          },
          select: { id: true },
        });
        if (section.id) sectionIdMap.set(section.id, created.id);
      }
    }

    const removedSectionIds = [...existingSectionIds].filter(
      (id) => !incomingSectionIds.has(id),
    );
    if (removedSectionIds.length > 0) {
      await tx.roadmapSection.deleteMany({
        where: { roadmapId: input.roadmapId, id: { in: removedSectionIds } },
      });
    }

    const existingNodes = await tx.roadmapNode.findMany({
      where: { roadmapId: input.roadmapId },
      select: { id: true },
    });
    const existingNodeIds = new Set(existingNodes.map((node) => node.id));
    const nodeIdMap = new Map<string, string>();
    const incomingNodeIds = new Set<string>();

    for (const [index, node] of input.nodes.entries()) {
      if (node.id) incomingNodeIds.add(node.id);
      const data = {
        title: node.title,
        summary: node.summary ?? null,
        x: node.x,
        y: node.y,
        width: node.width ?? null,
        height: node.height ?? null,
        difficulty: node.difficulty ?? null,
        estimatedMinutes: node.estimatedMinutes ?? null,
        required: node.required,
        order: index,
        sectionId: node.sectionId
          ? (sectionIdMap.get(node.sectionId) ?? null)
          : null,
        topicId:
          node.topicId && validTopicIds.has(node.topicId) ? node.topicId : null,
      };

      if (node.id && existingNodeIds.has(node.id)) {
        await tx.roadmapNode.update({ where: { id: node.id }, data });
        nodeIdMap.set(node.id, node.id);
      } else {
        const created = await tx.roadmapNode.create({
          data: { roadmapId: input.roadmapId, ...data },
          select: { id: true },
        });
        if (node.id) nodeIdMap.set(node.id, created.id);
      }
    }

    const removedNodeIds = [...existingNodeIds].filter(
      (id) => !incomingNodeIds.has(id),
    );
    if (removedNodeIds.length > 0) {
      await tx.roadmapNode.deleteMany({
        where: { roadmapId: input.roadmapId, id: { in: removedNodeIds } },
      });
    }

    await tx.roadmapEdge.deleteMany({ where: { roadmapId: input.roadmapId } });
    const edgeData = input.edges.flatMap((edge, index) => {
      const sourceId = nodeIdMap.get(edge.sourceId);
      const targetId = nodeIdMap.get(edge.targetId);
      if (!sourceId || !targetId) return [];
      return [
        {
          roadmapId: input.roadmapId,
          sourceId,
          targetId,
          relationship: edge.relationship,
          order: index,
        },
      ];
    });
    if (edgeData.length > 0) {
      await tx.roadmapEdge.createMany({ data: edgeData });
    }

    await tx.roadmap.update({
      where: { id: input.roadmapId },
      data: { updatedAt: new Date() },
    });

    return false;
  });

  if (stale) {
    return {
      ok: false,
      conflict: true,
      message:
        "Someone else changed this roadmap while you were editing. Reload the editor and try again.",
    };
  }

  return { ok: true };
}
