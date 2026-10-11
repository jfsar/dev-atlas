import { describe, expect, it } from "vitest";

import {
  createRoadmapEdgeSchema,
  createRoadmapSchema,
  roadmapGraphSchema,
  updateRoadmapSchema,
} from "~/lib/validation/roadmap";

describe("createRoadmapSchema", () => {
  it("applies defaults", () => {
    const result = createRoadmapSchema.parse({
      slug: "frontend",
      title: "Frontend Developer",
      summary: "Learn the frontend development path.",
    });
    expect(result.featured).toBe(false);
    expect(result.order).toBe(0);
    expect(result.categorySlugs).toEqual([]);
  });

  it("rejects a short summary", () => {
    expect(
      createRoadmapSchema.safeParse({
        slug: "frontend",
        title: "Frontend Developer",
        summary: "short",
      }).success,
    ).toBe(false);
  });
});

describe("updateRoadmapSchema", () => {
  it("requires an id", () => {
    expect(
      updateRoadmapSchema.safeParse({ title: "Updated title" }).success,
    ).toBe(false);
  });
});

describe("createRoadmapEdgeSchema", () => {
  it("rejects self-loops", () => {
    const result = createRoadmapEdgeSchema.safeParse({
      roadmapId: "rm_1",
      sourceId: "node_1",
      targetId: "node_1",
    });
    expect(result.success).toBe(false);
  });

  it("defaults the relationship to RECOMMENDED", () => {
    const result = createRoadmapEdgeSchema.parse({
      roadmapId: "rm_1",
      sourceId: "node_1",
      targetId: "node_2",
    });
    expect(result.relationship).toBe("RECOMMENDED");
  });
});

describe("roadmapGraphSchema", () => {
  const graph = {
    roadmapId: "rm_1",
    sections: [],
    nodes: [
      { id: "a", title: "First node", x: 0, y: 0 },
      { id: "b", title: "Second node", x: 200, y: 0 },
    ],
    edges: [
      { sourceId: "a", targetId: "b", relationship: "PREREQUISITE" as const },
    ],
  };

  it("accepts a well-formed graph", () => {
    expect(roadmapGraphSchema.safeParse(graph).success).toBe(true);
  });

  it("rejects duplicate node ids", () => {
    const result = roadmapGraphSchema.safeParse({
      ...graph,
      nodes: [
        { id: "a", title: "First", x: 0, y: 0 },
        { id: "a", title: "Second", x: 1, y: 1 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate edges", () => {
    const result = roadmapGraphSchema.safeParse({
      ...graph,
      edges: [
        { sourceId: "a", targetId: "b" },
        { sourceId: "a", targetId: "b" },
      ],
    });
    expect(result.success).toBe(false);
  });
});
