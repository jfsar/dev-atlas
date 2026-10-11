import { Link, isRouteErrorResponse } from "react-router";
import { ArrowLeftIcon, ClockIcon } from "lucide-react";

import type { Route } from "./+types/admin-roadmap-preview";
import { RoadmapGraph } from "~/components/roadmap-graph";
import { RoadmapOutline } from "~/components/roadmap-outline";
import { ErrorState } from "~/components/states";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { requireAdmin } from "~/lib/session.server";
import { getAdminRoadmapGraph } from "~/lib/services/admin/roadmap-graph.server";
import { formatDifficulty, pluralize } from "~/lib/format";
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

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const graph = await getAdminRoadmapGraph(params.id);
  if (!graph) {
    throw new Response("Roadmap not found", { status: 404 });
  }
  return { graph };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roadmap preview · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminRoadmapPreview({
  loaderData,
}: Route.ComponentProps) {
  const { graph } = loaderData;
  const topicById = new Map(graph.topics.map((topic) => [topic.id, topic]));

  const sections: GraphSectionInput[] = graph.sections.map((section) => ({
    id: section.id,
    title: section.title,
    color: section.color,
    order: section.order,
  }));
  const nodes: GraphNodeInput[] = graph.nodes.map((node) => {
    const topic = node.topicId ? topicById.get(node.topicId) : undefined;
    return {
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
      topic: topic ? { slug: topic.slug, title: topic.title } : null,
    };
  });
  const edges: GraphEdgeInput[] = graph.edges.map((edge) => ({
    id: edge.id,
    sourceId: edge.sourceId,
    targetId: edge.targetId,
    relationship: edge.relationship,
  }));

  const layout = buildGraphLayout(sections, nodes, edges);
  const outlineGroups = groupNodesBySection(sections, nodes);
  const topicCount = countTopicNodes(nodes);
  const relationshipTypes = new Set(edges.map((edge) => edge.relationship));
  const difficulty = formatDifficulty(
    graph.nodes.find((node) => node.difficulty)?.difficulty ?? null,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to={`/admin/roadmaps/${graph.roadmap.id}/editor`}>
            <ArrowLeftIcon aria-hidden />
            Back to editor
          </Link>
        </Button>
        <Badge variant="secondary">Saved preview</Badge>
      </div>

      <header className="max-w-3xl">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {graph.roadmap.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {difficulty ? <Badge variant="secondary">{difficulty}</Badge> : null}
          <Badge variant="secondary">
            <ClockIcon aria-hidden />
            {graph.nodes.length} nodes
          </Badge>
          <Badge variant="secondary">
            {topicCount} {pluralize(topicCount, "topic")} linked
          </Badge>
        </div>
      </header>

      {relationshipTypes.size > 0 ? (
        <ul
          aria-label="Edge relationships"
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
        >
          {RELATIONSHIP_ORDER.filter((type) => relationshipTypes.has(type)).map(
            (type) => (
              <li key={type} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-0.5 w-4 rounded"
                  style={{ backgroundColor: relationshipMeta[type].stroke }}
                />
                {relationshipMeta[type].label}
              </li>
            ),
          )}
        </ul>
      ) : null}

      <RoadmapGraph layout={layout} className="h-[70vh] min-h-[520px] w-full" />

      <Separator />

      <section aria-labelledby="preview-outline-heading">
        <h2
          id="preview-outline-heading"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          Outline
        </h2>
        <div className="mt-4">
          <RoadmapOutline groups={outlineGroups} />
        </div>
      </section>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <ErrorState
      title={notFound ? "Roadmap not found" : "Something went wrong"}
      description={
        notFound
          ? "This roadmap may have been deleted."
          : "We could not load this preview. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/roadmaps">Back to roadmaps</Link>
        </Button>
      }
    />
  );
}
