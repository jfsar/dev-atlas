import { Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-project-edit";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { ProjectForm } from "~/components/admin/project-form";
import { StatusActions } from "~/components/admin/status-actions";
import { StatusBadge } from "~/components/admin/status-badge";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listDomainOptions } from "~/lib/services/admin/business-domains.server";
import { listCategoryOptions } from "~/lib/services/admin/categories.server";
import {
  milestonesFromFormValue,
  parseProjectForm,
} from "~/lib/services/admin/parse.project";
import {
  deleteProject,
  getAdminProject,
  setProjectStatus,
  updateProject,
} from "~/lib/services/admin/projects.server";
import { formDataToValues } from "~/lib/services/admin/shared";
import {
  listResourceOptions,
  listTopicOptions,
} from "~/lib/services/admin/topics.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [project, categories, topics, domains, resources] = await Promise.all([
    getAdminProject(params.id),
    listCategoryOptions(),
    listTopicOptions(),
    listDomainOptions(),
    listResourceOptions(),
  ]);
  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }
  return { project, categories, topics, domains, resources };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit project · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    await deleteProject(params.id);
    throw redirect("/admin/projects");
  }

  if (intent === "publish" || intent === "draft" || intent === "archive") {
    const status =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : "ARCHIVED";
    const result = await setProjectStatus(params.id, status);
    if (!result.ok) return { issues: result.issues };
    throw redirect(`/admin/projects/${params.id}`);
  }

  const parsed = parseProjectForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await updateProject(params.id, parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/projects/${params.id}`);
}

export default function AdminProjectEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { project, categories, topics, domains, resources } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/projects">
            <ArrowLeftIcon aria-hidden />
            Projects
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={project.title}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={project.status} />
            <span>
              {project.milestoneCount} milestones · /projects/{project.slug}
            </span>
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusActions
          action={`/admin/projects/${project.id}`}
          id={project.id}
          status={project.status}
        />
        <DeleteForm
          action={`/admin/projects/${project.id}`}
          id={project.id}
          name={project.title}
          label="Delete"
        />
      </div>

      <ActionAlerts data={actionData} />

      <ProjectForm
        categories={categories}
        topics={topics}
        domains={domains}
        resources={resources}
        defaults={{
          slug: project.slug,
          title: project.title,
          summary: project.summary,
          scenario: project.scenario,
          difficulty: project.difficulty ?? "",
          estimatedHours:
            project.estimatedHours === undefined
              ? ""
              : String(project.estimatedHours),
          learningGoals: project.learningGoals ?? "",
          requirements: project.requirements ?? "",
          features: project.features ?? "",
          architectureNotes: project.architectureNotes ?? "",
          databaseNotes: project.databaseNotes ?? "",
          apiNotes: project.apiNotes ?? "",
          testingNotes: project.testingNotes ?? "",
          seoTitle: project.seoTitle ?? "",
          seoDescription: project.seoDescription ?? "",
          seoImage: project.seoImage ?? "",
          categorySlugs: project.categorySlugs,
          topicSlugs: project.topicSlugs,
          domainSlugs: project.domainSlugs,
          resourceIds: project.resourceIds,
        }}
        milestones={milestonesFromFormValue(
          actionData?.values?.milestones,
          project.milestones.map((milestone) => ({
            id: milestone.id,
            title: milestone.title,
            body: milestone.body ?? "",
          })),
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
      title={notFound ? "Project not found" : "Something went wrong"}
      description={
        notFound
          ? "This project may have been deleted."
          : "We could not load this project. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/projects">Back to projects</Link>
        </Button>
      }
    />
  );
}
