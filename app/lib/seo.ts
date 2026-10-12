import type { MetaDescriptor } from "react-router";

import { siteConfig } from "~/lib/site";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle) return siteConfig.name;
  if (pageTitle.includes(siteConfig.name)) return pageTitle;
  return `${pageTitle} · ${siteConfig.name}`;
}

export interface MetaInput {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Build a complete, self-consistent SEO meta descriptor list: title, canonical
 * URL, Open Graph, and Twitter card tags.
 */
export function buildMeta({
  title,
  description = siteConfig.description,
  path,
  image,
  type = "website",
  noIndex = false,
}: MetaInput): MetaDescriptor[] {
  const fullTitle = formatPageTitle(title);
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image ?? siteConfig.ogImage);

  const meta: MetaDescriptor[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:type", content: type },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:locale", content: siteConfig.locale },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: siteConfig.twitter },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  if (noIndex) meta.push({ name: "robots", content: "noindex,nofollow" });

  return meta;
}

/**
 * Serialize structured data for embedding in a `<script type="application/ld+json">`.
 * Escapes the characters that can prematurely close the script element so that
 * even admin-authored titles can never break out of the tag (stored XSS).
 */
export function jsonLdScript(json: unknown): string {
  return JSON.stringify(json)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}
