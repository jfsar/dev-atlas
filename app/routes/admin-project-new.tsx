import { Link, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-project-new";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { ProjectForm } from "~/components/admin/project-form";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listDomainOptions } from "~/lib/services/admin/business-domains.server";
import { listCategoryOptions } from "~/lib/services/admin/categories.server";
import {
  milestonesFromFormValue,
  parseProjectForm,
} from "~/lib/services/admin/parse.project";
import { createProject } from "~/lib/services/admin/projects.server";
import { formDataToValues } from "~/lib/services/admin/shared";
import {
  listResourceOptions,
  listTopicOptions,
} from "~/lib/services/admin/topics.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [categories, topics, domains, resources] = await Promise.all([
    listCategoryOptions(),
    listTopicOptions(),
    listDomainOptions(),
    listResourceOptions(),
  ]);
  return { categories, topics, domains, resources };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New project · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const parsed = parseProjectForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await createProject(parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/projects/${result.id}`);
}

export default function AdminProjectNew({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories, topics, domains, resources } = loaderData;

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
        title="New project"
        description="Write a build brief with milestones and related content."
      />

      <ActionAlerts data={actionData} />

      <ProjectForm
        categories={categories}
        topics={topics}
        domains={domains}
        resources={resources}
        defaults={{
          slug: "",
          title: "",
          summary: "",
          scenario: "",
          difficulty: "",
          estimatedHours: "",
          learningGoals: "",
          requirements: "",
          features: "",
          architectureNotes: "",
          databaseNotes: "",
          apiNotes: "",
          testingNotes: "",
          seoTitle: "",
          seoDescription: "",
          seoImage: "",
          categorySlugs: [],
          topicSlugs: [],
          domainSlugs: [],
          resourceIds: [],
        }}
        milestones={milestonesFromFormValue(actionData?.values?.milestones, [])}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Create project"
      />
    </div>
  );
}
