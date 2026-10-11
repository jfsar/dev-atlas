import { Link } from "react-router";
import { Building2Icon, ListChecksIcon } from "lucide-react";

import type { DomainCardData } from "~/lib/services/domains.server";
import { Badge } from "~/components/ui/badge";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { pluralize } from "~/lib/format";
import { cn } from "~/lib/utils";

export function DomainCard({
  domain,
  className,
}: {
  domain: DomainCardData;
  className?: string;
}) {
  return (
    <Link
      to={`/business-domains/${domain.slug}`}
      className={cn(
        "group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={`Open business domain: ${domain.title}`}
    >
      <Card className="flex h-full flex-col transition-all group-hover:-translate-y-0.5 group-hover:border-foreground/25 group-hover:shadow-[var(--shadow-neu)] motion-reduce:group-hover:translate-y-0">
        <div className="flex items-start gap-3 p-4 pb-0">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
          >
            <Building2Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base leading-snug group-hover:underline">
              {domain.title}
            </CardTitle>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ListChecksIcon className="size-3.5" aria-hidden />
              {domain.pointCount} {pluralize(domain.pointCount, "point")}
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-3 px-4 pt-3">
          {domain.summary}
        </CardDescription>
        {domain.categories.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 p-4">
            {domain.categories.map((category) => (
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
