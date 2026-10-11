import { Link, redirect } from "react-router";
import { PlusIcon } from "lucide-react";

import type { Route } from "./+types/admin-business-domains";
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
import { requireAdmin } from "~/lib/session.server";
import {
  deleteDomain,
  listAdminDomains,
} from "~/lib/services/admin/business-domains.server";
import { formText, parseAdminListParams } from "~/lib/services/admin/shared";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const params = parseAdminListParams(request);
  const list = await listAdminDomains(params);
  return { list, params };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Business domains · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = formText(form, "id");
  if (form.get("intent") === "delete" && id) {
    await deleteDomain(id);
  }
  throw redirect("/admin/business-domains");
}

export default function AdminBusinessDomains({
  loaderData,
}: Route.ComponentProps) {
  const { list, params } = loaderData;

  const makeHref = (page: number) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return `/admin/business-domains${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Business domains"
        description="Domain definitions, points, and the topics, projects, and resources that map to them."
        actions={
          <Button asChild>
            <Link to="/admin/business-domains/new">
              <PlusIcon aria-hidden />
              New domain
            </Link>
          </Button>
        }
      />

      <ListToolbar
        action="/admin/business-domains"
        q={params.q}
        status={params.status}
        placeholder="Search business domains…"
      />

      {list.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No business domains found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="max-w-xs">
                    <Link
                      to={`/admin/business-domains/${domain.id}`}
                      className="font-medium hover:underline"
                    >
                      {domain.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      /business-domains/{domain.slug}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {domain.categories.map((category) => (
                        <Badge key={category.slug} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {domain.pointCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={domain.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {domain.updatedAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/business-domains/${domain.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <DeleteForm
                        action="/admin/business-domains"
                        id={domain.id}
                        name={domain.title}
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
