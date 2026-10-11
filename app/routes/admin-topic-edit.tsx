import { Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-topic-edit";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { StatusActions } from "~/components/admin/status-actions";
import { StatusBadge } from "~/components/admin/status-badge";
import { TopicForm } from "~/components/admin/topic-form";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { listCategoryOptions } from "~/lib/services/admin/categories.server";
import { parseTopicForm } from "~/lib/services/admin/parse.topic";
import {
  deleteTopic,
  getAdminTopic,
  listResourceOptions,
  listTopicOptions,
  setTopicStatus,
  updateTopic,
} from "~/lib/services/admin/topics.server";
import { blocksFromFormValue } from "~/lib/services/admin/topic-utils";
import { formDataToValues } from "~/lib/services/admin/shared";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const [topic, categories, topics, resources] = await Promise.all([
    getAdminTopic(params.id),
    listCategoryOptions(),
    listTopicOptions(),
    listResourceOptions(),
  ]);
  if (!topic) {
    throw new Response("Topic not found", { status: 404 });
  }
  return { topic, categories, topics, resources };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit topic · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    await deleteTopic(params.id);
    throw redirect("/admin/topics");
  }

  if (intent === "publish" || intent === "draft" || intent === "archive") {
    const status =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : "ARCHIVED";
    const result = await setTopicStatus(params.id, status);
    if (!result.ok) return { issues: result.issues };
    throw redirect(`/admin/topics/${params.id}`);
  }

  const parsed = parseTopicForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }
  const result = await updateTopic(params.id, parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect(`/admin/topics/${params.id}`);
}

export default function AdminTopicEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { topic, categories, topics, resources } = loaderData;

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
        title={topic.title}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={topic.status} />
            <span>
              {topic.blockCount} blocks · /topics/{topic.slug}
            </span>
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusActions
          action={`/admin/topics/${topic.id}`}
          id={topic.id}
          status={topic.status}
        />
        <DeleteForm
          action={`/admin/topics/${topic.id}`}
          id={topic.id}
          name={topic.title}
          label="Delete"
        />
      </div>

      <ActionAlerts data={actionData} />

      <TopicForm
        categories={categories}
        topics={topics}
        resources={resources}
        defaults={{
          slug: topic.slug,
          title: topic.title,
          summary: topic.summary,
          difficulty: topic.difficulty ?? "",
          estimatedMinutes:
            topic.estimatedMinutes === undefined
              ? ""
              : String(topic.estimatedMinutes),
          seoTitle: topic.seoTitle ?? "",
          seoDescription: topic.seoDescription ?? "",
          seoImage: topic.seoImage ?? "",
          categorySlugs: topic.categorySlugs,
          relatedSlugs: topic.relatedSlugs,
          resourceIds: topic.resourceIds,
        }}
        blocks={blocksFromFormValue(actionData?.values?.blocks, topic.blocks)}
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
      title={notFound ? "Topic not found" : "Something went wrong"}
      description={
        notFound
          ? "This topic may have been deleted."
          : "We could not load this topic. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/topics">Back to topics</Link>
        </Button>
      }
    />
  );
}
