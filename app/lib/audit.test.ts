import { afterEach, describe, expect, it, vi } from "vitest";

import { formatAuditRecord, logAuditEvent } from "~/lib/audit.server";

describe("formatAuditRecord", () => {
  it("stamps a timestamp and defaults the outcome to success", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(
      formatAuditRecord(
        { action: "roadmap.graph.save", actorId: "u1", targetId: "r1" },
        now,
      ),
    ).toEqual({
      timestamp: "2026-01-01T00:00:00.000Z",
      outcome: "success",
      action: "roadmap.graph.save",
      actorId: "u1",
      targetId: "r1",
    });
  });

  it("preserves an explicit outcome and metadata", () => {
    const record = formatAuditRecord({
      action: "roadmap.status",
      outcome: "failure",
      metadata: { status: "PUBLISHED" },
    });
    expect(record.outcome).toBe("failure");
    expect(record.metadata).toEqual({ status: "PUBLISHED" });
  });
});

describe("logAuditEvent", () => {
  afterEach(() => vi.restoreAllMocks());

  it("writes a structured single-line log", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logAuditEvent({ action: "roadmap.graph.save", actorId: "u1" });

    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0]![0] as string;
    expect(line.startsWith("[audit] ")).toBe(true);
    expect(JSON.parse(line.slice("[audit] ".length))).toMatchObject({
      action: "roadmap.graph.save",
      actorId: "u1",
      outcome: "success",
    });
  });
});
