import type { PublicationStatus } from "~/generated/prisma/client";
import { Badge } from "~/components/ui/badge";

const meta: Record<
  PublicationStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PUBLISHED: { label: "Published", variant: "default" },
  DRAFT: { label: "Draft", variant: "outline" },
  ARCHIVED: { label: "Archived", variant: "secondary" },
};

export function StatusBadge({ status }: { status: PublicationStatus }) {
  const { label, variant } = meta[status];
  return <Badge variant={variant}>{label}</Badge>;
}
