import { Link } from "react-router";
import { ArrowRightIcon } from "lucide-react";

export interface EntityLinkItem {
  to: string;
  title: string;
  summary?: string | null;
  meta?: string;
}

/** Compact linked list of related content (topics, domains, projects). */
export function EntityLinkList({ items }: { items: EntityLinkItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing related yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium group-hover:underline">
                {item.title}
              </span>
              {item.summary ? (
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                  {item.summary}
                </span>
              ) : null}
              {item.meta ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.meta}
                </span>
              ) : null}
            </span>
            <ArrowRightIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
