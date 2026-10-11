export const SEARCH_TYPES = [
  "roadmap",
  "topic",
  "domain",
  "project",
  "resource",
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  roadmap: "Roadmaps",
  topic: "Topics",
  domain: "Business domains",
  project: "Projects",
  resource: "Resources",
};

export function isSearchType(
  value: string | null | undefined,
): value is SearchType {
  return (
    typeof value === "string" &&
    (SEARCH_TYPES as readonly string[]).includes(value)
  );
}

/** Builds a canonical `/search` URL, omitting empty/default params. */
export function buildSearchHref({
  q,
  type,
  page,
}: {
  q?: string | null;
  type?: SearchType | null;
  page?: number | null;
}): string {
  const params = new URLSearchParams();
  const trimmed = q?.trim();
  if (trimmed) params.set("q", trimmed);
  if (type) params.set("type", type);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}
