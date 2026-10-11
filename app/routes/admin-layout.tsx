import { Form, Link, NavLink, Outlet } from "react-router";
import {
  BriefcaseIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HammerIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  LogOutIcon,
  MapIcon,
  RouteIcon,
  ShieldCheckIcon,
  TagsIcon,
} from "lucide-react";

import type { Route } from "./+types/admin-layout";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/lib/session.server";
import { cn } from "~/lib/utils";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAdmin(request);
  return { user: session.user };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin · DevAtlas" },
    { name: "robots", content: "noindex" },
  ];
}

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, end: true },
  { to: "/admin/roadmaps", label: "Roadmaps", icon: MapIcon, end: false },
  { to: "/admin/topics", label: "Topics", icon: FileTextIcon, end: false },
  {
    to: "/admin/business-domains",
    label: "Business domains",
    icon: BriefcaseIcon,
    end: false,
  },
  { to: "/admin/projects", label: "Projects", icon: HammerIcon, end: false },
  { to: "/admin/resources", label: "Resources", icon: LibraryIcon, end: false },
  { to: "/admin/categories", label: "Categories", icon: TagsIcon, end: false },
  {
    to: "/admin/security",
    label: "Security",
    icon: ShieldCheckIcon,
    end: false,
  },
] as const;

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-heading font-semibold"
          >
            <RouteIcon className="size-5" aria-hidden />
            DevAtlas
            <Badge variant="secondary">Admin</Badge>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link to="/" target="_blank" rel="noopener noreferrer">
                View site
                <ExternalLinkIcon aria-hidden />
              </Link>
            </Button>
            <Form method="post" action="/admin/logout">
              <Button type="submit" variant="outline" size="sm">
                <LogOutIcon aria-hidden />
                Sign out
              </Button>
            </Form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:flex-row">
        <nav aria-label="Admin" className="md:w-48 md:shrink-0">
          <ul className="flex flex-wrap gap-1 md:flex-col">
            {adminNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
