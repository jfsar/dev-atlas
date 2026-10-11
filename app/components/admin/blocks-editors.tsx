import type { TopicBlockInput } from "~/lib/validation/topic";
import { RepeatableList } from "~/components/admin/repeatable-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type {
  ChecklistItem,
  FaqItem,
  ResourceListItem,
} from "~/components/admin/blocks-editor.types";

export function ChecklistEditor({
  items,
  onChange,
  error,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  error?: string[];
}) {
  return (
    <RepeatableList<ChecklistItem>
      items={items}
      onChange={onChange}
      addLabel="Add item"
      itemLabel={(item) => item.text || "Untitled item"}
      makeNew={() => ({ text: "" })}
      error={error}
      renderItem={(item, update) => (
        <div className="space-y-2">
          <Label className="text-xs">Item</Label>
          <Input
            value={item.text}
            onChange={(event) => update({ text: event.target.value })}
            maxLength={280}
          />
        </div>
      )}
    />
  );
}

export function FaqEditor({
  items,
  onChange,
  error,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
  error?: string[];
}) {
  return (
    <RepeatableList<FaqItem>
      items={items}
      onChange={onChange}
      addLabel="Add question"
      itemLabel={(item) => item.question || "Untitled question"}
      makeNew={() => ({ question: "", answer: "" })}
      error={error}
      renderItem={(item, update) => (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Question</Label>
            <Input
              value={item.question}
              onChange={(event) => update({ question: event.target.value })}
              maxLength={280}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Answer</Label>
            <Textarea
              value={item.answer}
              onChange={(event) => update({ answer: event.target.value })}
              rows={3}
              maxLength={60000}
            />
          </div>
        </div>
      )}
    />
  );
}

export function ResourceListEditor({
  items,
  onChange,
  error,
}: {
  items: ResourceListItem[];
  onChange: (items: ResourceListItem[]) => void;
  error?: string[];
}) {
  return (
    <RepeatableList<ResourceListItem>
      items={items}
      onChange={onChange}
      addLabel="Add resource"
      itemLabel={(item) => item.title || "Untitled resource"}
      makeNew={() => ({ title: "", url: "" })}
      error={error}
      renderItem={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={item.title}
              onChange={(event) => update({ title: event.target.value })}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">URL</Label>
            <Input
              value={item.url}
              onChange={(event) => update({ url: event.target.value })}
              maxLength={2048}
              type="url"
            />
          </div>
        </div>
      )}
    />
  );
}

export function coerceBlockValue(block: TopicBlockInput): {
  title: string;
  body: string;
  language: string;
  data: Record<string, unknown>;
} {
  const b = block as unknown as {
    title?: string;
    body?: string;
    language?: string;
    data?: unknown;
  };
  const data =
    b.data && typeof b.data === "object" && !Array.isArray(b.data)
      ? (b.data as Record<string, unknown>)
      : {};
  return {
    title: b.title ?? "",
    body: b.body ?? "",
    language: b.language ?? "",
    data,
  };
}
