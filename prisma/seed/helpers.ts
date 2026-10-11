import type { PublicationStatus, SeedEdge, SeedNode } from "./types";

export function statusMeta(status: PublicationStatus): {
  publishedAt: Date | null;
  archivedAt: Date | null;
} {
  const now = new Date();
  return {
    publishedAt: status === "PUBLISHED" ? now : null,
    archivedAt: status === "ARCHIVED" ? now : null,
  };
}

export interface NodePosition {
  x: number;
  y: number;
}

const COLUMN_WIDTH = 300;
const ROW_HEIGHT = 140;
const ORIGIN_X = 80;
const ORIGIN_Y = 60;

/**
 * Layered layout: x follows longest-path depth over the roadmap edges,
 * y stacks nodes within a column in declaration order. The graph is
 * assumed to be acyclic; iteration is capped so malformed data still
 * terminates.
 */
export function computeLayout(
  nodes: SeedNode[],
  edges: SeedEdge[],
): Map<string, NodePosition> {
  const depth = new Map<string, number>(nodes.map((n) => [n.key, 0]));

  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const edge of edges) {
      const fromDepth = depth.get(edge.from);
      const toDepth = depth.get(edge.to);
      if (fromDepth === undefined || toDepth === undefined) continue;
      if (fromDepth + 1 > toDepth) {
        depth.set(edge.to, fromDepth + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const columns = new Map<number, string[]>();
  for (const node of nodes) {
    const d = depth.get(node.key) ?? 0;
    const column = columns.get(d);
    if (column) column.push(node.key);
    else columns.set(d, [node.key]);
  }

  const positions = new Map<string, NodePosition>();
  for (const [d, keys] of columns) {
    keys.forEach((key, index) => {
      positions.set(key, {
        x: ORIGIN_X + d * COLUMN_WIDTH,
        y: ORIGIN_Y + index * ROW_HEIGHT,
      });
    });
  }
  return positions;
}
