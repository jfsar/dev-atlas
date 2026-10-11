import { Link } from "react-router";

import { Button } from "~/components/ui/button";

export interface FilterCategory {
  slug: string;
  name: string;
  count?: number;
}

/** Shared category chip filter used by the public directories. */
export function CategoryFilter({
  basePath,
  categories,
  activeCategory,
  label = "Filter by category",
}: {
  basePath: string;
  categories: FilterCategory[];
  activeCategory?: string | null;
  label?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label={label} className="mt-8">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Button
            asChild
            size="sm"
            variant={activeCategory ? "outline" : "default"}
          >
            <Link to={basePath}>All</Link>
          </Button>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <Button
              asChild
              size="sm"
              variant={activeCategory === category.slug ? "default" : "outline"}
            >
              <Link to={`${basePath}?category=${category.slug}`}>
                {category.name}
                {typeof category.count === "number" ? (
                  <span className="text-xs opacity-70">{category.count}</span>
                ) : null}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
