import { Link, redirect } from "react-router";
import { PlusIcon } from "lucide-react";

import type { Route } from "./+types/admin-topics";
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
  deleteTopic,
  listAdminTopics,
} from "~/lib/services/admin/topics.server";
import { formText, parseAdminListParams } from "~/lib/services/admin/shared";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const params = parseAdminListParams(request);
  const list = await listAdminTopics(params);
  return { list, params };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Topics · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = formText(form, "id");
  if (form.get("intent") === "delete" && id) {
    await deleteTopic(id);
  }
  throw redirect("/admin/topics");
}

export default function AdminTopics({ loaderData }: Route.ComponentProps) {
  const { list, params } = loaderData;

  const makeHref = (page: number) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return `/admin/topics${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Topics"
        description="Learning content blocks, resources, and relations for every topic."
        actions={
          <Button asChild>
            <Link to="/admin/topics/new">
              <PlusIcon aria-hidden />
              New topic
            </Link>
          </Button>
        }
      />

      <ListToolbar
        action="/admin/topics"
        q={params.q}
        status={params.status}
        placeholder="Search topics…"
      />

      {list.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Blocks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="max-w-xs">
                    <Link
                      to={`/admin/topics/${topic.id}`}
                      className="font-medium hover:underline"
                    >
                      {topic.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      /topics/{topic.slug}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {topic.categories.map((category) => (
                        <Badge key={category.slug} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDifficulty(topic.difficulty) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {topic.blockCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={topic.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {topic.updatedAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/topics/${topic.id}`}>Edit</Link>
                      </Button>
                      <DeleteForm
                        action="/admin/topics"
                        id={topic.id}
                        name={topic.title}
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
