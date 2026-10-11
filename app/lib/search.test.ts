import { describe, expect, it } from "vitest";

import {
  buildSearchHref,
  isSearchType,
  SEARCH_TYPE_LABELS,
  SEARCH_TYPES,
} from "~/lib/search";

describe("isSearchType", () => {
  it("accepts every known type", () => {
    for (const type of SEARCH_TYPES) {
      expect(isSearchType(type)).toBe(true);
    }
  });

  it("rejects unknown, empty, and nullish values", () => {
    expect(isSearchType("nope")).toBe(false);
    expect(isSearchType("")).toBe(false);
    expect(isSearchType(null)).toBe(false);
    expect(isSearchType(undefined)).toBe(false);
  });

  it("labels every type", () => {
    for (const type of SEARCH_TYPES) {
      expect(SEARCH_TYPE_LABELS[type]).toBeTruthy();
    }
  });
});

describe("buildSearchHref", () => {
  it("returns the bare path when nothing is set", () => {
    expect(buildSearchHref({})).toBe("/search");
    expect(buildSearchHref({ q: "   " })).toBe("/search");
  });

  it("encodes the query term", () => {
    expect(buildSearchHref({ q: "react router" })).toBe(
      "/search?q=react+router",
    );
  });

  it("includes an optional type filter", () => {
    expect(buildSearchHref({ q: "sql", type: "topic" })).toBe(
      "/search?q=sql&type=topic",
    );
  });

  it("omits page 1 but includes later pages", () => {
    expect(buildSearchHref({ q: "sql", type: "topic", page: 1 })).toBe(
      "/search?q=sql&type=topic",
    );
    expect(buildSearchHref({ q: "sql", type: "topic", page: 3 })).toBe(
      "/search?q=sql&type=topic&page=3",
    );
  });
});
