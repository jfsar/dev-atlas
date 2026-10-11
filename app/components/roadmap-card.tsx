import { Link } from "react-router";
import { ClockIcon, MapIcon, WaypointsIcon } from "lucide-react";

import type { RoadmapCardData } from "~/lib/services/roadmaps.server";
import { Badge } from "~/components/ui/badge";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { formatDifficulty, formatHours, pluralize } from "~/lib/format";
import { cn } from "~/lib/utils";

export function RoadmapCard({
  roadmap,
  className,
}: {
  roadmap: RoadmapCardData;
  className?: string;
}) {
  const difficulty = formatDifficulty(roadmap.difficulty);
  const duration = formatHours(roadmap.estimatedHours);

  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className={cn(
        "group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={`Open roadmap: ${roadmap.title}`}
    >
      <Card className="flex h-full flex-col transition-all group-hover:-translate-y-0.5 group-hover:border-foreground/25 group-hover:shadow-[var(--shadow-neu)] motion-reduce:group-hover:translate-y-0">
        <div className="flex items-start gap-3 p-4 pb-0">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg"
          >
            {roadmap.icon ?? <MapIcon className="size-5" />}
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base leading-snug group-hover:underline">
              {roadmap.title}
            </CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {difficulty ? <span>{difficulty}</span> : null}
              {duration ? (
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="size-3.5" aria-hidden />
                  {duration}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <WaypointsIcon className="size-3.5" aria-hidden />
                {roadmap.nodeCount} {pluralize(roadmap.nodeCount, "node")}
              </span>
            </div>
          </div>
        </div>

        <CardDescription className="line-clamp-3 px-4 pt-3">
          {roadmap.summary}
        </CardDescription>

        {roadmap.categories.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 p-4">
            {roadmap.categories.map((category) => (
              <Badge key={category.slug} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </Card>
    </Link>
  );
}
