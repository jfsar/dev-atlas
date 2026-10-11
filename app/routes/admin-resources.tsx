import { Link, redirect } from "react-router";
import { PlusIcon } from "lucide-react";

import type { Route } from "./+types/admin-resources";
import { AdminPageHeader } from "~/components/admin/admin-page-header";
import { DeleteForm } from "~/components/admin/delete-form";
import { ListToolbar } from "~/components/admin/list-toolbar";
import { Pagination } from "~/components/admin/pagination";
import { StatusBadge } from "~/components/admin/status-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatResourceKind } from "~/lib/format";
import { requireAdmin } from "~/lib/session.server";
import { deleteResource } from "~/lib/services/admin/resources.server";
import { listAdminResources } from "~/lib/services/admin/resources.server";
import { formText, parseAdminListParams } from "~/lib/services/admin/shared";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const params = parseAdminListParams(request);
  const list = await listAdminResources(params);
  return { list, params };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resources · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = formText(form, "id");
  if (form.get("intent") === "delete" && id) {
    await deleteResource(id);
  }
  throw redirect("/admin/resources");
}

export default function AdminResources({ loaderData }: Route.ComponentProps) {
  const { list, params } = loaderData;

  const makeHref = (page: number) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return `/admin/resources${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Resources"
        description="External links attached to topics, projects, and business domains."
        actions={
          <Button asChild>
            <Link to="/admin/resources/new">
              <PlusIcon aria-hidden />
              New resource
            </Link>
          </Button>
        }
      />

      <ListToolbar
        action="/admin/resources"
        q={params.q}
        status={params.status}
        placeholder="Search resources…"
      />

      {list.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resources found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="max-w-xs">
                    <Link
                      to={`/admin/resources/${resource.id}`}
                      className="font-medium hover:underline"
                    >
                      {resource.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {resource.url}
                    </p>
                  </TableCell>
                  <TableCell>{formatResourceKind(resource.kind)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resource.categories.map((category) => (
                        <Badge key={category.slug} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={resource.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {resource.updatedAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/resources/${resource.id}`}>Edit</Link>
                      </Button>
                      <DeleteForm
                        action="/admin/resources"
                        id={resource.id}
                        name={resource.title}
                        label="Delete"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={list.meta.page}
        pageCount={list.meta.pageCount}
        makeHref={makeHref}
      />
    </div>
  );
}
