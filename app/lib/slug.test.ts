import { describe, expect, it } from "vitest";

import { isValidSlug, slugify, uniqueSlug } from "~/lib/slug";

describe("slugify", () => {
  it("lowercases, strips diacritics, and hyphenates", () => {
    expect(slugify("Café Déjà Vu!")).toBe("cafe-deja-vu");
  });

  it("collapses whitespace and trims separators", () => {
    expect(slugify("  Hello   World  ")).toBe("hello-world");
    expect(slugify("--Edge--Case--")).toBe("edge-case");
  });

  it("drops characters that are not alphanumeric", () => {
    expect(slugify("React & Node.js")).toBe("react-node-js");
  });

  it("respects the maximum length and never ends with a hyphen", () => {
    const result = slugify("a".repeat(200), 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.endsWith("-")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase hyphen-delimited slugs", () => {
    expect(isValidSlug("react-router")).toBe(true);
    expect(isValidSlug("node2")).toBe(true);
  });

  it("rejects short, uppercase, or padded slugs", () => {
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("React")).toBe(false);
    expect(isValidSlug("-react")).toBe(false);
    expect(isValidSlug("react--router")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("returns the base when it is free", () => {
    expect(uniqueSlug("React Router", [])).toBe("react-router");
  });

  it("appends an incrementing suffix when taken", () => {
    expect(uniqueSlug("React Router", ["react-router"])).toBe("react-router-2");
    expect(uniqueSlug("React Router", ["react-router", "react-router-2"])).toBe(
      "react-router-3",
    );
  });
});
