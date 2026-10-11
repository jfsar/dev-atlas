import { Link } from "react-router";
import { ArrowRightIcon, ClockIcon } from "lucide-react";

import type { LayoutNode, OutlineGroup } from "~/lib/roadmap-graph";
import { Badge } from "~/components/ui/badge";
import { formatDifficulty, formatMinutes } from "~/lib/format";
import { cn } from "~/lib/utils";

function outlineRowClasses(interactive: boolean) {
  return cn(
    "flex items-start gap-3 rounded-lg border bg-card p-3 text-sm",
    interactive &&
      "transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
  );
}

function OutlineNode({ node }: { node: LayoutNode }) {
  const difficulty = formatDifficulty(node.difficulty);
  const duration = formatMinutes(node.estimatedMinutes);

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{node.title}</span>
          {!node.required ? (
            <Badge variant="outline" className="text-[0.65rem]">
              Optional
            </Badge>
          ) : null}
        </div>
        {node.summary ? (
          <p className="mt-1 line-clamp-2 text-muted-foreground">
            {node.summary}
          </p>
        ) : null}
        {difficulty || duration ? (
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            {difficulty ? <span>{difficulty}</span> : null}
            {duration ? (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3.5" aria-hidden />
                {duration}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {node.topic ? (
        <ArrowRightIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : null}
    </>
  );

  if (node.topic) {
    return (
      <Link
        to={`/topics/${node.topic.slug}`}
        className={outlineRowClasses(true)}
      >
        {content}
      </Link>
    );
  }

  return <div className={outlineRowClasses(false)}>{content}</div>;
}

/** Accessible, non-graph navigation for a roadmap's nodes. */
export function RoadmapOutline({ groups }: { groups: OutlineGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This roadmap has no nodes yet.
      </p>
    );
  }

  return (
    <ol className="space-y-8">
      {groups.map((group) => (
        <li key={group.id ?? "general"}>
          <h3 className="flex items-center gap-2 font-heading text-sm font-semibold">
            {group.color ? (
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ backgroundColor: group.color }}
              />
            ) : null}
            {group.title}
            <span className="text-xs font-normal text-muted-foreground">
              {group.nodes.length}
            </span>
          </h3>
          <ol className="mt-3 space-y-2">
            {group.nodes.map((node) => (
              <li key={node.id}>
                <OutlineNode node={node} />
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
