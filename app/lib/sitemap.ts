import { siteConfig } from "~/lib/site";

export type ChangeFrequency =
  "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapEntry {
  /** Root-relative path, e.g. `/roadmaps/react`. */
  path: string;
  lastModified?: Date | string | null;
  changeFrequency?: ChangeFrequency;
  priority?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function toAbsolute(path: string, origin: string): string {
  const base = origin.replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Render a standards-compliant `sitemap.xml` document from a list of entries. */
export function buildSitemapXml(
  entries: SitemapEntry[],
  options: { origin?: string } = {},
): string {
  const origin = options.origin ?? siteConfig.url;

  const urls = entries.map((entry) => {
    const lines = [`<loc>${escapeXml(toAbsolute(entry.path, origin))}</loc>`];

    if (entry.lastModified) {
      const lastmod = toIsoDate(entry.lastModified);
      if (lastmod) lines.push(`<lastmod>${lastmod}</lastmod>`);
    }
    if (entry.changeFrequency) {
      lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
    }
    if (typeof entry.priority === "number") {
      const priority = Math.min(1, Math.max(0, entry.priority));
      lines.push(`<priority>${priority.toFixed(1)}</priority>`);
    }

    return `  <url>\n${lines.map((line) => `    ${line}`).join("\n")}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** Render a `robots.txt` policy that blocks admin/search and points at the sitemap. */
export function buildRobotsTxt(
  options: { sitemapUrl?: string; disallow?: string[] } = {},
): string {
  const { sitemapUrl, disallow = ["/admin", "/search"] } = options;

  const lines = [
    "User-agent: *",
    ...disallow.map((path) => `Disallow: ${path}`),
  ];
  lines.push("Allow: /");

  if (sitemapUrl) {
    lines.push("", `Sitemap: ${sitemapUrl}`);
  }

  return `${lines.join("\n")}\n`;
}
