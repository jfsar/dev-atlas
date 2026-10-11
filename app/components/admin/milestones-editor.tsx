import { useState } from "react";

import { RepeatableList } from "~/components/admin/repeatable-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { MilestoneFormValue } from "~/lib/services/admin/parse.project";

export function MilestonesEditor({
  initial,
  error,
}: {
  initial: MilestoneFormValue[];
  error?: string[];
}) {
  const [milestones, setMilestones] = useState<MilestoneFormValue[]>(initial);

  return (
    <>
      <input
        type="hidden"
        name="milestones"
        value={JSON.stringify(milestones)}
      />
      <RepeatableList<MilestoneFormValue>
        items={milestones}
        onChange={setMilestones}
        makeNew={() => ({ title: "", body: "" })}
        addLabel="Add milestone"
        itemLabel={(milestone) => milestone.title || "Untitled milestone"}
        error={error}
        renderItem={(milestone, update) => (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input
                value={milestone.title}
                onChange={(event) => update({ title: event.target.value })}
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Details (optional)</Label>
              <Textarea
                value={milestone.body}
                onChange={(event) => update({ body: event.target.value })}
                rows={3}
                maxLength={10_000}
              />
            </div>
          </div>
        )}
      />
    </>
  );
}
