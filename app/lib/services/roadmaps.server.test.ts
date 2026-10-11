import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  roadmap: { findFirst: vi.fn(), findMany: vi.fn() },
  project: { findMany: vi.fn() },
  businessDomain: { findMany: vi.fn() },
  category: { findMany: vi.fn() },
}));

vi.mock("~/lib/prisma", () => ({ prisma: prismaMock }));

import {
  getPublishedRoadmapBySlug,
  listPublishedRoadmaps,
} from "~/lib/services/roadmaps.server";

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.project.findMany.mockResolvedValue([]);
  prismaMock.businessDomain.findMany.mockResolvedValue([]);
  prismaMock.roadmap.findMany.mockResolvedValue([]);
});

describe("listPublishedRoadmaps", () => {
  it("only queries published roadmaps", async () => {
    await listPublishedRoadmaps();

    expect(prismaMock.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } }),
    );
  });
});

describe("getPublishedRoadmapBySlug", () => {
  it("returns null when no published roadmap matches", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue(null);

    await expect(getPublishedRoadmapBySlug("missing")).resolves.toBeNull();
    expect(prismaMock.roadmap.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "missing", status: "PUBLISHED" },
      }),
    );
  });

  it("drops unpublished topic links from the graph", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue({
      slug: "frontend",
      categories: [],
      nodes: [
        {
          id: "n1",
          order: 0,
          topic: {
            slug: "react",
            title: "React",
            summary: "UI library",
            status: "PUBLISHED",
          },
        },
        {
          id: "n2",
          order: 1,
          topic: {
            slug: "draft-topic",
            title: "Draft",
            summary: "Not public",
            status: "DRAFT",
          },
        },
        { id: "n3", order: 2, topic: null },
      ],
      edges: [],
    });

    const result = await getPublishedRoadmapBySlug("frontend");

    expect(result).not.toBeNull();
    expect(result!.nodes[0].topic?.slug).toBe("react");
    expect(result!.nodes[1].topic).toBeNull();
  });

  it("derives related content only from published topics", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue({
      slug: "frontend",
      categories: [],
      nodes: [
        {
          id: "n1",
          order: 0,
          topic: {
            slug: "react",
            title: "React",
            summary: null,
            status: "PUBLISHED",
          },
        },
        {
          id: "n2",
          order: 1,
          topic: {
            slug: "secret",
            title: "Secret",
            summary: null,
            status: "ARCHIVED",
          },
        },
      ],
      edges: [],
    });

    await getPublishedRoadmapBySlug("frontend");

    const args = prismaMock.project.findMany.mock.calls[0][0];
    expect(args.where.status).toBe("PUBLISHED");
    expect(args.where.topics.some.slug.in).toEqual(["react"]);
  });
});
