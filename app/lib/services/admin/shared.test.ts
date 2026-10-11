import { describe, expect, it } from "vitest";

import {
  categoryConnectPayload,
  formBoolean,
  formDataToValues,
  formNumber,
  formOptionalText,
  formText,
  formTextArray,
  isUniqueConstraintError,
  paginationMeta,
  parseAdminListParams,
  statusTimestampPatch,
  valueOf,
  valuesOf,
  zodFieldErrors,
} from "~/lib/services/admin/shared";
import { z } from "zod";

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

describe("parseAdminListParams", () => {
  it("normalizes q, status, and page", () => {
    const request = new Request(
      "https://example.test/admin/roadmaps?q=%20react%20&status=PUBLISHED&page=3",
    );
    expect(parseAdminListParams(request)).toEqual({
      q: "react",
      status: "PUBLISHED",
      page: 3,
      pageSize: 20,
    });
  });

  it("falls back to safe defaults for missing or invalid values", () => {
    const request = new Request("https://x.test/admin?status=NOPE&page=-4");
    expect(parseAdminListParams(request)).toEqual({
      q: "",
      status: null,
      page: 1,
      pageSize: 20,
    });
  });

  it("caps very large page numbers and accepts a custom page size", () => {
    const request = new Request("https://x.test/admin?page=100000");
    expect(parseAdminListParams(request, 50)).toEqual({
      q: "",
      status: null,
      page: 9999,
      pageSize: 50,
    });
  });
});

describe("paginationMeta", () => {
  it("computes a rounded-up page count", () => {
    expect(paginationMeta(45, 3, 20)).toEqual({
      page: 3,
      pageSize: 20,
      total: 45,
      pageCount: 3,
    });
  });

  it("never reports fewer than one page", () => {
    expect(paginationMeta(0, 1, 20).pageCount).toBe(1);
  });
});

describe("formDataToValues", () => {
  it("collects repeated keys into arrays", () => {
    const values = formDataToValues(
      formFrom({ title: "Roadmap", categorySlugs: ["js", "css"] }),
    );
    expect(values.title).toBe("Roadmap");
    expect(values.categorySlugs).toEqual(["js", "css"]);
  });
});

describe("valueOf / valuesOf", () => {
  it("returns the first value or a fallback", () => {
    const values = { title: "Roadmap", tags: ["a", "b"] };
    expect(valueOf(values, "title")).toBe("Roadmap");
    expect(valueOf(values, "tags")).toBe("a");
    expect(valueOf(values, "missing", "fallback")).toBe("fallback");
  });

  it("always returns an array for valuesOf", () => {
    expect(valuesOf({ tags: "solo" }, "tags")).toEqual(["solo"]);
    expect(valuesOf(undefined, "tags", ["x"])).toEqual(["x"]);
  });
});

describe("zodFieldErrors", () => {
  it("flattens nested paths and labels root issues", () => {
    const schema = z.object({
      title: z.string().min(3, "Too short."),
      sections: z.array(z.object({ name: z.string().min(1, "Need a name.") })),
    });
    const result = schema.safeParse({ title: "x", sections: [{ name: "" }] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = zodFieldErrors(result.error);
      expect(errors.title).toContain("Too short.");
      expect(errors["sections.0.name"]).toContain("Need a name.");
    }
  });

  it("uses _form for issues without a path", () => {
    const result = z
      .string()
      .refine(() => false, "Bad.")
      .safeParse("x");
    if (!result.success) {
      expect(zodFieldErrors(result.error)._form).toEqual(["Bad."]);
    }
  });
});

describe("statusTimestampPatch", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  it("preserves the original publishedAt when re-publishing", () => {
    const original = new Date("2025-06-01T00:00:00.000Z");
    expect(
      statusTimestampPatch("PUBLISHED", { publishedAt: original }, now),
    ).toEqual({ status: "PUBLISHED", publishedAt: original, archivedAt: null });
  });

  it("stamps archivedAt when archiving", () => {
    expect(statusTimestampPatch("ARCHIVED", {}, now)).toEqual({
      status: "ARCHIVED",
      publishedAt: null,
      archivedAt: now,
    });
  });

  it("clears timestamps when returning to draft", () => {
    expect(
      statusTimestampPatch(
        "DRAFT",
        { publishedAt: new Date("2025-06-01T00:00:00.000Z") },
        now,
      ),
    ).toEqual({ status: "DRAFT", publishedAt: null, archivedAt: null });
  });
});

describe("categoryConnectPayload", () => {
  it("dedupes slugs into nested connect entries", () => {
    expect(categoryConnectPayload(["js", "js", "css"])).toEqual([
      { category: { connect: { slug: "js" } } },
      { category: { connect: { slug: "css" } } },
    ]);
  });
});

describe("FormData coercion helpers", () => {
  it("coerces text, optional text, and numbers", () => {
    const form = formFrom({ title: "Hi", blank: "  ", count: "12" });
    expect(formText(form, "title")).toBe("Hi");
    expect(formOptionalText(form, "blank")).toBeUndefined();
    expect(formOptionalText(form, "missing")).toBeUndefined();
    expect(formNumber(form, "count")).toBe(12);
    expect(formNumber(form, "blank")).toBeUndefined();
  });

  it("coerces booleans and text arrays", () => {
    const form = formFrom({ published: "on", tags: ["a", " b ", ""] });
    expect(formBoolean(form, "published")).toBe(true);
    expect(formBoolean(form, "missing")).toBe(false);
    expect(formTextArray(form, "tags")).toEqual(["a", "b"]);
  });
});

describe("isUniqueConstraintError", () => {
  it("detects Prisma P2002 errors", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
    expect(isUniqueConstraintError({ code: "P2003" })).toBe(false);
    expect(isUniqueConstraintError(new Error("boom"))).toBe(false);
    expect(isUniqueConstraintError(null)).toBe(false);
  });
});
