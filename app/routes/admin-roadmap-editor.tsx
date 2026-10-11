import { Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

import type { Route } from "./+types/admin-roadmap-editor";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { RoadmapEditor } from "~/components/admin/roadmap-editor";
import { StatusActions } from "~/components/admin/status-actions";
import { StatusBadge } from "~/components/admin/status-badge";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { logAuditEvent } from "~/lib/audit.server";
import { requireAdmin } from "~/lib/session.server";
import {
  getAdminRoadmapGraph,
  saveRoadmapGraph,
} from "~/lib/services/admin/roadmap-graph.server";
import { setRoadmapStatus } from "~/lib/services/admin/roadmaps.server";
import { formText } from "~/lib/services/admin/shared";
import { roadmapGraphSchema } from "~/lib/validation/roadmap";

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
    { title: "Roadmap editor · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "publish" || intent === "draft" || intent === "archive") {
    const status =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : "ARCHIVED";
    const result = await setRoadmapStatus(params.id, status);
    if (!result.ok) return { issues: result.issues };
    logAuditEvent({
      action: "roadmap.status",
      actorId: session.user.id,
      targetType: "roadmap",
      targetId: params.id,
      metadata: { status },
    });
    throw redirect(`/admin/roadmaps/${params.id}/editor`);
  }

  const raw = formText(form, "graph");
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { formError: "The graph could not be read. Please try again." };
  }

  const parsed = roadmapGraphSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  const result = await saveRoadmapGraph(parsed.data);
  if (!result.ok) {
    if ("conflict" in result) return { formError: result.message };
    return { issues: result.issues };
  }
  logAuditEvent({
    action: "roadmap.graph.save",
    actorId: session.user.id,
    targetType: "roadmap",
    targetId: params.id,
    metadata: {
      nodes: parsed.data.nodes.length,
      edges: parsed.data.edges.length,
      sections: parsed.data.sections.length,
    },
  });
  throw redirect(`/admin/roadmaps/${params.id}/editor`);
}

export default function AdminRoadmapEditor({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { graph } = loaderData;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/roadmaps">
            <ArrowLeftIcon aria-hidden />
            Roadmaps
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={`${graph.roadmap.title} · Editor`}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={graph.roadmap.status} />
            <span>
              {graph.nodes.length} nodes · {graph.edges.length} connections ·{" "}
              {graph.sections.length} sections
            </span>
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={`/admin/roadmaps/${graph.roadmap.id}`}>Metadata</Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                to={`/admin/roadmaps/${graph.roadmap.id}/preview`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon aria-hidden />
                Preview
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusActions
          action={`/admin/roadmaps/${graph.roadmap.id}/editor`}
          id={graph.roadmap.id}
          status={graph.roadmap.status}
        />
      </div>

      <ActionAlerts data={actionData} />

      <RoadmapEditor key={graph.roadmap.revision} graph={graph} />
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
          : "We could not load the editor. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/roadmaps">Back to roadmaps</Link>
        </Button>
      }
    />
  );
}
