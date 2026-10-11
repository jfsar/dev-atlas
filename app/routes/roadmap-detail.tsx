import { useMemo } from "react";
import { Link, isRouteErrorResponse } from "react-router";
import { ArrowRightIcon, ClockIcon } from "lucide-react";

import type { Route } from "./+types/roadmap-detail";
import { Markdown } from "~/components/markdown";
import { RoadmapGraph } from "~/components/roadmap-graph";
import { RoadmapOutline } from "~/components/roadmap-outline";
import { ErrorState, NotFoundState } from "~/components/states";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CardDescription, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatDifficulty, formatHours, pluralize } from "~/lib/format";
import {
  RELATIONSHIP_ORDER,
  buildGraphLayout,
  countTopicNodes,
  groupNodesBySection,
  relationshipMeta,
  type GraphEdgeInput,
  type GraphNodeInput,
  type GraphSectionInput,
} from "~/lib/roadmap-graph";
import { breadcrumbJsonLd, buildMeta, jsonLdScript } from "~/lib/seo";
import { getPublishedRoadmapBySlug } from "~/lib/services/roadmaps.server";

export async function loader({ params }: Route.LoaderArgs) {
  const roadmap = await getPublishedRoadmapBySlug(params.slug);
  if (!roadmap) {
    throw new Response("Roadmap not found", { status: 404 });
  }
  return roadmap;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return buildMeta({
      title: "Roadmap not found",
      path: "/roadmaps",
      noIndex: true,
    });
  }
  return buildMeta({
    title: data.seoTitle ?? data.title,
    description: data.seoDescription ?? data.summary,
    path: `/roadmaps/${data.slug}`,
    image: data.seoImage,
    type: "article",
  });
}

function toGraphInputs(
  roadmap: NonNullable<Route.ComponentProps["loaderData"]>,
) {
  const sections: GraphSectionInput[] = roadmap.sections.map((section) => ({
    id: section.id,
    title: section.title,
    color: section.color,
    order: section.order,
  }));
  const nodes: GraphNodeInput[] = roadmap.nodes.map((node) => ({
    id: node.id,
    title: node.title,
    summary: node.summary,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    required: node.required,
    order: node.order,
    difficulty: node.difficulty,
    estimatedMinutes: node.estimatedMinutes,
    sectionId: node.sectionId,
    topic: node.topic
      ? { slug: node.topic.slug, title: node.topic.title }
      : null,
  }));
  const edges: GraphEdgeInput[] = roadmap.edges.map((edge) => ({
    id: edge.id,
    sourceId: edge.sourceId,
    targetId: edge.targetId,
    relationship: edge.relationship,
  }));
  return { sections, nodes, edges };
}

export default function RoadmapDetail({ loaderData }: Route.ComponentProps) {
  const roadmap = loaderData;
  const { sections, nodes, edges } = useMemo(
    () => toGraphInputs(roadmap),
    [roadmap],
  );
  const layout = useMemo(
    () => buildGraphLayout(sections, nodes, edges),
    [sections, nodes, edges],
  );
  const outlineGroups = useMemo(
    () => groupNodesBySection(sections, nodes),
    [sections, nodes],
  );

  const difficulty = formatDifficulty(roadmap.difficulty);
  const duration = formatHours(roadmap.estimatedHours);
  const topicCount = countTopicNodes(nodes);
  const relationshipTypes = new Set(edges.map((edge) => edge.relationship));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Roadmaps", path: "/roadmaps" },
              { name: roadmap.title, path: `/roadmaps/${roadmap.slug}` },
            ]),
          ),
        }}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/roadmaps">Roadmaps</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{roadmap.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-6 max-w-3xl">
        <div className="flex items-center gap-3">
          {roadmap.icon ? (
            <span aria-hidden className="text-3xl">
              {roadmap.icon}
            </span>
          ) : null}
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            {roadmap.title}
          </h1>
        </div>
        <p className="mt-3 text-lg text-pretty text-muted-foreground">
          {roadmap.summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {difficulty ? <Badge variant="secondary">{difficulty}</Badge> : null}
          {duration ? (
            <Badge variant="secondary">
              <ClockIcon aria-hidden />
              {duration}
            </Badge>
          ) : null}
          <Badge variant="secondary">
            {topicCount} {pluralize(topicCount, "topic")}
          </Badge>
          {roadmap.categories.map((category) => (
            <Badge key={category.slug} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      </header>

      {roadmap.description ? (
        <Markdown content={roadmap.description} className="mt-8 max-w-3xl" />
      ) : null}

      {(roadmap.audience || roadmap.prerequisiteNotes) && (
        <div className="mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
          {roadmap.audience ? (
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Who this is for
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {roadmap.audience}
              </p>
            </div>
          ) : null}
          {roadmap.prerequisiteNotes ? (
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Prerequisites
              </h2>
              <Markdown
                content={roadmap.prerequisiteNotes}
                className="prose-sm mt-2"
              />
            </div>
          ) : null}
        </div>
      )}

      <section aria-labelledby="graph-heading" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="graph-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Interactive roadmap
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag to pan, scroll to zoom, and select a node to open its topic.
              Prefer a list?{" "}
              <a href="#outline" className="underline underline-offset-4">
                Jump to the outline
              </a>
              .
            </p>
          </div>
          {relationshipTypes.size > 0 ? (
            <ul
              aria-label="Edge relationships"
              className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
            >
              {RELATIONSHIP_ORDER.filter((type) =>
                relationshipTypes.has(type),
              ).map((type) => (
                <li key={type} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-0.5 w-4 rounded"
                    style={{ backgroundColor: relationshipMeta[type].stroke }}
                  />
                  {relationshipMeta[type].label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-4">
          <RoadmapGraph
            layout={layout}
            className="h-[70vh] min-h-[520px] w-full"
          />
        </div>
      </section>

      <section
        id="outline"
        aria-labelledby="outline-heading"
        className="mt-12 scroll-mt-20"
      >
        <h2
          id="outline-heading"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          Outline
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every node on the graph, grouped by section and linked to its topic.
        </p>
        <div className="mt-5">
          <RoadmapOutline groups={outlineGroups} />
        </div>
      </section>

      {(roadmap.related.projects.length > 0 ||
        roadmap.related.domains.length > 0) && (
        <section aria-labelledby="related-heading" className="mt-12">
          <h2
            id="related-heading"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Related content
          </h2>
          <div className="mt-5 grid gap-8 lg:grid-cols-2">
            {roadmap.related.projects.length > 0 ? (
              <div>
                <h3 className="font-heading text-lg font-medium">
                  Projects to practice
                </h3>
                <ul className="mt-3 space-y-3">
                  {roadmap.related.projects.map((project) => (
                    <li key={project.slug}>
                      <Link
                        to={`/projects/${project.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20"
                      >
                        <span className="min-w-0">
                          <CardTitle className="text-sm group-hover:underline">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="mt-0.5 line-clamp-2">
                            {project.summary}
                          </CardDescription>
                        </span>
                        <ArrowRightIcon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {roadmap.related.domains.length > 0 ? (
              <div>
                <h3 className="font-heading text-lg font-medium">
                  Business domains
                </h3>
                <ul className="mt-3 space-y-3">
                  {roadmap.related.domains.map((domain) => (
                    <li key={domain.slug}>
                      <Link
                        to={`/business-domains/${domain.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20"
                      >
                        <span className="min-w-0">
                          <CardTitle className="text-sm group-hover:underline">
                            {domain.title}
                          </CardTitle>
                          <CardDescription className="mt-0.5 line-clamp-2">
                            {domain.summary}
                          </CardDescription>
                        </span>
                        <ArrowRightIcon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      <Separator className="mt-12" />
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/roadmaps">Back to all roadmaps</Link>
        </Button>
        <Button asChild>
          <Link to="/search">Search related topics</Link>
        </Button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <NotFoundState
          title="Roadmap not found"
          description="This roadmap doesn’t exist or hasn’t been published yet."
          action={
            <Button asChild>
              <Link to="/roadmaps">Browse roadmaps</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ErrorState
      title="Could not load this roadmap"
      description="Something went wrong while loading the roadmap. Please try again."
      action={
        <Button asChild variant="outline">
          <Link to="/roadmaps">Back to roadmaps</Link>
        </Button>
      }
    />
  );
}
