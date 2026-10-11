import { describe, expect, it } from "vitest";

import { parseTopicForm } from "~/lib/services/admin/parse.topic";

function formFrom(entries: Record<string, string | string[]>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) form.append(key, item);
    } else {
      form.append(key, value);
    }
  }
  return form;
}

const base = {
  slug: "react-router",
  title: "React Router",
  summary: "A full-stack routing library for React applications.",
};

describe("parseTopicForm", () => {
  it("accepts a valid topic with a markdown block", () => {
    const result = parseTopicForm(
      formFrom({
        ...base,
        blocks: JSON.stringify([
          { type: "MARKDOWN", title: "Intro", body: "# Hello" },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("react-router");
      expect(result.data.blocks).toHaveLength(1);
      expect(result.data.blocks[0]).toMatchObject({ type: "MARKDOWN" });
    }
  });

  it("drops blocks that carry no content", () => {
    const result = parseTopicForm(
      formFrom({
        ...base,
        blocks: JSON.stringify([
          { type: "MARKDOWN", body: "" },
          { type: "CHECKLIST", data: { items: [{ text: "" }] } },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.blocks).toEqual([]);
  });

  it("keeps checklist blocks that have items", () => {
    const result = parseTopicForm(
      formFrom({
        ...base,
        blocks: JSON.stringify([
          { type: "CHECKLIST", data: { items: [{ text: "Install Node" }] } },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blocks).toHaveLength(1);
      expect(result.data.blocks[0]).toMatchObject({ type: "CHECKLIST" });
    }
  });

  it("reports block-level errors under the blocks field", () => {
    const result = parseTopicForm(
      formFrom({
        ...base,
        blocks: JSON.stringify([
          {
            type: "TABLE",
            data: { headers: ["A", "B"], rows: [["1"]] },
          },
        ]),
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.blocks).toBeDefined();
  });

  it("rejects an invalid slug", () => {
    const result = parseTopicForm(formFrom({ ...base, slug: "Not A Slug" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.slug).toBeDefined();
  });

  it("treats a blank difficulty as unset", () => {
    const result = parseTopicForm(formFrom({ ...base, difficulty: "" }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.difficulty).toBeUndefined();
  });

  it("reports an error for malformed blocks JSON", () => {
    const result = parseTopicForm(formFrom({ ...base, blocks: "{not json" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.blocks).toBeDefined();
  });
});
