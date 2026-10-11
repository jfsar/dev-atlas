import { describe, expect, it } from "vitest";

import { parseServerEnv, serverEnvSchema } from "~/lib/env.server";

const valid = {
  DATABASE_URL: "postgresql://roadmap:roadmap@localhost:5432/roadmap",
  BETTER_AUTH_SECRET: "a-sufficiently-long-secret-value",
  BETTER_AUTH_URL: "https://devatlas.example",
};

describe("parseServerEnv", () => {
  it("accepts a complete environment and defaults NODE_ENV", () => {
    expect(parseServerEnv(valid)).toEqual({
      ...valid,
      NODE_ENV: "development",
    });
  });

  it("defaults the auth base URL when it is omitted", () => {
    const { BETTER_AUTH_URL, ...rest } = valid;
    expect(parseServerEnv(rest).BETTER_AUTH_URL).toBe("http://localhost:5173");
    expect(BETTER_AUTH_URL).toBeDefined();
  });

  it("throws a helpful message when required values are missing", () => {
    expect(() => parseServerEnv({})).toThrow(/DATABASE_URL/);
    expect(() => parseServerEnv({})).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("rejects a too-short auth secret", () => {
    expect(() =>
      parseServerEnv({ ...valid, BETTER_AUTH_SECRET: "short" }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("rejects a malformed auth base URL", () => {
    expect(() =>
      parseServerEnv({ ...valid, BETTER_AUTH_URL: "not-a-url" }),
    ).toThrow(/BETTER_AUTH_URL/);
  });

  it("exposes the schema for reuse", () => {
    expect(serverEnvSchema.safeParse(valid).success).toBe(true);
  });
});
