import type { ReactNode } from "react";

import { AlertTriangleIcon, CompassIcon, SearchXIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

/** Placeholder shown while a route's loader is resolving. */
export function LoadingState({
  label = "Loading…",
  rows = 4,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("mx-auto w-full max-w-4xl space-y-4 p-6", className)}
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-1/2" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

/** Neutral state for successful responses that simply have no content. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Empty
      className={cn(
        "border border-dashed border-foreground/20 bg-secondary/30 drafting-grid",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {icon ?? <CompassIcon aria-hidden />}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
        {action ? <EmptyContent>{action}</EmptyContent> : null}
      </EmptyHeader>
    </Empty>
  );
}

/** Recoverable error state (failed load, action error, etc.). */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl p-6", className)}>
      <Alert variant="destructive">
        <AlertTriangleIcon aria-hidden />
        <AlertTitle>{title}</AlertTitle>
        {description ? (
          <AlertDescription>
            {description}
            {action ? <div className="mt-3">{action}</div> : null}
          </AlertDescription>
        ) : null}
      </Alert>
    </div>
  );
}

/** Route-level 404 content. */
export function NotFoundState({
  title = "Page not found",
  description = "The page you’re looking for doesn’t exist or may have moved.",
  action,
  className,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<SearchXIcon aria-hidden />}
      action={action}
      className={cn("border-none", className)}
    />
  );
}
