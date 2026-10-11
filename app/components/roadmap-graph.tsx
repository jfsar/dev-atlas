import { lazy, Suspense, useSyncExternalStore } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import type { GraphLayout } from "~/lib/roadmap-graph";
import { cn } from "~/lib/utils";

const RoadmapCanvas = lazy(() => import("~/components/roadmap-canvas"));

const subscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function GraphSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full w-full items-center justify-center"
    >
      <span className="sr-only">Loading interactive roadmap…</span>
      <Skeleton className="h-full w-full rounded-xl" aria-hidden />
    </div>
  );
}

/**
 * Client-only wrapper around the @xyflow/react canvas. React Flow measures the
 * DOM and touches browser APIs, so it is never rendered during SSR: the
 * interactive graph mounts after hydration and shows a skeleton until then.
 * The roadmap outline is always available as the non-graph alternative.
 */
export function RoadmapGraph({
  layout,
  className,
}: {
  layout: GraphLayout;
  className?: string;
}) {
  const mounted = useHydrated();

  return (
    <div
      className={cn(
        "h-[70vh] min-h-[520px] w-full overflow-hidden rounded-xl border border-foreground/20 bg-background",
        className,
      )}
    >
      {mounted ? (
        <Suspense fallback={<GraphSkeleton />}>
          <RoadmapCanvas layout={layout} />
        </Suspense>
      ) : (
        <GraphSkeleton />
      )}
    </div>
  );
}
