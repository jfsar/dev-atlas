import { Link, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-topic-new";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { TopicForm } from "~/components/admin/topic-form";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listCategoryOptions } from "~/lib/services/admin/categories.server";
import { parseTopicForm } from "~/lib/services/admin/parse.topic";
import {
  createTopic,
  listResourceOptions,
  listTopicOptions,
} from "~/lib/services/admin/topics.server";
import { blocksFromFormValue } from "~/lib/services/admin/topic-utils";
import { formDataToValues } from "~/lib/services/admin/shared";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [categories, topics, resources] = await Promise.all([
    listCategoryOptions(),
    listTopicOptions(),
    listResourceOptions(),
  ]);
  return { categories, topics, resources };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New topic · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const parsed = parseTopicForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await createTopic(parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/topics/${result.id}`);
}

export default function AdminTopicNew({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories, topics, resources } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/topics">
            <ArrowLeftIcon aria-hidden />
            Topics
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title="New topic"
        description="Write structured learning content and attach resources."
      />

      <ActionAlerts data={actionData} />

      <TopicForm
        categories={categories}
        topics={topics}
        resources={resources}
        defaults={{
          slug: "",
          title: "",
          summary: "",
          difficulty: "",
          estimatedMinutes: "",
          seoTitle: "",
          seoDescription: "",
          seoImage: "",
          categorySlugs: [],
          relatedSlugs: [],
          resourceIds: [],
        }}
        blocks={blocksFromFormValue(actionData?.values?.blocks, [])}
        errors={actionData?.fieldErrors}
        values={actionData?.values}
        submitLabel="Create topic"
      />
    </div>
  );
}
