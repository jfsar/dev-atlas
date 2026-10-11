import { Link } from "react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

export function Pagination({
  page,
  pageCount,
  makeHref,
}: {
  page: number;
  pageCount: number;
  makeHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-2"
    >
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link to={makeHref(page - 1)}>
            <ChevronLeftIcon aria-hidden />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeftIcon aria-hidden />
          Previous
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Button asChild variant="outline" size="sm">
          <Link to={makeHref(page + 1)}>
            Next
            <ChevronRightIcon aria-hidden />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
          <ChevronRightIcon aria-hidden />
        </Button>
      )}
    </nav>
  );
}
