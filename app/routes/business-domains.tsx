import { Link } from "react-router";
import { Building2Icon } from "lucide-react";

import type { Route } from "./+types/business-domains";
import { CategoryFilter } from "~/components/category-filter";
import { DomainCard } from "~/components/domain-card";
import { EmptyState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { buildMeta } from "~/lib/seo";
import {
  listDomainCategories,
  listPublishedDomains,
} from "~/lib/services/domains.server";

export async function loader({ request }: Route.LoaderArgs) {
  const category =
    new URL(request.url).searchParams.get("category") ?? undefined;
  const [domains, categories] = await Promise.all([
    listPublishedDomains({ categorySlug: category }),
    listDomainCategories(),
  ]);
  return { domains, categories, activeCategory: category ?? null };
}

export function meta({}: Route.MetaArgs) {
  return buildMeta({
    title: "Business domains",
    description:
      "Understand the business domains behind software: objectives, actors, rules, controls, and the software implications that shape real systems.",
    path: "/business-domains",
  });
}

export default function BusinessDomainsIndex({
  loaderData,
}: Route.ComponentProps) {
  const { domains, categories, activeCategory } = loaderData;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Business domains
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every professional system encodes a business domain. Explore how those
          domains work and how that understanding translates into software.
        </p>
      </header>

      <CategoryFilter
        basePath="/business-domains"
        categories={categories}
        activeCategory={activeCategory}
        label="Filter business domains by category"
      />

      <div className="mt-8">
        {domains.length === 0 ? (
          <EmptyState
            title="No business domains found"
            description={
              activeCategory
                ? "No published domains in this category yet. Try another category."
                : "Published business domains will appear here."
            }
            icon={<Building2Icon aria-hidden />}
            action={
              activeCategory ? (
                <Button asChild variant="outline">
                  <Link to="/business-domains">Clear filter</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground" role="status">
              {domains.length} {domains.length === 1 ? "domain" : "domains"}
              {activeCategory ? " in this category" : ""}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <li key={domain.slug}>
                  <DomainCard domain={domain} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
