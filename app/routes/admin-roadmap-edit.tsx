import { Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-roadmap-edit";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { RoadmapForm } from "~/components/admin/roadmap-form";
import type { SectionFormValue } from "~/components/admin/sections-editor";
import { StatusActions } from "~/components/admin/status-actions";
import { StatusBadge } from "~/components/admin/status-badge";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listAdminCategories } from "~/lib/services/admin/categories.server";
import {
  parseRoadmapForm,
  parseRoadmapSectionsForm,
} from "~/lib/services/admin/parse";
import {
  deleteRoadmap,
  getAdminRoadmap,
  setRoadmapStatus,
  updateRoadmap,
  updateRoadmapSections,
} from "~/lib/services/admin/roadmaps.server";
import { formDataToValues } from "~/lib/services/admin/shared";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [roadmap, categories] = await Promise.all([
    getAdminRoadmap(params.id),
    listAdminCategories(),
  ]);
  if (!roadmap) {
    throw new Response("Roadmap not found", { status: 404 });
  }
  return {
    roadmap,
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit roadmap · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    await deleteRoadmap(params.id);
    throw redirect("/admin/roadmaps");
  }

  if (intent === "publish" || intent === "draft" || intent === "archive") {
    const status =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : "ARCHIVED";
    const result = await setRoadmapStatus(params.id, status);
    if (!result.ok) return { issues: result.issues };
    throw redirect(`/admin/roadmaps/${params.id}`);
  }

  const parsed = parseRoadmapForm(form);
  const sectionsParsed = parseRoadmapSectionsForm(form, params.id);
  if (!parsed.success || !sectionsParsed.success) {
    return {
      fieldErrors: {
        ...(parsed.success ? {} : parsed.fieldErrors),
        ...(sectionsParsed.success ? {} : sectionsParsed.fieldErrors),
      },
      values: formDataToValues(form),
    };
  }

  const result = await updateRoadmap(params.id, parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  await updateRoadmapSections(params.id, sectionsParsed.data);
  throw redirect(`/admin/roadmaps/${params.id}`);
}

function sectionsFromValues(
  value: unknown,
  fallback: SectionFormValue[],
): SectionFormValue[] {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((entry) => {
      const record = (entry ?? {}) as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : "";
      return {
        ...(id ? { id } : {}),
        title: typeof record.title === "string" ? record.title : "",
        color: typeof record.color === "string" ? record.color : "",
      };
    });
  } catch {
    return fallback;
  }
}

export default function AdminRoadmapEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { roadmap, categories } = loaderData;
  const sectionsInitial = sectionsFromValues(
    actionData?.values?.sections,
    roadmap.sections.map((section) => ({
      id: section.id,
      title: section.title,
      color: section.color ?? "",
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/roadmaps">
            <ArrowLeftIcon aria-hidden />
            Roadmaps
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={roadmap.title}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge
              status={roadmap.status === "DRAFT" ? "DRAFT" : roadmap.status}
            />
            <span>
              {roadmap.nodeCount} nodes · {roadmap.edgeCount} edges ·{" "}
              {roadmap.sections.length} sections
            </span>
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <Link to={`/admin/roadmaps/${roadmap.id}/editor`}>
              Open visual editor
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusActions
          action={`/admin/roadmaps/${roadmap.id}`}
          id={roadmap.id}
          status={roadmap.status}
        />
        <DeleteForm
          action={`/admin/roadmaps/${roadmap.id}`}
          id={roadmap.id}
          name={roadmap.title}
          label="Delete"
        />
      </div>

      <ActionAlerts data={actionData} />

      <RoadmapForm
        categories={categories}
        defaults={{
          slug: roadmap.slug,
          title: roadmap.title,
          summary: roadmap.summary,
          description: roadmap.description ?? "",
          audience: roadmap.audience ?? "",
          prerequisiteNotes: roadmap.prerequisiteNotes ?? "",
          difficulty: roadmap.difficulty ?? "",
          estimatedHours:
            roadmap.estimatedHours === undefined
              ? ""
              : String(roadmap.estimatedHours),
          icon: roadmap.icon ?? "",
          featured: roadmap.featured,
          order: roadmap.order,
          seoTitle: roadmap.seoTitle ?? "",
          seoDescription: roadmap.seoDescription ?? "",
          seoImage: roadmap.seoImage ?? "",
          categorySlugs: roadmap.categorySlugs,
        }}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Save changes"
        sections={{
          initial: sectionsInitial,
          error: actionData?.fieldErrors?.sections,
        }}
      />
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
          : "We could not load this roadmap. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/roadmaps">Back to roadmaps</Link>
        </Button>
      }
    />
  );
}
