import { Link, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-resource-new";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { ResourceForm } from "~/components/admin/resource-form";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { createResource } from "~/lib/services/admin/resources.server";
import { parseResourceForm } from "~/lib/services/admin/parse";
import { formDataToValues } from "~/lib/services/admin/shared";
import { listAdminCategories } from "~/lib/services/admin/categories.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const categories = await listAdminCategories();
  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New resource · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const parsed = parseResourceForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await createResource(parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect("/admin/resources");
}

export default function AdminResourceNew({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories } = loaderData;

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
        title="New resource"
        description="Add an external article, video, course, or tool."
      />

      <ActionAlerts data={actionData} />

      <ResourceForm
        categories={categories}
        defaults={{
          url: "",
          title: "",
          summary: "",
          kind: "ARTICLE",
          categorySlugs: [],
        }}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Create resource"
      />
    </div>
  );
}
