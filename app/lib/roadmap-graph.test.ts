import { describe, expect, it } from "vitest";

import {
  RELATIONSHIP_ORDER,
  buildGraphLayout,
  countTopicNodes,
  groupNodesBySection,
  relationshipMeta,
  type GraphNodeInput,
  type GraphSectionInput,
} from "~/lib/roadmap-graph";

const sections: GraphSectionInput[] = [
  { id: "s1", title: "Foundations", color: "#111111", order: 0 },
  { id: "s2", title: "Advanced", color: null, order: 1 },
  { id: "s3", title: "Empty", color: null, order: 2 },
];

const nodes: GraphNodeInput[] = [
  {
    id: "n1",
    title: "Node one",
    x: 0,
    y: 0,
    required: true,
    order: 0,
    sectionId: "s1",
    topic: { slug: "node-one", title: "Node one" },
  },
  {
    id: "n2",
    title: "Node two",
    x: 0,
    y: 140,
    required: false,
    order: 1,
    sectionId: "s1",
  },
  {
    id: "n3",
    title: "Node three",
    x: 300,
    y: 0,
    required: true,
    order: 0,
    sectionId: "s2",
  },
  { id: "n4", title: "Float", x: 600, y: 0, required: true, order: 0 },
];

const edges = [
  {
    id: "e1",
    sourceId: "n1",
    targetId: "n2",
    relationship: "PREREQUISITE" as const,
  },
];

describe("buildGraphLayout", () => {
  const layout = buildGraphLayout(sections, nodes, edges);

  it("positions every node and preserves edges", () => {
    expect(layout.nodes).toHaveLength(4);
    expect(layout.nodes[0]?.position).toEqual({ x: 0, y: 0 });
    expect(layout.edges).toEqual(edges);
  });

  it("computes a bounding box per section and omits empty sections", () => {
    const ids = layout.sections.map((section) => section.id);
    expect(ids).toEqual(["s1", "s2"]);
    const s1 = layout.sections.find((section) => section.id === "s1")!;
    expect(s1.nodeCount).toBe(2);
    expect(s1.position).toEqual({ x: -28, y: -60 });
    expect(s1.width).toBe(296);
    expect(s1.height).toBe(340);
  });
});

describe("groupNodesBySection", () => {
  it("orders sections and puts unsectioned nodes last", () => {
    const groups = groupNodesBySection(sections, nodes);
    expect(groups.map((group) => group.id)).toEqual(["s1", "s2", null]);
    expect(groups[0]?.nodes.map((node) => node.id)).toEqual(["n1", "n2"]);
    expect(groups.at(-1)?.title).toBe("General");
  });
});

describe("countTopicNodes", () => {
  it("counts distinct linked topics", () => {
    expect(countTopicNodes(nodes)).toBe(1);
  });
});

describe("relationshipMeta", () => {
  it("documents every relationship type", () => {
    for (const type of RELATIONSHIP_ORDER) {
      expect(relationshipMeta[type].label).toBeTruthy();
      expect(relationshipMeta[type].stroke).toMatch(/^#/);
    }
  });
});
