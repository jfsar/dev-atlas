import { Link } from "react-router";
import { MapIcon } from "lucide-react";

import type { Route } from "./+types/roadmaps";
import { CategoryFilter } from "~/components/category-filter";
import { RoadmapCard } from "~/components/roadmap-card";
import { EmptyState } from "~/components/states";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { buildMeta } from "~/lib/seo";
import {
  listPublishedRoadmaps,
  listRoadmapCategories,
} from "~/lib/services/roadmaps.server";

export async function loader({ request }: Route.LoaderArgs) {
  const category =
    new URL(request.url).searchParams.get("category") ?? undefined;
  const [roadmaps, categories] = await Promise.all([
    listPublishedRoadmaps({ categorySlug: category }),
    listRoadmapCategories(),
  ]);
  return { roadmaps, categories, activeCategory: category ?? null };
}

export function meta({}: Route.MetaArgs) {
  return buildMeta({
    title: "Roadmaps",
    description:
      "Browse curated, interactive developer roadmaps with prerequisites, recommended paths, and optional next steps.",
    path: "/roadmaps",
  });
}

export default function RoadmapsIndex({ loaderData }: Route.ComponentProps) {
  const { roadmaps, categories, activeCategory } = loaderData;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Developer roadmaps
        </h1>
        <p className="mt-3 text-muted-foreground">
          Step-by-step paths that show what to learn, in what order, and why.
          Open any roadmap to explore the interactive graph or read the outline.
        </p>
      </header>

      {categories.length > 0 ? (
        <CategoryFilter
          basePath="/roadmaps"
          categories={categories}
          activeCategory={activeCategory}
          label="Filter roadmaps by category"
        />
      ) : null}

      <div className="mt-8">
        {roadmaps.length === 0 ? (
          <EmptyState
            title="No roadmaps found"
            description={
              activeCategory
                ? "No published roadmaps in this category yet. Try another category."
                : "Published roadmaps will appear here."
            }
            icon={<MapIcon aria-hidden />}
            action={
              activeCategory ? (
                <Button asChild variant="outline">
                  <Link to="/roadmaps">Clear filter</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground" role="status">
              {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"}
              {activeCategory ? " in this category" : ""}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <li key={roadmap.slug}>
                  <RoadmapCard roadmap={roadmap} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {activeCategory ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Filtering by{" "}
          <Badge variant="secondary">
            {categories.find((c) => c.slug === activeCategory)?.name ??
              activeCategory}
          </Badge>
        </p>
      ) : null}
    </div>
  );
}
