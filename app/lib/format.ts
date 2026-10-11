import type {
  ContentPointKind,
  Difficulty,
  ResourceKind,
} from "~/generated/prisma/client";

const difficultyLabels: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export function formatDifficulty(
  value: Difficulty | null | undefined,
): string | null {
  return value ? difficultyLabels[value] : null;
}

const resourceKindLabels: Record<ResourceKind, string> = {
  ARTICLE: "Article",
  VIDEO: "Video",
  COURSE: "Course",
  DOCS: "Docs",
  TOOL: "Tool",
  BOOK: "Book",
  OTHER: "Link",
};

export function formatResourceKind(value: ResourceKind): string {
  return resourceKindLabels[value];
}

const contentPointKindLabels: Record<ContentPointKind, string> = {
  OBJECTIVE: "Objective",
  ACTOR: "Actor",
  ENTITY: "Entity",
  PROCESS_STEP: "Process step",
  STATE: "State",
  RULE: "Rule",
  CONTROL: "Control",
  KPI: "KPI",
  SOFTWARE_IMPLICATION: "Software implication",
};

export function formatContentPointKind(value: ContentPointKind): string {
  return contentPointKindLabels[value];
}

/** Compact human duration from minutes, e.g. 45 -> "45 min", 150 -> "2h 30m". */
export function formatMinutes(
  minutes: number | null | undefined,
): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

/** Compact human duration from hours, e.g. 12 -> "12h", 120 -> "5 days". */
export function formatHours(hours: number | null | undefined): string | null {
  if (!hours || hours <= 0) return null;
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 8);
  return days <= 1 ? `${hours}h` : `~${days} days`;
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Returns the URL only when it is an absolute http(s) URL, otherwise `null`.
 * Defense-in-depth against `javascript:`/`data:` URLs reaching an anchor href.
 */
export function safeExternalHref(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? url
      : null;
  } catch {
    return null;
  }
}
