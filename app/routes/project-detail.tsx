import { Link, isRouteErrorResponse } from "react-router";
import { ClockIcon, ListChecksIcon } from "lucide-react";

import type { Route } from "./+types/project-detail";
import { EntityLinkList } from "~/components/entity-link-list";
import { Markdown } from "~/components/markdown";
import { PageBreadcrumbs } from "~/components/page-breadcrumbs";
import { ResourceLinks } from "~/components/resource-links";
import { ErrorState, NotFoundState } from "~/components/states";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatDifficulty, formatHours, pluralize } from "~/lib/format";
import { breadcrumbJsonLd, buildMeta, jsonLdScript } from "~/lib/seo";
import { getPublishedProjectBySlug } from "~/lib/services/projects.server";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }
  return project;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return buildMeta({
      title: "Project not found",
      path: "/projects",
      noIndex: true,
    });
  }
  return buildMeta({
    title: data.seoTitle ?? data.title,
    description: data.seoDescription ?? data.summary,
    path: `/projects/${data.slug}`,
    image: data.seoImage,
    type: "article",
  });
}

function MarkdownSection({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2
        id={id}
        className="font-heading text-2xl font-semibold tracking-tight"
      >
        {title}
      </h2>
      <div className="mt-4">
        <Markdown content={content} />
      </div>
    </section>
  );
}

export default function ProjectDetail({ loaderData }: Route.ComponentProps) {
  const project = loaderData;

  const difficulty = formatDifficulty(project.difficulty);
  const duration = formatHours(project.estimatedHours);

  const relatedTopics = project.topics.map((item) => ({
    to: `/topics/${item.slug}`,
    title: item.title,
    summary: item.summary,
    meta: formatDifficulty(item.difficulty) ?? undefined,
  }));
  const relatedDomains = project.domains.map((item) => ({
    to: `/business-domains/${item.slug}`,
    title: item.title,
    summary: item.summary,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Projects", path: "/projects" },
              { name: project.title, path: `/projects/${project.slug}` },
            ]),
          ),
        }}
      />

      <PageBreadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Projects", to: "/projects" },
          { label: project.title },
        ]}
      />

      <article className="mt-6">
        <header>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            {project.title}
          </h1>
          <p className="mt-3 text-lg text-pretty text-muted-foreground">
            {project.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {difficulty ? (
              <Badge variant="secondary">{difficulty}</Badge>
            ) : null}
            {duration ? (
              <Badge variant="secondary">
                <ClockIcon aria-hidden />
                {duration}
              </Badge>
            ) : null}
            <Badge variant="secondary">
              <ListChecksIcon aria-hidden />
              {project.milestones.length}{" "}
              {pluralize(project.milestones.length, "milestone")}
            </Badge>
            {project.categories.map((category) => (
              <Badge key={category.slug} variant="outline">
                {category.name}
              </Badge>
            ))}
          </div>
        </header>

        {project.scenario ? (
          <section aria-labelledby="scenario-heading" className="mt-10">
            <h2
              id="scenario-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Scenario
            </h2>
            <div className="mt-4">
              <Markdown content={project.scenario} />
            </div>
          </section>
        ) : null}

        <MarkdownSection
          id="goals-heading"
          title="Learning goals"
          content={project.learningGoals}
        />
        <MarkdownSection
          id="requirements-heading"
          title="Requirements"
          content={project.requirements}
        />
        <MarkdownSection
          id="features-heading"
          title="Features"
          content={project.features}
        />

        {project.milestones.length > 0 ? (
          <section aria-labelledby="milestones-heading" className="mt-10">
            <h2
              id="milestones-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Milestones
            </h2>
            <ol className="mt-6 space-y-6 border-l pl-6">
              {project.milestones.map((milestone, index) => (
                <li key={milestone.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[31px] flex size-6 items-center justify-center rounded-full border bg-background text-xs font-medium"
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-heading text-lg font-medium">
                    {milestone.title}
                  </h3>
                  {milestone.body ? (
                    <div className="mt-2">
                      <Markdown content={milestone.body} className="prose-sm" />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <MarkdownSection
          id="architecture-heading"
          title="Architecture notes"
          content={project.architectureNotes}
        />
        <MarkdownSection
          id="database-heading"
          title="Database notes"
          content={project.databaseNotes}
        />
        <MarkdownSection
          id="api-heading"
          title="API notes"
          content={project.apiNotes}
        />
        <MarkdownSection
          id="testing-heading"
          title="Testing notes"
          content={project.testingNotes}
        />

        <section aria-labelledby="project-resources-heading" className="mt-10">
          <h2
            id="project-resources-heading"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Resources
          </h2>
          <div className="mt-4">
            <ResourceLinks resources={project.resources} />
          </div>
        </section>

        {(relatedTopics.length > 0 || relatedDomains.length > 0) && (
          <section aria-labelledby="project-related-heading" className="mt-10">
            <h2
              id="project-related-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Related content
            </h2>
            <div className="mt-4 grid gap-8 md:grid-cols-2">
              {relatedTopics.length > 0 ? (
                <div>
                  <h3 className="font-heading text-lg font-medium">Topics</h3>
                  <div className="mt-3">
                    <EntityLinkList items={relatedTopics} />
                  </div>
                </div>
              ) : null}
              {relatedDomains.length > 0 ? (
                <div>
                  <h3 className="font-heading text-lg font-medium">
                    Business domains
                  </h3>
                  <div className="mt-3">
                    <EntityLinkList items={relatedDomains} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        <Separator className="mt-10" />
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/projects">All projects</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <NotFoundState
          title="Project not found"
          description="This project doesn’t exist or hasn’t been published yet."
          action={
            <Button asChild>
              <Link to="/projects">Browse projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ErrorState
      title="Could not load this project"
      description="Something went wrong while loading the project. Please try again."
      action={
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      }
    />
  );
}
