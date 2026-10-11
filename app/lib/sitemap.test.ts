import { describe, expect, it } from "vitest";

import { buildRobotsTxt, buildSitemapXml } from "~/lib/sitemap";

describe("buildSitemapXml", () => {
  it("renders a urlset with absolute, escaped URLs", () => {
    const xml = buildSitemapXml(
      [
        { path: "/", priority: 1, changeFrequency: "weekly" },
        { path: "/roadmaps/a&b", lastModified: "2026-01-02T00:00:00.000Z" },
      ],
      { origin: "https://devatlas.example" },
    );

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain("<loc>https://devatlas.example/</loc>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain(
      "<loc>https://devatlas.example/roadmaps/a&amp;b</loc>",
    );
    expect(xml).toContain("<lastmod>2026-01-02T00:00:00.000Z</lastmod>");
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });

  it("omits optional fields and clamps priority", () => {
    const xml = buildSitemapXml([{ path: "/x", priority: 5 }], {
      origin: "https://devatlas.example",
    });
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("<changefreq>");
  });

  it("skips invalid dates", () => {
    const xml = buildSitemapXml([{ path: "/x", lastModified: "nope" }], {
      origin: "https://devatlas.example",
    });
    expect(xml).not.toContain("<lastmod>");
  });
});

describe("buildRobotsTxt", () => {
  it("disallows admin and search and advertises the sitemap", () => {
    const robots = buildRobotsTxt({
      sitemapUrl: "https://devatlas.example/sitemap.xml",
    });
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /search");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://devatlas.example/sitemap.xml");
  });

  it("omits the sitemap line when no URL is given", () => {
    expect(buildRobotsTxt()).not.toContain("Sitemap:");
  });
});
