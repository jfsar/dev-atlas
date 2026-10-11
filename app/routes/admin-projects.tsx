import { Link, redirect } from "react-router";
import { PlusIcon } from "lucide-react";

import type { Route } from "./+types/admin-projects";
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
  deleteProject,
  listAdminProjects,
} from "~/lib/services/admin/projects.server";
import { formText, parseAdminListParams } from "~/lib/services/admin/shared";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const params = parseAdminListParams(request);
  const list = await listAdminProjects(params);
  return { list, params };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projects · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = formText(form, "id");
  if (form.get("intent") === "delete" && id) {
    await deleteProject(id);
  }
  throw redirect("/admin/projects");
}

export default function AdminProjects({ loaderData }: Route.ComponentProps) {
  const { list, params } = loaderData;

  const makeHref = (page: number) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return `/admin/projects${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Projects"
        description="Guided build briefs with milestones, guidance, and related content."
        actions={
          <Button asChild>
            <Link to="/admin/projects/new">
              <PlusIcon aria-hidden />
              New project
            </Link>
          </Button>
        }
      />

      <ListToolbar
        action="/admin/projects"
        q={params.q}
        status={params.status}
        placeholder="Search projects…"
      />

      {list.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Milestones</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="max-w-xs">
                    <Link
                      to={`/admin/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      /projects/{project.slug}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.categories.map((category) => (
                        <Badge key={category.slug} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDifficulty(project.difficulty) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {project.milestoneCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {project.updatedAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/projects/${project.id}`}>Edit</Link>
                      </Button>
                      <DeleteForm
                        action="/admin/projects"
                        id={project.id}
                        name={project.title}
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
