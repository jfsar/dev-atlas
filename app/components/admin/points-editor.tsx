import { useState } from "react";

import { RepeatableList } from "~/components/admin/repeatable-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { formatContentPointKind } from "~/lib/format";
import type { DomainPointFormValue } from "~/lib/services/admin/parse.domain";
import { contentPointKinds } from "~/lib/validation/common";

export function PointsEditor({
  initial,
  error,
}: {
  initial: DomainPointFormValue[];
  error?: string[];
}) {
  const [points, setPoints] = useState<DomainPointFormValue[]>(initial);

  return (
    <>
      <input type="hidden" name="points" value={JSON.stringify(points)} />
      <RepeatableList<DomainPointFormValue>
        items={points}
        onChange={setPoints}
        makeNew={() => ({ kind: "OBJECTIVE", title: "", body: "" })}
        addLabel="Add point"
        itemLabel={(point) => point.title || "Untitled point"}
        error={error}
        renderItem={(point, update) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <div className="space-y-2">
                <Label className="text-xs">Kind</Label>
                <Select
                  value={point.kind}
                  onValueChange={(value) => update({ kind: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentPointKinds.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {formatContentPointKind(kind)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={point.title}
                  onChange={(event) => update({ title: event.target.value })}
                  maxLength={160}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Body</Label>
              <Textarea
                value={point.body}
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
