import { Link } from "react-router";
import { FolderKanbanIcon } from "lucide-react";

import type { Route } from "./+types/projects";
import { CategoryFilter } from "~/components/category-filter";
import { ProjectCard } from "~/components/project-card";
import { RouteErrorBoundary } from "~/components/route-error-boundary";
import { EmptyState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { buildMeta } from "~/lib/seo";
import {
  listProjectCategories,
  listPublishedProjects,
} from "~/lib/services/projects.server";

export async function loader({ request }: Route.LoaderArgs) {
  const category =
    new URL(request.url).searchParams.get("category") ?? undefined;
  const [projects, categories] = await Promise.all([
    listPublishedProjects({ categorySlug: category }),
    listProjectCategories(),
  ]);
  return { projects, categories, activeCategory: category ?? null };
}

export function meta({}: Route.MetaArgs) {
  return buildMeta({
    title: "Practice projects",
    description:
      "Hands-on project briefs with scenarios, requirements, milestones, and architecture notes to turn roadmap knowledge into shipped experience.",
    path: "/projects",
  });
}

export default function ProjectsIndex({ loaderData }: Route.ComponentProps) {
  const { projects, categories, activeCategory } = loaderData;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Practice projects
        </h1>
        <p className="mt-3 text-muted-foreground">
          Build realistic systems from a brief: scenario, requirements,
          features, and milestones that map back to the topics you’re learning.
        </p>
      </header>

      <CategoryFilter
        basePath="/projects"
        categories={categories}
        activeCategory={activeCategory}
        label="Filter projects by category"
      />

      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={
              activeCategory
                ? "No published projects in this category yet. Try another category."
                : "Published projects will appear here."
            }
            icon={<FolderKanbanIcon aria-hidden />}
            action={
              activeCategory ? (
                <Button asChild variant="outline">
                  <Link to="/projects">Clear filter</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground" role="status">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
              {activeCategory ? " in this category" : ""}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <RouteErrorBoundary
      title="Could not load projects"
      description="Something went wrong while loading projects. Please try again."
      actionLabel="Retry"
      actionTo="/projects"
    />
  );
}
