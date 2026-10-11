import { Form, Link, isRouteErrorResponse, redirect } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import type { Route } from "./+types/admin-category-edit";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { FieldError } from "~/components/admin/field-error";
import { SlugFields } from "~/components/admin/slug-fields";
import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { requireAdmin } from "~/lib/session.server";
import {
  deleteCategory,
  getAdminCategory,
  updateCategory,
} from "~/lib/services/admin/categories.server";
import { parseCategoryForm } from "~/lib/services/admin/parse";
import { formDataToValues, valueOf } from "~/lib/services/admin/shared";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const category = await getAdminCategory(params.id);
  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }
  return { category };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit category · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    await deleteCategory(params.id);
    throw redirect("/admin/categories");
  }

  const parsed = parseCategoryForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }

  const result = await updateCategory(params.id, parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect("/admin/categories");
}

export default function AdminCategoryEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { category } = loaderData;
  const errors = actionData?.fieldErrors;
  const values = actionData?.values;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/categories">
            <ArrowLeftIcon aria-hidden />
            Categories
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={`Edit ${category.name}`}
        description={`${category.usage} content item(s) use this category.`}
        actions={
          <DeleteForm
            action={`/admin/categories/${category.id}`}
            id={category.id}
            name={category.name}
            label="Delete category"
            description="Removing a category detaches it from all content. This cannot be undone."
          />
        }
      />

      <ActionAlerts data={actionData} />

      <Form method="post" className="grid max-w-xl gap-4">
        <input type="hidden" name="intent" value="update" />
        <SlugFields
          titleLabel="Name"
          titleName="name"
          defaultTitle={valueOf(values, "name", category.name)}
          defaultSlug={valueOf(values, "slug", category.slug)}
          titleError={errors?.name}
          slugError={errors?.slug}
        />
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={valueOf(values, "order", String(category.order))}
          />
          <FieldError messages={errors?.order} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={valueOf(
              values,
              "description",
              category.description ?? "",
            )}
          />
          <FieldError messages={errors?.description} />
        </div>
        <div>
          <Button type="submit">Save changes</Button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <ErrorState
      title={notFound ? "Category not found" : "Something went wrong"}
      description={
        notFound
          ? "This category may have been deleted."
          : "We could not load this category. Please try again."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/admin/categories">Back to categories</Link>
        </Button>
      }
    />
  );
}
