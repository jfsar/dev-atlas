import { describe, expect, it } from "vitest";

import {
  formatDifficulty,
  formatHours,
  formatMinutes,
  pluralize,
} from "~/lib/format";

describe("formatMinutes", () => {
  it("formats minutes, hours, and mixed durations", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(120)).toBe("2h");
    expect(formatMinutes(150)).toBe("2h 30m");
  });

  it("returns null for empty or invalid input", () => {
    expect(formatMinutes(null)).toBeNull();
    expect(formatMinutes(0)).toBeNull();
  });
});

describe("formatHours", () => {
  it("formats hours and rough multi-day estimates", () => {
    expect(formatHours(12)).toBe("12h");
    expect(formatHours(6)).toBe("6h");
    expect(formatHours(40)).toBe("~5 days");
  });

  it("returns null for empty input", () => {
    expect(formatHours(undefined)).toBeNull();
  });
});

describe("formatDifficulty", () => {
  it("title-cases known difficulty values", () => {
    expect(formatDifficulty("BEGINNER")).toBe("Beginner");
    expect(formatDifficulty("EXPERT")).toBe("Expert");
    expect(formatDifficulty(null)).toBeNull();
  });
});

describe("pluralize", () => {
  it("switches between singular and plural", () => {
    expect(pluralize(1, "node")).toBe("node");
    expect(pluralize(3, "node")).toBe("nodes");
    expect(pluralize(2, "domain", "domains")).toBe("domains");
  });
});
