import { describe, expect, it } from "vitest";

import {
  adminLoginSchema,
  twoFactorCodeSchema,
  twoFactorPasswordSchema,
} from "~/lib/validation/auth";

describe("adminLoginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = adminLoginSchema.safeParse({
      email: "Admin@Example.com",
      password: "super-secret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("admin@example.com");
    }
  });

  it("rejects an invalid email", () => {
    expect(
      adminLoginSchema.safeParse({ email: "not-an-email", password: "x" })
        .success,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(
      adminLoginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(
      adminLoginSchema.safeParse({ email: 1, password: null }).success,
    ).toBe(false);
  });
});

describe("twoFactorCodeSchema", () => {
  it("accepts a 6-digit code", () => {
    expect(twoFactorCodeSchema.safeParse({ code: "123456" }).success).toBe(
      true,
    );
  });

  it("trims surrounding whitespace", () => {
    const result = twoFactorCodeSchema.safeParse({ code: " 123456 " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("123456");
    }
  });

  it("accepts a backup code", () => {
    expect(twoFactorCodeSchema.safeParse({ code: "abcd-efgh" }).success).toBe(
      true,
    );
  });

  it("rejects an empty code", () => {
    expect(twoFactorCodeSchema.safeParse({ code: "" }).success).toBe(false);
  });

  it("rejects an over-long code", () => {
    expect(
      twoFactorCodeSchema.safeParse({ code: "x".repeat(33) }).success,
    ).toBe(false);
  });
});

describe("twoFactorPasswordSchema", () => {
  it("accepts a non-empty password", () => {
    expect(
      twoFactorPasswordSchema.safeParse({ password: "hunter2!" }).success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(twoFactorPasswordSchema.safeParse({ password: "" }).success).toBe(
      false,
    );
  });
});
