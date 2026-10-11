import { describe, expect, it } from "vitest";

import { parseProjectForm } from "~/lib/services/admin/parse.project";

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
  slug: "url-shortener",
  title: "URL shortener",
  summary: "Build a service that maps short codes to long URLs.",
  scenario: "Design and build a URL shortener used by a marketing team.",
};

describe("parseProjectForm", () => {
  it("accepts a valid project with a milestone", () => {
    const result = parseProjectForm(
      formFrom({
        ...base,
        milestones: JSON.stringify([
          { title: "Design the schema", body: "Tables and indexes." },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("url-shortener");
      expect(result.data.milestones).toHaveLength(1);
    }
  });

  it("drops milestones with a blank title", () => {
    const result = parseProjectForm(
      formFrom({
        ...base,
        milestones: JSON.stringify([
          { title: "", body: "no title" },
          { title: "Has title", body: "" },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.milestones).toHaveLength(1);
  });

  it("requires a scenario of at least 20 characters", () => {
    const result = parseProjectForm(
      formFrom({ ...base, scenario: "Too short." }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.scenario).toBeDefined();
  });

  it("treats a blank difficulty as unset", () => {
    const result = parseProjectForm(formFrom({ ...base, difficulty: "" }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.difficulty).toBeUndefined();
  });

  it("collects repeated relation fields", () => {
    const result = parseProjectForm(
      formFrom({
        ...base,
        categorySlugs: ["backend", "web"],
        topicSlugs: ["caching"],
        domainSlugs: ["e-commerce"],
        resourceIds: ["res_1"],
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categorySlugs).toEqual(["backend", "web"]);
      expect(result.data.topicSlugs).toEqual(["caching"]);
      expect(result.data.domainSlugs).toEqual(["e-commerce"]);
      expect(result.data.resourceIds).toEqual(["res_1"]);
    }
  });

  it("rejects an invalid slug", () => {
    const result = parseProjectForm(formFrom({ ...base, slug: "Not A Slug" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.slug).toBeDefined();
  });

  it("reports an error for malformed milestones JSON", () => {
    const result = parseProjectForm(
      formFrom({ ...base, milestones: "{not json" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.milestones).toBeDefined();
  });
});
