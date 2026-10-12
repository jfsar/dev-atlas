import { Link } from "react-router";

import { ErrorState } from "~/components/states";
import { Button } from "~/components/ui/button";

/**
 * Shared route-level error boundary for public list/home routes so a failed
 * loader renders an intentional state inside the public shell instead of
 * falling through to the root boundary.
 */
export function RouteErrorBoundary({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <ErrorState
      title={title}
      description={description}
      action={
        <Button asChild variant="outline">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      }
    />
  );
}
