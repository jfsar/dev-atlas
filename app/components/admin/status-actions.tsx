import { Form } from "react-router";
import { ArchiveIcon, CheckCircle2Icon, FilePenIcon } from "lucide-react";

import type { PublicationStatus } from "~/generated/prisma/client";
import { Button } from "~/components/ui/button";

export function StatusActions({
  action,
  id,
  status,
}: {
  action: string;
  id: string;
  status: PublicationStatus;
}) {
  return (
    <Form method="post" action={action} className="flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      {status !== "PUBLISHED" ? (
        <Button type="submit" name="intent" value="publish">
          <CheckCircle2Icon aria-hidden />
          Publish
        </Button>
      ) : null}
      {status !== "DRAFT" ? (
        <Button type="submit" name="intent" value="draft" variant="outline">
          <FilePenIcon aria-hidden />
          Move to draft
        </Button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <Button type="submit" name="intent" value="archive" variant="outline">
          <ArchiveIcon aria-hidden />
          Archive
        </Button>
      ) : null}
    </Form>
  );
}
