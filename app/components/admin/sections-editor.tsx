import { useState } from "react";

import { RepeatableList } from "~/components/admin/repeatable-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export interface SectionFormValue {
  id?: string;
  title: string;
  color: string;
}

export function SectionsEditor({
  initial,
  error,
}: {
  initial: SectionFormValue[];
  error?: string[];
}) {
  const [sections, setSections] = useState<SectionFormValue[]>(initial);

  return (
    <>
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <RepeatableList<SectionFormValue>
        items={sections}
        onChange={setSections}
        makeNew={() => ({ title: "", color: "" })}
        addLabel="Add section"
        itemLabel={(section) => section.title || "Untitled section"}
        error={error}
        renderItem={(section, update) => (
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={section.title}
                onChange={(event) => update({ title: event.target.value })}
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                value={section.color}
                onChange={(event) => update({ color: event.target.value })}
                placeholder="#3366ff"
                maxLength={7}
              />
            </div>
          </div>
        )}
      />
    </>
  );
}
