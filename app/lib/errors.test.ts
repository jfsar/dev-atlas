import { afterEach, describe, expect, it, vi } from "vitest";

import {
  APP_ERROR_STATUS,
  appErrorPayload,
  appErrorResponse,
  appErrorStatus,
  appUnexpectedError,
  type AppErrorCode,
} from "~/lib/errors";

const codes = Object.keys(APP_ERROR_STATUS) as AppErrorCode[];

describe("appErrorStatus", () => {
  it("maps every code to its HTTP status", () => {
    expect(appErrorStatus("VALIDATION")).toBe(400);
    expect(appErrorStatus("UNAUTHENTICATED")).toBe(401);
    expect(appErrorStatus("UNAUTHORIZED")).toBe(403);
    expect(appErrorStatus("NOT_FOUND")).toBe(404);
    expect(appErrorStatus("CONFLICT")).toBe(409);
    expect(appErrorStatus("UNEXPECTED")).toBe(500);
  });
});

describe("appErrorPayload", () => {
  it("uses a default message per code", () => {
    for (const code of codes) {
      const payload = appErrorPayload(code);
      expect(payload.code).toBe(code);
      expect(payload.message.length).toBeGreaterThan(0);
      expect(payload.fields).toBeUndefined();
    }
  });

  it("honors a custom message and fields", () => {
    const payload = appErrorPayload("VALIDATION", {
      message: "Fix the form.",
      fields: { title: ["Required."] },
    });
    expect(payload).toEqual({
      code: "VALIDATION",
      message: "Fix the form.",
      fields: { title: ["Required."] },
    });
  });
});

describe("appErrorResponse", () => {
  it("serializes JSON with the matching status and content type", async () => {
    const response = appErrorResponse("NOT_FOUND");
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    await expect(response.json()).resolves.toEqual({
      code: "NOT_FOUND",
      message: "The requested resource could not be found.",
    });
  });

  it("merges caller-supplied headers", () => {
    const response = appErrorResponse("CONFLICT", {
      headers: { "Retry-After": "30" },
    });
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(response.headers.get("Content-Type")).toContain("application/json");
  });
});

describe("appUnexpectedError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs the original error and returns a generic 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = appUnexpectedError(new Error("db exploded"));

    expect(response.status).toBe(500);
    expect(spy).toHaveBeenCalledTimes(1);
    const body = (await response.json()) as { message: string };
    expect(body.message).not.toContain("db exploded");
  });
});
