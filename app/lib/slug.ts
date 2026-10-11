import { slugSchema } from "~/lib/validation/common";

/**
 * Convert arbitrary text into a URL-safe, lowercase, hyphen-delimited slug.
 * Diacritics are stripped so "Café Déjà Vu" becomes "cafe-deja-vu".
 */
export function slugify(input: string, maxLength = 120): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

export function isValidSlug(value: string): boolean {
  return slugSchema.safeParse(value).success;
}

/**
 * Ensure a slug is unique within a set by appending a numeric suffix.
 * Used by admin create flows when the derived slug already exists.
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = slugify(base) || "item";
  if (!used.has(root)) return root;
  let counter = 2;
  while (used.has(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}
