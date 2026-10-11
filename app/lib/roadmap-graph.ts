import type { Difficulty, EdgeRelationship } from "~/generated/prisma/client";

/**
 * Pure transforms that turn domain rows into a presentable roadmap graph and a
 * non-graph outline. Kept free of React and @xyflow/react so it can be unit
 * tested and reused by both the canvas and the accessible list.
 */

const NODE_WIDTH = 240;
const NODE_HEIGHT = 112;
const SECTION_HEADER = 32;
const SECTION_PADDING = 28;

export const RELATIONSHIP_ORDER: EdgeRelationship[] = [
  "PREREQUISITE",
  "RECOMMENDED",
  "OPTIONAL",
  "RELATED",
];

export const relationshipMeta: Record<
  EdgeRelationship,
  { label: string; stroke: string; dash?: string; description: string }
> = {
  PREREQUISITE: {
    label: "Prerequisite",
    stroke: "#2b2620",
    description: "Must be completed first.",
  },
  RECOMMENDED: {
    label: "Recommended",
    stroke: "#8d8264",
    description: "Suggested next step.",
  },
  OPTIONAL: {
    label: "Optional",
    stroke: "#b3412b",
    dash: "6 4",
    description: "Helpful but not required.",
  },
  RELATED: {
    label: "Related",
    stroke: "#5d7692",
    dash: "2 4",
    description: "Connected concept.",
  },
};

export interface GraphTopicRef {
  slug: string;
  title: string;
}

export interface GraphNodeInput {
  id: string;
  title: string;
  summary?: string | null;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  required: boolean;
  order: number;
  difficulty?: Difficulty | null;
  estimatedMinutes?: number | null;
  sectionId?: string | null;
  topic?: GraphTopicRef | null;
}

export interface GraphEdgeInput {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: EdgeRelationship;
}

export interface GraphSectionInput {
  id: string;
  title: string;
  color?: string | null;
  order: number;
}

export interface LayoutNode extends GraphNodeInput {
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface SectionBox {
  id: string;
  title: string;
  color: string | null;
  order: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  nodeCount: number;
}

export interface GraphLayout {
  sections: SectionBox[];
  nodes: LayoutNode[];
  edges: GraphEdgeInput[];
}

function nodeWidth(node: GraphNodeInput): number {
  return node.width && node.width > 0 ? node.width : NODE_WIDTH;
}

function nodeHeight(node: GraphNodeInput): number {
  return node.height && node.height > 0 ? node.height : NODE_HEIGHT;
}

function toLayoutNode(node: GraphNodeInput): LayoutNode {
  return {
    ...node,
    position: { x: node.x, y: node.y },
    width: nodeWidth(node),
    height: nodeHeight(node),
  };
}

function compareNodes(a: GraphNodeInput, b: GraphNodeInput): number {
  return a.order - b.order || a.y - b.y || a.title.localeCompare(b.title);
}

/**
 * Position nodes absolutely and compute a bounding box for every section that
 * contains at least one node. Sections without nodes are omitted.
 */
export function buildGraphLayout(
  sections: GraphSectionInput[],
  nodes: GraphNodeInput[],
  edges: GraphEdgeInput[],
): GraphLayout {
  const layoutNodes = nodes.map(toLayoutNode);
  const boxes = new Map<string, SectionBox>();

  for (const node of layoutNodes) {
    if (!node.sectionId) continue;
    const section = sections.find((item) => item.id === node.sectionId);
    if (!section) continue;

    const minX = node.x - SECTION_PADDING;
    const minY = node.y - SECTION_PADDING - SECTION_HEADER;
    const maxX = node.x + node.width + SECTION_PADDING;
    const maxY = node.y + node.height + SECTION_PADDING;

    const existing = boxes.get(section.id);
    if (!existing) {
      boxes.set(section.id, {
        id: section.id,
        title: section.title,
        color: section.color ?? null,
        order: section.order,
        position: { x: minX, y: minY },
        width: maxX - minX,
        height: maxY - minY,
        nodeCount: 1,
      });
      continue;
    }

    const left = Math.min(existing.position.x, minX);
    const top = Math.min(existing.position.y, minY);
    const right = Math.max(existing.position.x + existing.width, maxX);
    const bottom = Math.max(existing.position.y + existing.height, maxY);
    existing.position = { x: left, y: top };
    existing.width = right - left;
    existing.height = bottom - top;
    existing.nodeCount += 1;
  }

  const orderedBoxes = [...boxes.values()].sort((a, b) => a.order - b.order);

  return { sections: orderedBoxes, nodes: layoutNodes, edges };
}

export interface OutlineGroup {
  id: string | null;
  title: string;
  color: string | null;
  nodes: LayoutNode[];
}

/** Group nodes by section (ordered) for the accessible outline, unsectioned last. */
export function groupNodesBySection(
  sections: GraphSectionInput[],
  nodes: GraphNodeInput[],
): OutlineGroup[] {
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);
  const sectionIds = new Set(orderedSections.map((section) => section.id));

  const groups: OutlineGroup[] = orderedSections
    .map((section) => ({
      id: section.id,
      title: section.title,
      color: section.color ?? null,
      nodes: nodes
        .filter((node) => node.sectionId === section.id)
        .sort(compareNodes)
        .map(toLayoutNode),
    }))
    .filter((group) => group.nodes.length > 0);

  const unsectioned = nodes
    .filter((node) => !node.sectionId || !sectionIds.has(node.sectionId))
    .sort(compareNodes)
    .map(toLayoutNode);

  if (unsectioned.length > 0) {
    groups.push({
      id: null,
      title: "General",
      color: null,
      nodes: unsectioned,
    });
  }

  return groups;
}

export function countTopicNodes(nodes: GraphNodeInput[]): number {
  return new Set(
    nodes.filter((node) => node.topic).map((node) => node.topic!.slug),
  ).size;
}
