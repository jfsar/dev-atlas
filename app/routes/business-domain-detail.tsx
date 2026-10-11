import { Link, isRouteErrorResponse } from "react-router";

import type { Route } from "./+types/business-domain-detail";
import { EntityLinkList } from "~/components/entity-link-list";
import { Markdown } from "~/components/markdown";
import { PageBreadcrumbs } from "~/components/page-breadcrumbs";
import { ResourceLinks } from "~/components/resource-links";
import { ErrorState, NotFoundState } from "~/components/states";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatDifficulty, formatContentPointKind } from "~/lib/format";
import { breadcrumbJsonLd, buildMeta } from "~/lib/seo";
import { getPublishedDomainBySlug } from "~/lib/services/domains.server";

export async function loader({ params }: Route.LoaderArgs) {
  const domain = await getPublishedDomainBySlug(params.slug);
  if (!domain) {
    throw new Response("Business domain not found", { status: 404 });
  }
  return domain;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return buildMeta({
      title: "Business domain not found",
      path: "/business-domains",
      noIndex: true,
    });
  }
  return buildMeta({
    title: data.seoTitle ?? data.title,
    description: data.seoDescription ?? data.summary,
    path: `/business-domains/${data.slug}`,
    image: data.seoImage,
    type: "article",
  });
}

export default function BusinessDomainDetail({
  loaderData,
}: Route.ComponentProps) {
  const domain = loaderData;

  const groupedPoints = domain.points.reduce<
    {
      kind: (typeof domain.points)[number]["kind"];
      points: typeof domain.points;
    }[]
  >((groups, point) => {
    const existing = groups.find((group) => group.kind === point.kind);
    if (existing) existing.points.push(point);
    else groups.push({ kind: point.kind, points: [point] });
    return groups;
  }, []);

  const relatedTopics = domain.topics.map((item) => ({
    to: `/topics/${item.slug}`,
    title: item.title,
    summary: item.summary,
    meta: formatDifficulty(item.difficulty) ?? undefined,
  }));
  const relatedProjects = domain.projects.map((item) => ({
    to: `/projects/${item.slug}`,
    title: item.title,
    summary: item.summary,
    meta: formatDifficulty(item.difficulty) ?? undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Business domains", path: "/business-domains" },
              { name: domain.title, path: `/business-domains/${domain.slug}` },
            ]),
          ),
        }}
      />

      <PageBreadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Business domains", to: "/business-domains" },
          { label: domain.title },
        ]}
      />

      <article className="mt-6">
        <header>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            {domain.title}
          </h1>
          <p className="mt-3 text-lg text-pretty text-muted-foreground">
            {domain.summary}
          </p>
          {domain.categories.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {domain.categories.map((category) => (
                <Badge key={category.slug} variant="outline">
                  {category.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </header>

        {domain.definition ? (
          <section aria-labelledby="definition-heading" className="mt-8">
            <h2
              id="definition-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              What it is
            </h2>
            <div className="mt-4">
              <Markdown content={domain.definition} />
            </div>
          </section>
        ) : null}

        {domain.developerRelevance ? (
          <section aria-labelledby="relevance-heading" className="mt-10">
            <h2
              id="relevance-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Why it matters for developers
            </h2>
            <div className="mt-4">
              <Markdown content={domain.developerRelevance} />
            </div>
          </section>
        ) : null}

        {groupedPoints.length > 0 ? (
          <section aria-labelledby="points-heading" className="mt-10">
            <h2
              id="points-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Domain model
            </h2>
            <div className="mt-6 space-y-8">
              {groupedPoints.map((group) => (
                <div key={group.kind}>
                  <h3 className="font-heading text-lg font-medium">
                    {formatContentPointKind(group.kind)}
                  </h3>
                  <ul className="mt-3 space-y-4">
                    {group.points.map((point) => (
                      <li
                        key={point.id}
                        className="rounded-lg border bg-card p-4"
                      >
                        <p className="font-medium">{point.title}</p>
                        <div className="mt-2">
                          <Markdown content={point.body} className="prose-sm" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="domain-resources-heading" className="mt-10">
          <h2
            id="domain-resources-heading"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Resources
          </h2>
          <div className="mt-4">
            <ResourceLinks resources={domain.resources} />
          </div>
        </section>

        {(relatedTopics.length > 0 || relatedProjects.length > 0) && (
          <section aria-labelledby="domain-related-heading" className="mt-10">
            <h2
              id="domain-related-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Related content
            </h2>
            <div className="mt-4 grid gap-8 md:grid-cols-2">
              {relatedTopics.length > 0 ? (
                <div>
                  <h3 className="font-heading text-lg font-medium">Topics</h3>
                  <div className="mt-3">
                    <EntityLinkList items={relatedTopics} />
                  </div>
                </div>
              ) : null}
              {relatedProjects.length > 0 ? (
                <div>
                  <h3 className="font-heading text-lg font-medium">Projects</h3>
                  <div className="mt-3">
                    <EntityLinkList items={relatedProjects} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        <Separator className="mt-10" />
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/business-domains">All business domains</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <NotFoundState
          title="Business domain not found"
          description="This domain doesn’t exist or hasn’t been published yet."
          action={
            <Button asChild>
              <Link to="/business-domains">Browse business domains</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ErrorState
      title="Could not load this domain"
      description="Something went wrong while loading the domain. Please try again."
      action={
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      }
    />
  );
}
