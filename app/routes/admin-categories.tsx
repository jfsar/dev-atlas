import { Form, Link, redirect } from "react-router";
import { TagsIcon } from "lucide-react";

import type { Route } from "./+types/admin-categories";
import { ActionAlerts } from "~/components/admin/action-alerts";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { FieldError } from "~/components/admin/field-error";
import { SlugFields } from "~/components/admin/slug-fields";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { requireAdmin } from "~/lib/session.server";
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
} from "~/lib/services/admin/categories.server";
import { parseCategoryForm } from "~/lib/services/admin/parse";
import {
  formDataToValues,
  formText,
  valueOf,
} from "~/lib/services/admin/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const categories = await listAdminCategories();
  return { categories };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Categories · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    const id = formText(form, "id");
    if (id) await deleteCategory(id);
    throw redirect("/admin/categories");
  }

  const parsed = parseCategoryForm(form);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors, values: formDataToValues(form) };
  }

  const result = await createCategory(parsed.data);
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: formDataToValues(form) };
  }
  throw redirect("/admin/categories");
}

export default function AdminCategories({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories } = loaderData;
  const errors = actionData?.fieldErrors;
  const values = actionData?.values;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Shared taxonomy used across roadmaps, topics, projects, domains, and resources."
      />

      <ActionAlerts data={actionData} />

      <section
        aria-labelledby="new-category"
        className="rounded-xl border bg-card p-4"
      >
        <h2 id="new-category" className="font-heading text-lg font-medium">
          New category
        </h2>
        <Form method="post" className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="intent" value="create" />
          <div className="sm:col-span-2 sm:max-w-md">
            <SlugFields
              titleLabel="Name"
              titleName="name"
              defaultTitle={valueOf(values, "name")}
              defaultSlug={valueOf(values, "slug")}
              titleError={errors?.name}
              slugError={errors?.slug}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min={0}
              defaultValue={valueOf(values, "order", "0")}
            />
            <FieldError messages={errors?.order} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={valueOf(values, "description")}
            />
            <FieldError messages={errors?.description} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Create category</Button>
          </div>
        </Form>
      </section>

      <section aria-label="Categories list">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Content</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <TagsIcon
                          className="size-4 text-muted-foreground"
                          aria-hidden
                        />
                        {category.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-right">
                      {category.usage}
                    </TableCell>
                    <TableCell className="text-right">
                      {category.order}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/categories/${category.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <DeleteForm
                          action="/admin/categories"
                          id={category.id}
                          name={category.name}
                          label="Delete"
                          description="Removing a category detaches it from all content. This cannot be undone."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
