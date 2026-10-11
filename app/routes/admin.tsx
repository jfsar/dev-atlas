import { Link } from "react-router";

import type { Route } from "./+types/admin";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  getAdminContentStats,
  type AdminContentStat,
} from "~/lib/services/catalog.server";
import { requireAdmin } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAdmin(request);
  const stats = await getAdminContentStats();
  return { user: session.user, stats };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

function StatusBadge({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "secondary" | "default" | "outline";
}) {
  return (
    <Badge variant={variant}>
      {label} {count}
    </Badge>
  );
}

const statHrefs: Partial<Record<AdminContentStat["key"], string>> = {
  roadmaps: "/admin/roadmaps",
  topics: "/admin/topics",
  businessDomains: "/admin/business-domains",
  projects: "/admin/projects",
  resources: "/admin/resources",
};

function StatCard({ stat }: { stat: AdminContentStat }) {
  const href = statHrefs[stat.key];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {href ? (
            <Link to={href} className="hover:underline">
              {stat.label}
            </Link>
          ) : (
            stat.label
          )}
        </CardTitle>
        <CardDescription>{stat.total} total</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <StatusBadge
          label="Published"
          count={stat.published}
          variant="default"
        />
        <StatusBadge label="Draft" count={stat.draft} variant="secondary" />
        <StatusBadge label="Archived" count={stat.archived} variant="outline" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { user, stats } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {user.name} ({user.email}).
        </p>
      </header>

      <section aria-labelledby="content-heading">
        <h2
          id="content-heading"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Content overview
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.key} stat={stat} />
          ))}
        </div>
      </section>
    </div>
  );
}
