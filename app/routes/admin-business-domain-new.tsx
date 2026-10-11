import { Link, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-business-domain-new";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DomainForm } from "~/components/admin/domain-form";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { createDomain } from "~/lib/services/admin/business-domains.server";
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

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [categories, topics, projects, resources] = await Promise.all([
    listCategoryOptions(),
    listTopicOptions(),
    listProjectOptions(),
    listResourceOptions(),
  ]);
  return { categories, topics, projects, resources };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New business domain · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const parsed = parseDomainForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await createDomain(parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/business-domains/${result.id}`);
}

export default function AdminBusinessDomainNew({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories, topics, projects, resources } = loaderData;

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
        title="New business domain"
        description="Define a domain and map it to related learning content."
      />

      <ActionAlerts data={actionData} />

      <DomainForm
        categories={categories}
        topics={topics}
        projects={projects}
        resources={resources}
        defaults={{
          slug: "",
          title: "",
          summary: "",
          definition: "",
          developerRelevance: "",
          seoTitle: "",
          seoDescription: "",
          seoImage: "",
          categorySlugs: [],
          topicSlugs: [],
          resourceIds: [],
          projectSlugs: [],
        }}
        points={domainPointsFromFormValue(actionData?.values?.points, [])}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Create domain"
      />
    </div>
  );
}
