import { Link } from "react-router";
import { ClockIcon, FolderKanbanIcon, ListChecksIcon } from "lucide-react";

import type { ProjectCardData } from "~/lib/services/projects.server";
import { Badge } from "~/components/ui/badge";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { formatDifficulty, formatHours, pluralize } from "~/lib/format";
import { cn } from "~/lib/utils";

export function ProjectCard({
  project,
  className,
}: {
  project: ProjectCardData;
  className?: string;
}) {
  const difficulty = formatDifficulty(project.difficulty);
  const duration = formatHours(project.estimatedHours);

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={cn(
        "group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={`Open project: ${project.title}`}
    >
      <Card className="flex h-full flex-col transition-all group-hover:-translate-y-0.5 group-hover:border-foreground/25 group-hover:shadow-[var(--shadow-neu)] motion-reduce:group-hover:translate-y-0">
        <div className="flex items-start gap-3 p-4 pb-0">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
          >
            <FolderKanbanIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base leading-snug group-hover:underline">
              {project.title}
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
                <ListChecksIcon className="size-3.5" aria-hidden />
                {project.milestoneCount}{" "}
                {pluralize(project.milestoneCount, "milestone")}
              </span>
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-3 px-4 pt-3">
          {project.summary}
        </CardDescription>
        {project.categories.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 p-4">
            {project.categories.map((category) => (
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
