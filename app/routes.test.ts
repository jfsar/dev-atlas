import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import routeConfig from "./routes";

interface RouteEntry {
  id?: string;
  path?: string;
  index?: boolean;
  file: string;
  children?: RouteEntry[];
}

function joinPath(parent: string, segment: string): string {
  const combined = [parent, segment]
    .filter((part) => part.length > 0)
    .join("/");
  const trimmed = combined.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed.length === 0 ? "/" : `/${trimmed}`;
}

function flatten(
  entries: readonly RouteEntry[],
  parent = "",
): { path: string; file: string }[] {
  const routes: { path: string; file: string }[] = [];

  for (const entry of entries) {
    const path = joinPath(parent, entry.path ?? "");

    // Pathless layout routes group children but do not match on their own.
    if (entry.path !== undefined || entry.index) {
      routes.push({ path, file: entry.file });
    }

    if (entry.children) {
      routes.push(...flatten(entry.children, path));
    }
  }

  return routes;
}

const routes = flatten(routeConfig as unknown as RouteEntry[]);
const paths = new Set(routes.map((entry) => entry.path));

const expectedPaths = [
  "/",
  "/roadmaps",
  "/roadmaps/:slug",
  "/topics/:slug",
  "/business-domains",
  "/business-domains/:slug",
  "/projects",
  "/projects/:slug",
  "/search",
  "/*",
  "/sitemap.xml",
  "/robots.txt",
  "/api/auth/*",
  "/admin/login",
  "/admin/logout",
  "/admin",
  "/admin/security",
  "/admin/roadmaps",
  "/admin/roadmaps/new",
  "/admin/roadmaps/:id",
  "/admin/roadmaps/:id/editor",
  "/admin/roadmaps/:id/preview",
  "/admin/topics",
  "/admin/topics/new",
  "/admin/topics/:id",
  "/admin/resources",
  "/admin/resources/new",
  "/admin/resources/:id",
  "/admin/categories",
  "/admin/categories/:id",
  "/admin/business-domains",
  "/admin/business-domains/new",
  "/admin/business-domains/:id",
  "/admin/projects",
  "/admin/projects/new",
  "/admin/projects/:id",
] as const;

describe("route config", () => {
  it("registers every expected route path", () => {
    const missing = expectedPaths.filter((path) => !paths.has(path));
    expect(missing).toEqual([]);
  });

  it("registers public routes before the catch-all", () => {
    const order = routes.map((entry) => entry.path);
    expect(order.indexOf("/*")).toBeGreaterThan(order.indexOf("/search"));
  });

  it("points every route at an existing route module", () => {
    const missingFiles = routes
      .map((entry) => resolve(process.cwd(), "app", entry.file))
      .filter((file) => !existsSync(file));

    expect(missingFiles).toEqual([]);
  });
});
