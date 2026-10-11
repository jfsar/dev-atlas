import type { TopicBlockInput, TopicInput } from "~/lib/validation/topic";

const CALLOUT_VARIANTS = ["info", "warning", "success", "danger"] as const;

type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

interface RawBlock {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  body?: unknown;
  language?: unknown;
  data?: unknown;
  order?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Coerces an untrusted value (parsed form JSON or a persisted Prisma row) into
 * a well-formed `TopicBlockInput`. Unknown block types fall back to MARKDOWN so
 * a bad payload can never crash the editor.
 */
export function normalizeTopicBlock(raw: unknown, order = 0): TopicBlockInput {
  const block = (raw ?? {}) as RawBlock;
  const id =
    typeof block.id === "string" && block.id.trim() !== ""
      ? block.id
      : undefined;
  const title = asString(block.title);
  const type = typeof block.type === "string" ? block.type : "MARKDOWN";
  const base = {
    ...(id ? { id } : {}),
    ...(title ? { title } : {}),
    order,
  };
  const data = asRecord(block.data);

  switch (type) {
    case "CODE":
      return {
        ...base,
        type: "CODE",
        body: asString(block.body) ?? "",
        language:
          typeof block.language === "string" && block.language.trim() !== ""
            ? block.language
            : undefined,
      };
    case "CALLOUT": {
      const variant =
        typeof data.variant === "string" &&
        (CALLOUT_VARIANTS as readonly string[]).includes(data.variant)
          ? (data.variant as CalloutVariant)
          : "info";
      return {
        ...base,
        type: "CALLOUT",
        body: asString(block.body) ?? "",
        data: { variant },
      };
    }
    case "CHECKLIST": {
      const items = Array.isArray(data.items) ? data.items : [];
      return {
        ...base,
        type: "CHECKLIST",
        data: {
          items: items.map((item) => ({
            text: asString(asRecord(item).text) ?? "",
          })),
        },
      };
    }
    case "FAQ": {
      const items = Array.isArray(data.items) ? data.items : [];
      return {
        ...base,
        type: "FAQ",
        data: {
          items: items.map((item) => ({
            question: asString(asRecord(item).question) ?? "",
            answer: asString(asRecord(item).answer) ?? "",
          })),
        },
      };
    }
    case "RESOURCE_LIST": {
      const items = Array.isArray(data.items) ? data.items : [];
      return {
        ...base,
        type: "RESOURCE_LIST",
        data: {
          items: items.map((item) => ({
            title: asString(asRecord(item).title) ?? "",
            url: asString(asRecord(item).url) ?? "",
          })),
        },
      };
    }
    case "TABLE": {
      const headers = Array.isArray(data.headers)
        ? data.headers.map((header) => String(header))
        : [];
      const rows = Array.isArray(data.rows)
        ? data.rows.map((row) =>
            Array.isArray(row) ? row.map((cell) => String(cell)) : [],
          )
        : [];
      return { ...base, type: "TABLE", data: { headers, rows } };
    }
    default:
      return { ...base, type: "MARKDOWN", body: asString(block.body) ?? "" };
  }
}

/** True when a block carries no user-authored content and can be discarded. */
export function topicBlockHasContent(block: TopicBlockInput): boolean {
  const value = block as unknown as {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  };
  if ((value.title ?? "").trim() !== "") return true;
  if ((value.body ?? "").trim() !== "") return true;

  const data = value.data ?? {};
  const items = data.items;
  if (Array.isArray(items)) {
    return items.some((item) =>
      Object.values(asRecord(item)).some(
        (entry) => typeof entry === "string" && entry.trim() !== "",
      ),
    );
  }
  const headers = data.headers;
  if (Array.isArray(headers) && headers.length > 0) return true;
  const rows = data.rows;
  if (Array.isArray(rows)) {
    return rows.some(
      (row) =>
        Array.isArray(row) && row.some((cell) => String(cell).trim() !== ""),
    );
  }
  return false;
}

export function normalizeTopicBlocks(raw: unknown): TopicBlockInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry, index) => normalizeTopicBlock(entry, index))
    .filter(topicBlockHasContent);
}

/** Rebuilds block state from an echoed form value after a validation error. */
export function blocksFromFormValue(
  value: unknown,
  fallback: TopicBlockInput[],
): TopicBlockInput[] {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((entry, index) => normalizeTopicBlock(entry, index));
  } catch {
    return fallback;
  }
}

export function toBlocksPayload(blocks: TopicInput["blocks"]) {
  return blocks.map((b, i) => ({ ...b, order: i }));
}
