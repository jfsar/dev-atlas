import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRightIcon, ExternalLinkIcon, SearchIcon } from "lucide-react";

import type { Route } from "./+types/search";
import { PageBreadcrumbs } from "~/components/page-breadcrumbs";
import { EmptyState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { buildSearchHref, isSearchType } from "~/lib/search";
import { getClientIp, searchRateLimiter } from "~/lib/rate-limit.server";
import { buildMeta } from "~/lib/seo";
import {
  searchPublicContent,
  type SearchResultItem,
} from "~/lib/services/search.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (!searchRateLimiter(getClientIp(request)).allowed) {
    throw new Response("Too Many Requests", {
      status: 429,
      statusText: "Too Many Requests",
    });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const typeParam = url.searchParams.get("type");
  const type = isSearchType(typeParam) ? typeParam : null;
  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  return searchPublicContent({ query, type, page });
}

export function meta({}: Route.MetaArgs) {
  return buildMeta({
    title: "Search",
    description:
      "Search DevAtlas roadmaps, topics, business domains, projects, and resources.",
    path: "/search",
    noIndex: true,
  });
}

function ResultLink({ item }: { item: SearchResultItem }) {
  const className =
    "group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const body = (
    <>
      <span className="min-w-0">
        <span className="block text-sm font-medium group-hover:underline">
          {item.title}
        </span>
        {item.summary ? (
          <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
            {item.summary}
          </span>
        ) : null}
        {item.meta ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            {item.meta}
          </span>
        ) : null}
      </span>
      {item.external ? (
        <ExternalLinkIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : (
        <ArrowRightIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {body}
      </a>
    );
  }
  return (
    <Link to={item.url} className={className}>
      {body}
    </Link>
  );
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { query, type, groups, total, page, totalPages } = loaderData;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <PageBreadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Search" }]}
      />

      <header className="mt-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Search
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find roadmaps, topics, business domains, projects, and resources.
        </p>
      </header>

      <form method="get" action="/search" role="search" className="mt-6">
        <label htmlFor="search-input" className="sr-only">
          Search query
        </label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="search-input"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search everything…"
            className="h-9"
          />
          {type ? <input type="hidden" name="type" value={type} /> : null}
          <Button type="submit" className="shrink-0">
            <SearchIcon aria-hidden />
            Search
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press <kbd className="rounded border px-1 font-mono">/</kbd> to focus
          search.
        </p>
      </form>

      {type ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Filtered to
          <span className="font-medium text-foreground">
            {groups[0]?.label ?? type}
          </span>
          <Link
            to={buildSearchHref({ q: query })}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Clear filter
          </Link>
        </p>
      ) : null}

      <div className="mt-8">
        {query.length === 0 ? (
          <EmptyState
            title="Start typing to search"
            description="Search across every published roadmap, topic, business domain, project, and resource."
            icon={<SearchIcon aria-hidden />}
          />
        ) : total === 0 ? (
          <EmptyState
            title="No results found"
            description={`Nothing matched “${query}”. Try a different term or browse the directories.`}
            icon={<SearchIcon aria-hidden />}
          />
        ) : (
          <div className="space-y-10">
            <p className="text-sm text-muted-foreground" role="status">
              {total} {total === 1 ? "result" : "results"} for “{query}”
            </p>

            {groups.map((group) => (
              <section key={group.type} aria-labelledby={`group-${group.type}`}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2
                    id={`group-${group.type}`}
                    className="font-heading text-xl font-semibold tracking-tight"
                  >
                    {group.label}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({group.total})
                    </span>
                  </h2>
                  {!type && group.total > group.items.length ? (
                    <Link
                      to={buildSearchHref({ q: query, type: group.type })}
                      className="text-sm underline underline-offset-4 hover:text-foreground"
                    >
                      See all {group.total}
                    </Link>
                  ) : null}
                </div>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={`${group.type}-${item.id}`}>
                      <ResultLink item={item} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {type && totalPages > 1 ? (
              <nav
                aria-label="Search results pages"
                className="flex items-center justify-between border-t pt-6"
              >
                {page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={buildSearchHref({
                        q: query,
                        type,
                        page: page - 1,
                      })}
                    >
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={buildSearchHref({
                        q: query,
                        type,
                        page: page + 1,
                      })}
                    >
                      Next
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                )}
              </nav>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
