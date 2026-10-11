import { describe, expect, it } from "vitest";

import { validateGraphReferences } from "~/lib/roadmap-graph-rules";
import type { RoadmapGraphInput } from "~/lib/validation/roadmap";

function graph(overrides: Partial<RoadmapGraphInput> = {}): RoadmapGraphInput {
  return {
    roadmapId: "rm_1",
    sections: [{ id: "s1", title: "Foundations", color: "#3366ff", order: 0 }],
    nodes: [
      {
        id: "n1",
        title: "First node",
        x: 0,
        y: 0,
        estimatedMinutes: 10,
        required: true,
        order: 0,
        sectionId: "s1",
      },
      {
        id: "n2",
        title: "Second node",
        x: 200,
        y: 0,
        estimatedMinutes: 10,
        required: true,
        order: 1,
        sectionId: "s1",
      },
    ],
    edges: [
      {
        id: "e1",
        sourceId: "n1",
        targetId: "n2",
        relationship: "PREREQUISITE",
        order: 0,
      },
    ],
    ...overrides,
  };
}

describe("validateGraphReferences", () => {
  it("accepts a graph whose references all resolve", () => {
    expect(validateGraphReferences(graph())).toEqual([]);
  });

  it("flags a node that points at an unknown section", () => {
    const issues = validateGraphReferences(
      graph({
        nodes: [
          {
            id: "n1",
            title: "First node",
            x: 0,
            y: 0,
            estimatedMinutes: 10,
            required: true,
            order: 0,
            sectionId: "missing",
          },
        ],
        edges: [],
      }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("nodes.0.sectionId");
  });

  it("flags an edge whose endpoints are not in the payload", () => {
    const issues = validateGraphReferences(
      graph({
        edges: [
          {
            id: "e1",
            sourceId: "n1",
            targetId: "ghost",
            relationship: "RECOMMENDED",
            order: 0,
          },
        ],
      }),
    );
    expect(issues.map((issue) => issue.field)).toEqual(["edges.0.targetId"]);
  });
});
