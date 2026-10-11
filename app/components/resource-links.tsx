import { ExternalLinkIcon } from "lucide-react";

import type { ResourceKind } from "~/generated/prisma/client";
import { Badge } from "~/components/ui/badge";
import { formatResourceKind } from "~/lib/format";

export interface ResourceLinkItem {
  url: string;
  title: string;
  summary?: string | null;
  kind: ResourceKind;
  note?: string | null;
}

export function ResourceLinks({
  resources,
}: {
  resources: ResourceLinkItem[];
}) {
  if (resources.length === 0) {
    return <p className="text-sm text-muted-foreground">No resources yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {resources.map((resource) => (
        <li key={resource.url}>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium group-hover:underline">
                  {resource.title}
                </span>
                <Badge variant="outline">
                  {formatResourceKind(resource.kind)}
                </Badge>
              </span>
              {resource.summary || resource.note ? (
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {resource.summary ?? resource.note}
                </span>
              ) : null}
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {resource.url}
              </span>
            </span>
            <ExternalLinkIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
