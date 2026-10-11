import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildMeta,
  formatPageTitle,
} from "~/lib/seo";
import { siteConfig } from "~/lib/site";

describe("absoluteUrl", () => {
  it("prefixes relative paths with the site url", () => {
    expect(absoluteUrl("/roadmaps")).toBe(`${siteConfig.url}/roadmaps`);
  });

  it("leaves absolute urls untouched", () => {
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });
});

describe("formatPageTitle", () => {
  it("appends the site name once", () => {
    expect(formatPageTitle("Roadmaps")).toBe(`Roadmaps · ${siteConfig.name}`);
    expect(formatPageTitle(siteConfig.name)).toBe(siteConfig.name);
  });
});

describe("buildMeta", () => {
  const meta = buildMeta({
    title: "Roadmaps",
    description: "Browse roadmaps.",
    path: "/roadmaps",
  }) as Array<Record<string, unknown>>;

  it("includes a title and canonical link", () => {
    expect(meta).toContainEqual({ title: `Roadmaps · ${siteConfig.name}` });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "canonical",
      href: `${siteConfig.url}/roadmaps`,
    });
  });

  it("includes Open Graph and Twitter tags", () => {
    expect(meta).toContainEqual({
      property: "og:title",
      content: `Roadmaps · ${siteConfig.name}`,
    });
    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary",
    });
  });

  it("adds a robots directive when noIndex is set", () => {
    const noIndex = buildMeta({
      title: "Hidden",
      path: "/hidden",
      noIndex: true,
    }) as Array<Record<string, unknown>>;
    expect(noIndex).toContainEqual({
      name: "robots",
      content: "noindex,nofollow",
    });
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers crumbs from one", () => {
    const jsonLd = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Roadmaps", path: "/roadmaps" },
    ]);
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Home",
    });
    expect(jsonLd.itemListElement[1]?.item).toBe(`${siteConfig.url}/roadmaps`);
  });
});
