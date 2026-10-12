import { Link, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-roadmap-new";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { RoadmapForm } from "~/components/admin/roadmap-form";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listAdminCategories } from "~/lib/services/admin/categories.server";
import { parseRoadmapForm } from "~/lib/services/admin/parse";
import { createRoadmap } from "~/lib/services/admin/roadmaps.server";
import { formDataToValues } from "~/lib/services/admin/shared";
import { listTopicOptions } from "~/lib/services/admin/topics.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [categories, topics] = await Promise.all([
    listAdminCategories(),
    listTopicOptions(),
  ]);
  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
    topics: topics.map((t) => ({ slug: t.slug, title: t.title })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New roadmap · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const parsed = parseRoadmapForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await createRoadmap(parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/roadmaps/${result.id}`);
}

export default function AdminRoadmapNew({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories, topics } = loaderData;

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
        title="New roadmap"
        description="Create the roadmap shell. Add nodes and edges in the visual editor next."
      />

      <ActionAlerts data={actionData} />

      <RoadmapForm
        categories={categories}
        topics={topics}
        defaults={{
          slug: "",
          title: "",
          summary: "",
          description: "",
          audience: "",
          prerequisiteNotes: "",
          difficulty: "",
          estimatedHours: "",
          icon: "",
          featured: false,
          order: 0,
          seoTitle: "",
          seoDescription: "",
          seoImage: "",
          categorySlugs: [],
          relatedTopicSlugs: [],
        }}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Create roadmap"
      />
    </div>
  );
}
