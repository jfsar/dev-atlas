import { describe, expect, it } from "vitest";

import {
  parseCategoryForm,
  parseResourceForm,
  parseRoadmapForm,
  parseRoadmapSectionsForm,
} from "~/lib/services/admin/parse";

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

const validRoadmap = {
  slug: "learn-react",
  title: "Learn React",
  summary: "A complete path to the React ecosystem.",
  difficulty: "BEGINNER",
  estimatedHours: "40",
  categorySlugs: ["frontend", "frontend", "javascript"],
};

describe("parseRoadmapForm", () => {
  it("accepts a valid payload and coerces fields", () => {
    const result = parseRoadmapForm(formFrom(validRoadmap));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("learn-react");
      expect(result.data.difficulty).toBe("BEGINNER");
      expect(result.data.estimatedHours).toBe(40);
      expect(result.data.categorySlugs).toEqual(["frontend", "javascript"]);
    }
  });

  it("reports field errors for invalid input", () => {
    const result = parseRoadmapForm(formFrom({ slug: "Bad Slug", title: "" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.slug).toBeDefined();
      expect(result.fieldErrors.title).toBeDefined();
      expect(result.fieldErrors.summary).toBeDefined();
    }
  });

  it("treats a blank difficulty as unset", () => {
    const result = parseRoadmapForm(
      formFrom({ ...validRoadmap, difficulty: "" }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.difficulty).toBeUndefined();
  });
});

describe("parseRoadmapSectionsForm", () => {
  it("parses a JSON sections payload", () => {
    const payload = JSON.stringify([
      { title: "Foundations", color: "#3366ff" },
      { title: "Advanced" },
    ]);
    const result = parseRoadmapSectionsForm(
      formFrom({ sections: payload }),
      "roadmap-1",
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        title: "Foundations",
        color: "#3366ff",
      });
      expect(result.data[1].color).toBeUndefined();
    }
  });

  it("treats an empty payload as no sections", () => {
    const result = parseRoadmapSectionsForm(formFrom({}), "roadmap-1");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it("reports an error for malformed JSON", () => {
    const result = parseRoadmapSectionsForm(
      formFrom({ sections: "{not json" }),
      "roadmap-1",
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.sections).toBeDefined();
  });

  it("rejects an invalid hex color", () => {
    const result = parseRoadmapSectionsForm(
      formFrom({
        sections: JSON.stringify([{ title: "Basics", color: "red" }]),
      }),
      "roadmap-1",
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.sections).toBeDefined();
  });
});

describe("parseResourceForm", () => {
  it("accepts a valid resource", () => {
    const result = parseResourceForm(
      formFrom({
        url: "https://example.com/react",
        title: "React docs",
        kind: "DOCS",
        categorySlugs: ["frontend"],
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBe("https://example.com/react");
      expect(result.data.kind).toBe("DOCS");
    }
  });

  it("defaults the kind to ARTICLE when omitted", () => {
    const result = parseResourceForm(
      formFrom({ url: "https://example.com", title: "Example" }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.kind).toBe("ARTICLE");
  });

  it("rejects a non-http url", () => {
    const result = parseResourceForm(
      formFrom({ url: "ftp://example.com", title: "Example" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.url).toBeDefined();
  });
});

describe("parseCategoryForm", () => {
  it("accepts a valid category and coerces order", () => {
    const result = parseCategoryForm(
      formFrom({ slug: "frontend", name: "Frontend", order: "3" }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.order).toBe(3);
  });

  it("rejects an invalid slug", () => {
    const result = parseCategoryForm(
      formFrom({ slug: "Front End", name: "Frontend" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.slug).toBeDefined();
  });
});
