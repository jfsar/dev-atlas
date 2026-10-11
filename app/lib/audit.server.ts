export interface AuditEvent {
  /** Dotted action identifier, e.g. `roadmap.graph.save`. */
  action: string;
  outcome?: "success" | "failure";
  actorId?: string | null;
  targetType?: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditRecord extends AuditEvent {
  timestamp: string;
}

/** Build a self-contained audit record. Pure, so it is easy to unit test. */
export function formatAuditRecord(
  event: AuditEvent,
  now: Date = new Date(),
): AuditRecord {
  return { timestamp: now.toISOString(), outcome: "success", ...event };
}

/**
 * Emit a structured, single-line audit log for an important admin mutation.
 * V1 has no audit table, so events go to stdout for later collection.
 */
export function logAuditEvent(event: AuditEvent): void {
  console.info(`[audit] ${JSON.stringify(formatAuditRecord(event))}`);
}
