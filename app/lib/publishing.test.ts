import { describe, expect, it } from "vitest";

import {
  PublishingError,
  assertPublishable,
  domainPublishIssues,
  isPublishable,
  projectPublishIssues,
  publishedFilter,
  resourcePublishIssues,
  roadmapPublishIssues,
  topicPublishIssues,
} from "~/lib/publishing";

const base = {
  slug: "react-router",
  title: "React Router",
  summary: "A full-stack routing library for React applications.",
};

describe("publishing rules", () => {
  it("passes a complete roadmap", () => {
    expect(roadmapPublishIssues({ ...base, nodeCount: 3 })).toEqual([]);
  });

  it("requires at least one roadmap node", () => {
    const issues = roadmapPublishIssues({ ...base, nodeCount: 0 });
    expect(issues.map((issue) => issue.field)).toContain("nodes");
  });

  it("requires a valid slug and title", () => {
    const issues = roadmapPublishIssues({
      slug: "Bad Slug",
      title: "x",
      summary: base.summary,
      nodeCount: 1,
    });
    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(["slug", "title"]),
    );
  });

  it("requires topic content blocks", () => {
    expect(topicPublishIssues({ ...base, blockCount: 0 })).toHaveLength(1);
    expect(topicPublishIssues({ ...base, blockCount: 2 })).toEqual([]);
  });

  it("requires three domain points", () => {
    expect(domainPublishIssues({ ...base, pointCount: 2 })).toHaveLength(1);
    expect(domainPublishIssues({ ...base, pointCount: 3 })).toEqual([]);
  });

  it("requires a scenario and a milestone for projects", () => {
    const issues = projectPublishIssues({
      ...base,
      scenario: "too short",
      milestoneCount: 0,
    });
    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(["scenario", "milestones"]),
    );
  });

  it("validates resource url and title", () => {
    expect(
      resourcePublishIssues({ url: "not-a-url", title: "Ok title" }).map(
        (issue) => issue.field,
      ),
    ).toContain("url");
  });
});

describe("assertPublishable", () => {
  it("is a no-op when there are no issues", () => {
    expect(() => assertPublishable([])).not.toThrow();
    expect(isPublishable([])).toBe(true);
  });

  it("throws a PublishingError carrying every issue", () => {
    const issues = roadmapPublishIssues({ ...base, nodeCount: 0 });
    try {
      assertPublishable(issues);
      throw new Error("expected assertPublishable to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(PublishingError);
      expect((error as PublishingError).issues).toEqual(issues);
    }
  });
});

describe("publishedFilter", () => {
  it("restricts queries to published content", () => {
    expect(publishedFilter()).toEqual({ status: "PUBLISHED" });
  });
});
