import { Link, isRouteErrorResponse } from "react-router";
import { ClockIcon } from "lucide-react";

import type { Route } from "./+types/topic-detail";
import { ContentBlocks, buildToc } from "~/components/content-blocks";
import { EntityLinkList } from "~/components/entity-link-list";
import { PageBreadcrumbs } from "~/components/page-breadcrumbs";
import { ResourceLinks } from "~/components/resource-links";
import { ErrorState, NotFoundState } from "~/components/states";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatDifficulty, formatHours, formatMinutes } from "~/lib/format";
import { breadcrumbJsonLd, buildMeta, jsonLdScript } from "~/lib/seo";
import { getPublishedTopicBySlug } from "~/lib/services/topics.server";

export async function loader({ params }: Route.LoaderArgs) {
  const topic = await getPublishedTopicBySlug(params.slug);
  if (!topic) {
    throw new Response("Topic not found", { status: 404 });
  }
  return topic;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return buildMeta({
      title: "Topic not found",
      path: "/search",
      noIndex: true,
    });
  }
  return buildMeta({
    title: data.seoTitle ?? data.title,
    description: data.seoDescription ?? data.summary,
    path: `/topics/${data.slug}`,
    image: data.seoImage,
    type: "article",
  });
}

export default function TopicDetail({ loaderData }: Route.ComponentProps) {
  const topic = loaderData;
  const toc = buildToc(topic.blocks);

  const difficulty = formatDifficulty(topic.difficulty);
  const duration = formatMinutes(topic.estimatedMinutes);

  const relatedTopics = topic.relatedTopics.map((item) => ({
    to: `/topics/${item.slug}`,
    title: item.title,
    summary: item.summary,
    meta: formatDifficulty(item.difficulty) ?? undefined,
  }));
  const relatedDomains = topic.domains.map((item) => ({
    to: `/business-domains/${item.slug}`,
    title: item.title,
    summary: item.summary,
  }));
  const relatedProjects = topic.projects.map((item) => ({
    to: `/projects/${item.slug}`,
    title: item.title,
    summary: item.summary,
    meta: [formatDifficulty(item.difficulty), formatHours(item.estimatedHours)]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: topic.title, path: `/topics/${topic.slug}` },
            ]),
          ),
        }}
      />

      <PageBreadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Topics", to: "/search?type=topic" },
          { label: topic.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0">
          <header>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
              {topic.title}
            </h1>
            <p className="mt-3 text-lg text-pretty text-muted-foreground">
              {topic.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {difficulty ? (
                <Badge variant="secondary">{difficulty}</Badge>
              ) : null}
              {duration ? (
                <Badge variant="secondary">
                  <ClockIcon aria-hidden />
                  {duration}
                </Badge>
              ) : null}
              {topic.categories.map((category) => (
                <Badge key={category.slug} variant="outline">
                  {category.name}
                </Badge>
              ))}
            </div>
          </header>

          <Separator className="my-8" />

          <ContentBlocks blocks={topic.blocks} />

          <section aria-labelledby="resources-heading" className="mt-12">
            <h2
              id="resources-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Resources
            </h2>
            <div className="mt-4">
              <ResourceLinks resources={topic.resources} />
            </div>
          </section>

          {relatedTopics.length > 0 ? (
            <section aria-labelledby="related-topics-heading" className="mt-12">
              <h2
                id="related-topics-heading"
                className="font-heading text-2xl font-semibold tracking-tight"
              >
                Related topics
              </h2>
              <div className="mt-4">
                <EntityLinkList items={relatedTopics} />
              </div>
            </section>
          ) : null}

          {(relatedDomains.length > 0 || relatedProjects.length > 0) && (
            <section aria-labelledby="related-more-heading" className="mt-12">
              <h2
                id="related-more-heading"
                className="font-heading text-2xl font-semibold tracking-tight"
              >
                Where this applies
              </h2>
              <div className="mt-4 grid gap-8 md:grid-cols-2">
                {relatedDomains.length > 0 ? (
                  <div>
                    <h3 className="font-heading text-lg font-medium">
                      Business domains
                    </h3>
                    <div className="mt-3">
                      <EntityLinkList items={relatedDomains} />
                    </div>
                  </div>
                ) : null}
                {relatedProjects.length > 0 ? (
                  <div>
                    <h3 className="font-heading text-lg font-medium">
                      Projects
                    </h3>
                    <div className="mt-3">
                      <EntityLinkList items={relatedProjects} />
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          <Separator className="mt-12" />
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/roadmaps">Find this in a roadmap</Link>
            </Button>
          </div>
        </article>

        <aside className="order-first lg:order-last">
          {toc.length > 0 ? (
            <nav
              aria-label="On this page"
              className="rounded-xl border bg-muted/20 p-4 lg:sticky lg:top-20"
            >
              <h2 className="font-heading text-sm font-semibold">
                On this page
              </h2>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <NotFoundState
          title="Topic not found"
          description="This topic doesn’t exist or hasn’t been published yet."
          action={
            <Button asChild>
              <Link to="/search">Search for a topic</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ErrorState
      title="Could not load this topic"
      description="Something went wrong while loading the topic. Please try again."
      action={
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      }
    />
  );
}
