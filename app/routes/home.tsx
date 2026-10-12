import { Link } from "react-router";
import {
  ArrowRightIcon,
  Building2Icon,
  FolderKanbanIcon,
  MapIcon,
} from "lucide-react";

import type { Route } from "./+types/home";
import { RoadmapCard } from "~/components/roadmap-card";
import { RouteErrorBoundary } from "~/components/route-error-boundary";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { buildMeta, jsonLdScript, organizationJsonLd } from "~/lib/seo";
import { getCatalogStats } from "~/lib/services/catalog.server";
import {
  getFeaturedRoadmaps,
  listRoadmapCategories,
} from "~/lib/services/roadmaps.server";
import { siteConfig } from "~/lib/site";

export async function loader({}: Route.LoaderArgs) {
  const [featured, stats, categories] = await Promise.all([
    getFeaturedRoadmaps(6),
    getCatalogStats(),
    listRoadmapCategories(),
  ]);
  return { featured, stats, categories };
}

export function meta({}: Route.MetaArgs) {
  return buildMeta({
    title: siteConfig.name,
    description: siteConfig.description,
    path: "/",
  });
}

const platformHighlights = [
  {
    title: "Interactive roadmaps",
    description:
      "Follow step-by-step learning paths with prerequisite, recommended, and optional connections between skills.",
    to: "/roadmaps",
    icon: MapIcon,
    cta: "Browse roadmaps",
  },
  {
    title: "Business domains",
    description:
      "Understand the objectives, actors, workflows, and controls behind the systems you build.",
    to: "/business-domains",
    icon: Building2Icon,
    cta: "Explore domains",
  },
  {
    title: "Hands-on projects",
    description:
      "Apply what you learn with realistic project briefs, milestones, and architecture guidance.",
    to: "/projects",
    icon: FolderKanbanIcon,
    cta: "Start a project",
  },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, stats, categories } = loaderData;

  const statItems = [
    { label: "Roadmaps", value: stats.roadmaps },
    { label: "Topics", value: stats.topics },
    { label: "Business domains", value: stats.businessDomains },
    { label: "Projects", value: stats.projects },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(organizationJsonLd()),
        }}
      />
      <section className="relative overflow-hidden border-b border-foreground/15 drafting-grid-lg">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(179,65,43,0.14),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(43,38,32,0.08),transparent_55%)]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex animate-rise flex-col items-start gap-6">
            <Badge variant="outline" className="tracking-[0.14em] uppercase">
              Open learning platform
            </Badge>
            <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Learn to build software — and understand the business behind it.
            </h1>
            <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="neu-raised">
                <Link to="/roadmaps">
                  Browse roadmaps
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/business-domains">Explore business domains</Link>
              </Button>
            </div>
          </div>

          <div aria-hidden className="relative hidden animate-float lg:block">
            <div className="relative aspect-[4/3] rounded-2xl border border-foreground/15 bg-card drafting-grid p-6 neu-flat">
              <span className="absolute -top-px -left-px size-8 rounded-tl-2xl border-t-2 border-l-2 border-foreground" />
              <span className="absolute -top-px -right-px size-8 rounded-tr-2xl border-t-2 border-r-2 border-foreground" />
              <span className="absolute -bottom-px -left-px size-8 rounded-bl-2xl border-b-2 border-l-2 border-foreground" />
              <span className="absolute -right-px -bottom-px size-8 rounded-br-2xl border-r-2 border-b-2 border-foreground" />
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                  <span>DevAtlas</span>
                  <span>A-101</span>
                </div>
                <div className="space-y-3">
                  {[72, 54, 88, 40].map((width, index) => (
                    <div
                      key={width}
                      className="flex items-center gap-3"
                      style={{ paddingLeft: `${index * 12}px` }}
                    >
                      <span className="size-2.5 rounded-full border border-foreground bg-background" />
                      <span
                        className="h-px flex-1 bg-foreground/30"
                        style={{ maxWidth: `${width}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-heading text-3xl font-semibold">
                    {stats.roadmaps}
                    <span className="ml-1 text-xs font-normal tracking-[0.14em] text-muted-foreground uppercase">
                      paths
                    </span>
                  </span>
                  <span className="h-10 w-px bg-rust" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="featured-heading"
        className="border-b border-foreground/15"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="featured-heading"
                className="font-heading text-2xl font-semibold tracking-tight"
              >
                Featured roadmaps
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Start with one of our most popular learning paths.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/roadmaps">
                All roadmaps
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>

          {featured.length > 0 ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((roadmap) => (
                <li key={roadmap.slug}>
                  <RoadmapCard roadmap={roadmap} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Featured roadmaps will appear here once published.
            </p>
          )}

          {categories.length > 0 ? (
            <div className="mt-10">
              <h3 className="text-sm font-medium text-muted-foreground">
                Browse by category
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/roadmaps?category=${category.slug}`}>
                        {category.name}
                        <span className="text-xs opacity-70">
                          {category.count}
                        </span>
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Content totals"
        className="border-b border-foreground/15 bg-secondary/50"
      >
        <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1 font-heading text-3xl font-semibold">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Explore the platform
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Three connected ways to grow: follow a path, understand the domain,
          and prove it with a project.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {platformHighlights.map((highlight) => (
            <Card key={highlight.to} className="flex flex-col">
              <CardHeader>
                <highlight.icon
                  className="mb-2 size-6 text-muted-foreground"
                  aria-hidden
                />
                <CardTitle className="text-lg">{highlight.title}</CardTitle>
                <CardDescription>{highlight.description}</CardDescription>
              </CardHeader>
              <Button asChild variant="link" className="mt-auto self-start">
                <Link to={highlight.to}>
                  {highlight.cta}
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-foreground/15 bg-secondary/50 drafting-grid">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Not sure where to start?
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Search across roadmaps, topics, business domains, projects, and
            resources to find exactly what you need.
          </p>
          <Button asChild className="neu-raised">
            <Link to="/search">
              Search everything
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <RouteErrorBoundary
      title="Could not load the home page"
      description="Something went wrong while loading this page. Please try again."
      actionLabel="Browse roadmaps"
      actionTo="/roadmaps"
    />
  );
}
