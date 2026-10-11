import { Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

import type { Route } from "./+types/admin-resource-edit";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { ResourceForm } from "~/components/admin/resource-form";
import { StatusActions } from "~/components/admin/status-actions";
import { StatusBadge } from "~/components/admin/status-badge";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listAdminCategories } from "~/lib/services/admin/categories.server";
import { parseResourceForm } from "~/lib/services/admin/parse";
import {
  deleteResource,
  getAdminResource,
  setResourceStatus,
  updateResource,
} from "~/lib/services/admin/resources.server";
import { formDataToValues } from "~/lib/services/admin/shared";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [resource, categories] = await Promise.all([
    getAdminResource(params.id),
    listAdminCategories(),
  ]);
  if (!resource) {
    throw new Response("Resource not found", { status: 404 });
  }
  return {
    resource,
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit resource · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    await deleteResource(params.id);
    throw redirect("/admin/resources");
  }

  if (intent === "publish" || intent === "draft" || intent === "archive") {
    const status =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : "ARCHIVED";
    const result = await setResourceStatus(params.id, status);
    if (!result.ok) return { issues: result.issues };
    throw redirect(`/admin/resources/${params.id}`);
  }

  const parsed = parseResourceForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await updateResource(params.id, parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/resources/${params.id}`);
}

export default function AdminResourceEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { resource } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/resources">
            <ArrowLeftIcon aria-hidden />
            Resources
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={resource.title}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={resource.status} />
            <a
              href={resource.url}
              className="inline-flex items-center gap-1 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {resource.url}
              <ExternalLinkIcon className="size-3" aria-hidden />
            </a>
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusActions
          action={`/admin/resources/${resource.id}`}
          id={resource.id}
          status={resource.status}
        />
        <DeleteForm
          action={`/admin/resources/${resource.id}`}
          id={resource.id}
          name={resource.title}
          label="Delete"
        />
      </div>

      <ActionAlerts data={actionData} />

      <ResourceForm
        categories={loaderData.categories}
        defaults={{
          url: resource.url,
          title: resource.title,
          summary: resource.summary ?? "",
          kind: resource.kind,
          categorySlugs: resource.categorySlugs,
        }}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Save changes"
      />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <ErrorState
      title={notFound ? "Resource not found" : "Something went wrong"}
      description={
        notFound
          ? "This resource may have been deleted."
          : "We could not load this resource. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/resources">Back to resources</Link>
        </Button>
      }
    />
  );
}
