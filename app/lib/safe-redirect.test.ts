import { describe, expect, it } from "vitest";

import { sanitizeRedirectTo } from "~/lib/safe-redirect";

describe("sanitizeRedirectTo", () => {
  it("keeps safe relative paths", () => {
    expect(sanitizeRedirectTo("/admin/roadmaps")).toBe("/admin/roadmaps");
    expect(sanitizeRedirectTo("/admin/topics?page=2")).toBe(
      "/admin/topics?page=2",
    );
  });

  it("falls back when the value is missing or empty", () => {
    expect(sanitizeRedirectTo(null)).toBe("/admin");
    expect(sanitizeRedirectTo(undefined)).toBe("/admin");
    expect(sanitizeRedirectTo("   ")).toBe("/admin");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(sanitizeRedirectTo("https://evil.example")).toBe("/admin");
    expect(sanitizeRedirectTo("//evil.example")).toBe("/admin");
    expect(sanitizeRedirectTo("/\\evil.example")).toBe("/admin");
  });

  it("rejects the login page to avoid redirect loops", () => {
    expect(sanitizeRedirectTo("/admin/login")).toBe("/admin");
    expect(sanitizeRedirectTo("/admin/login?redirectTo=/x")).toBe("/admin");
  });

  it("rejects values containing control characters", () => {
    expect(sanitizeRedirectTo("/admin\r\nSet-Cookie: x")).toBe("/admin");
  });

  it("honors a custom fallback", () => {
    expect(sanitizeRedirectTo("nope", "/")).toBe("/");
  });
});
