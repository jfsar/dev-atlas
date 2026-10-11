import { describe, expect, it } from "vitest";

import { parseDomainForm } from "~/lib/services/admin/parse.domain";

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
  slug: "identity-and-access",
  title: "Identity and access",
  summary: "How systems prove who a user is and what they may do.",
};

describe("parseDomainForm", () => {
  it("accepts a valid domain with a point", () => {
    const result = parseDomainForm(
      formFrom({
        ...base,
        points: JSON.stringify([
          {
            kind: "OBJECTIVE",
            title: "Authenticate users",
            body: "Only verified users may reach protected resources.",
          },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("identity-and-access");
      expect(result.data.points).toHaveLength(1);
      expect(result.data.points[0]).toMatchObject({ kind: "OBJECTIVE" });
    }
  });

  it("drops points missing a title or body", () => {
    const result = parseDomainForm(
      formFrom({
        ...base,
        points: JSON.stringify([
          { kind: "OBJECTIVE", title: "", body: "body only" },
          { kind: "RULE", title: "title only", body: "" },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.points).toEqual([]);
  });

  it("falls back to OBJECTIVE for unknown point kinds", () => {
    const result = parseDomainForm(
      formFrom({
        ...base,
        points: JSON.stringify([
          { kind: "NOT_A_KIND", title: "Thing", body: "Something." },
        ]),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.points[0]).toMatchObject({ kind: "OBJECTIVE" });
    }
  });

  it("reports point-level errors under the points field", () => {
    const result = parseDomainForm(
      formFrom({
        ...base,
        points: JSON.stringify([
          { kind: "OBJECTIVE", title: "x".repeat(200), body: "Something." },
        ]),
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.points).toBeDefined();
  });

  it("collects repeated relation fields", () => {
    const result = parseDomainForm(
      formFrom({
        ...base,
        categorySlugs: ["security", "backend"],
        topicSlugs: ["authentication"],
        resourceIds: ["res_1"],
        projectSlugs: ["build-an-api"],
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categorySlugs).toEqual(["security", "backend"]);
      expect(result.data.topicSlugs).toEqual(["authentication"]);
      expect(result.data.resourceIds).toEqual(["res_1"]);
      expect(result.data.projectSlugs).toEqual(["build-an-api"]);
    }
  });

  it("rejects an invalid slug", () => {
    const result = parseDomainForm(formFrom({ ...base, slug: "Not A Slug" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.slug).toBeDefined();
  });

  it("reports an error for malformed points JSON", () => {
    const result = parseDomainForm(formFrom({ ...base, points: "{not json" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.points).toBeDefined();
  });
});
