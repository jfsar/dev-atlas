import { Link, redirect } from "react-router";
import { PlusIcon, StarIcon } from "lucide-react";

import type { Route } from "./+types/admin-roadmaps";
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
import { formatDifficulty } from "~/lib/format";
import { requireAdmin } from "~/lib/session.server";
import {
  deleteRoadmap,
  listAdminRoadmaps,
} from "~/lib/services/admin/roadmaps.server";
import { formText, parseAdminListParams } from "~/lib/services/admin/shared";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const params = parseAdminListParams(request);
  const list = await listAdminRoadmaps(params);
  return { list, params };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roadmaps · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = formText(form, "id");
  if (form.get("intent") === "delete" && id) {
    await deleteRoadmap(id);
  }
  throw redirect("/admin/roadmaps");
}

export default function AdminRoadmaps({ loaderData }: Route.ComponentProps) {
  const { list, params } = loaderData;

  const makeHref = (page: number) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return `/admin/roadmaps${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roadmaps"
        description="Interactive learning paths. Manage metadata here; edit the graph in the visual editor."
        actions={
          <Button asChild>
            <Link to="/admin/roadmaps/new">
              <PlusIcon aria-hidden />
              New roadmap
            </Link>
          </Button>
        }
      />

      <ListToolbar
        action="/admin/roadmaps"
        q={params.q}
        status={params.status}
        placeholder="Search roadmaps…"
      />

      {list.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roadmaps found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Nodes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((roadmap) => (
                <TableRow key={roadmap.id}>
                  <TableCell className="max-w-xs">
                    <Link
                      to={`/admin/roadmaps/${roadmap.id}`}
                      className="inline-flex items-center gap-1 font-medium hover:underline"
                    >
                      {roadmap.featured ? (
                        <StarIcon
                          className="size-4 fill-rust text-rust"
                          aria-label="Featured"
                        />
                      ) : null}
                      {roadmap.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {roadmap.categories.map((category) => (
                        <Badge key={category.slug} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDifficulty(roadmap.difficulty) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {roadmap.nodeCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={roadmap.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {roadmap.updatedAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/roadmaps/${roadmap.id}/editor`}>
                          Editor
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/roadmaps/${roadmap.id}`}>Edit</Link>
                      </Button>
                      <DeleteForm
                        action="/admin/roadmaps"
                        id={roadmap.id}
                        name={roadmap.title}
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
