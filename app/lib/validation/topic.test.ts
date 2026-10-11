import { describe, expect, it } from "vitest";

import {
  createTopicSchema,
  topicBlockSchema,
  updateTopicSchema,
} from "~/lib/validation/topic";

describe("topicBlockSchema", () => {
  it("accepts a markdown block with a body", () => {
    const result = topicBlockSchema.safeParse({
      type: "MARKDOWN",
      body: "# Heading",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a markdown block without a body", () => {
    expect(
      topicBlockSchema.safeParse({ type: "MARKDOWN", body: "" }).success,
    ).toBe(false);
  });

  it("validates checklist items", () => {
    expect(
      topicBlockSchema.safeParse({
        type: "CHECKLIST",
        data: { items: [{ text: "Install Node" }] },
      }).success,
    ).toBe(true);
    expect(
      topicBlockSchema.safeParse({ type: "CHECKLIST", data: { items: [] } })
        .success,
    ).toBe(false);
  });

  it("rejects table rows that do not match the header count", () => {
    const result = topicBlockSchema.safeParse({
      type: "TABLE",
      data: {
        headers: ["A", "B"],
        rows: [["1", "2"], ["3"]],
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid FAQ block", () => {
    expect(
      topicBlockSchema.safeParse({
        type: "FAQ",
        data: { items: [{ question: "Why?", answer: "Because." }] },
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown block type", () => {
    expect(
      topicBlockSchema.safeParse({ type: "NOPE", body: "x" }).success,
    ).toBe(false);
  });
});

describe("createTopicSchema", () => {
  it("applies sensible defaults", () => {
    const result = createTopicSchema.parse({
      slug: "react-router",
      title: "React Router",
      summary: "A full-stack routing library for React apps.",
    });
    expect(result.blocks).toEqual([]);
    expect(result.categorySlugs).toEqual([]);
    expect(result.relatedSlugs).toEqual([]);
    expect(result.resourceIds).toEqual([]);
  });

  it("rejects an invalid slug", () => {
    const result = createTopicSchema.safeParse({
      slug: "Not A Slug",
      title: "React Router",
      summary: "A full-stack routing library for React apps.",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTopicSchema", () => {
  it("requires an id", () => {
    expect(updateTopicSchema.safeParse({ title: "New title" }).success).toBe(
      false,
    );
    expect(
      updateTopicSchema.safeParse({ id: "topic_1", title: "New title" })
        .success,
    ).toBe(true);
  });
});
