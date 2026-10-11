import { lazy, Suspense, useSyncExternalStore } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import type { AdminRoadmapGraph } from "~/lib/roadmap-graph-model";

const RoadmapEditorCanvas = lazy(
  () => import("~/components/admin/roadmap-editor-canvas"),
);

const subscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function EditorSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <span className="sr-only">Loading the visual editor…</span>
      <Skeleton className="h-[70vh] min-h-[560px] rounded-xl" aria-hidden />
      <Skeleton className="hidden h-[420px] rounded-xl xl:block" aria-hidden />
    </div>
  );
}

/**
 * Client-only wrapper around the @xyflow/react visual editor. React Flow
 * measures the DOM and touches browser APIs, so the editor never renders during
 * SSR: it mounts after hydration and shows a skeleton until then.
 */
export function RoadmapEditor({ graph }: { graph: AdminRoadmapGraph }) {
  const mounted = useHydrated();

  return mounted ? (
    <Suspense fallback={<EditorSkeleton />}>
      <RoadmapEditorCanvas graph={graph} />
    </Suspense>
  ) : (
    <EditorSkeleton />
  );
}
