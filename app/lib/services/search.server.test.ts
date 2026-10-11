import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const model = () => ({ findMany: vi.fn(), count: vi.fn() });
  return {
    roadmap: model(),
    topic: model(),
    businessDomain: model(),
    project: model(),
    resource: model(),
  };
});

vi.mock("~/lib/prisma", () => ({ prisma: prismaMock }));

import { searchPublicContent } from "~/lib/services/search.server";

const models = [
  prismaMock.roadmap,
  prismaMock.topic,
  prismaMock.businessDomain,
  prismaMock.project,
  prismaMock.resource,
];

beforeEach(() => {
  vi.clearAllMocks();
  for (const model of models) {
    model.findMany.mockResolvedValue([]);
    model.count.mockResolvedValue(0);
  }
});

describe("searchPublicContent", () => {
  it("scopes a typed search to published content", async () => {
    await searchPublicContent({ query: "react", type: "topic" });

    expect(prismaMock.topic.findMany).toHaveBeenCalledTimes(1);
    const args = prismaMock.topic.findMany.mock.calls[0][0];
    expect(args.where.status).toBe("PUBLISHED");
    expect(args.where.OR).toContainEqual({
      title: { contains: "react", mode: "insensitive" },
    });
  });

  it("escapes LIKE wildcards so user input matches literally", async () => {
    await searchPublicContent({ query: "%_\\", type: "roadmap" });

    const args = prismaMock.roadmap.findMany.mock.calls[0][0];
    expect(args.where.OR[0].title.contains).toBe("\\%\\_\\\\");
  });

  it("filters every content type to published rows in grouped search", async () => {
    await searchPublicContent({ query: "api" });

    for (const model of models) {
      expect(model.findMany).toHaveBeenCalledTimes(1);
      expect(model.findMany.mock.calls[0][0].where.status).toBe("PUBLISHED");
    }
  });

  it("returns no groups for a blank query without hitting the database", async () => {
    const results = await searchPublicContent({ query: "   " });

    expect(results.groups).toEqual([]);
    expect(results.total).toBe(0);
    expect(prismaMock.roadmap.findMany).not.toHaveBeenCalled();
  });
});
