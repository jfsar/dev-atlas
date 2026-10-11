import { Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-business-domain-edit";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { DomainForm } from "~/components/admin/domain-form";
import { StatusActions } from "~/components/admin/status-actions";
import { StatusBadge } from "~/components/admin/status-badge";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import {
  deleteDomain,
  getAdminDomain,
  setDomainStatus,
  updateDomain,
} from "~/lib/services/admin/business-domains.server";
import { listCategoryOptions } from "~/lib/services/admin/categories.server";
import {
  domainPointsFromFormValue,
  parseDomainForm,
} from "~/lib/services/admin/parse.domain";
import { listProjectOptions } from "~/lib/services/admin/projects.server";
import { formDataToValues } from "~/lib/services/admin/shared";
import {
  listResourceOptions,
  listTopicOptions,
} from "~/lib/services/admin/topics.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [domain, categories, topics, projects, resources] = await Promise.all([
    getAdminDomain(params.id),
    listCategoryOptions(),
    listTopicOptions(),
    listProjectOptions(),
    listResourceOptions(),
  ]);
  if (!domain) {
    throw new Response("Business domain not found", { status: 404 });
  }
  return { domain, categories, topics, projects, resources };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit business domain · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    await deleteDomain(params.id);
    throw redirect("/admin/business-domains");
  }

  if (intent === "publish" || intent === "draft" || intent === "archive") {
    const status =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : "ARCHIVED";
    const result = await setDomainStatus(params.id, status);
    if (!result.ok) return { issues: result.issues };
    throw redirect(`/admin/business-domains/${params.id}`);
  }

  const parsed = parseDomainForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await updateDomain(params.id, parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/business-domains/${params.id}`);
}

export default function AdminBusinessDomainEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { domain, categories, topics, projects, resources } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/business-domains">
            <ArrowLeftIcon aria-hidden />
            Business domains
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={domain.title}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={domain.status} />
            <span>
              {domain.pointCount} points · /business-domains/{domain.slug}
            </span>
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusActions
          action={`/admin/business-domains/${domain.id}`}
          id={domain.id}
          status={domain.status}
        />
        <DeleteForm
          action={`/admin/business-domains/${domain.id}`}
          id={domain.id}
          name={domain.title}
          label="Delete"
        />
      </div>

      <ActionAlerts data={actionData} />

      <DomainForm
        categories={categories}
        topics={topics}
        projects={projects}
        resources={resources}
        defaults={{
          slug: domain.slug,
          title: domain.title,
          summary: domain.summary,
          definition: domain.definition ?? "",
          developerRelevance: domain.developerRelevance ?? "",
          seoTitle: domain.seoTitle ?? "",
          seoDescription: domain.seoDescription ?? "",
          seoImage: domain.seoImage ?? "",
          categorySlugs: domain.categorySlugs,
          topicSlugs: domain.topicSlugs,
          resourceIds: domain.resourceIds,
          projectSlugs: domain.projectSlugs,
        }}
        points={domainPointsFromFormValue(
          actionData?.values?.points,
          domain.points,
        )}
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
      title={notFound ? "Business domain not found" : "Something went wrong"}
      description={
        notFound
          ? "This business domain may have been deleted."
          : "We could not load this business domain. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/business-domains">Back to business domains</Link>
        </Button>
      }
    />
  );
}
