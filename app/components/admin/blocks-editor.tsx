import { useState } from "react";
import { PlusIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { FieldError } from "~/components/admin/field-error";
import {
  ChecklistEditor,
  FaqEditor,
  ResourceListEditor,
  coerceBlockValue,
} from "~/components/admin/blocks-editors";
import type {
  ChecklistItem,
  FaqItem,
  ResourceListItem,
} from "~/components/admin/blocks-editor.types";
import type { TopicBlockInput } from "~/lib/validation/topic";

export interface BlockEditorEntry {
  id?: string;
  type: TopicBlockInput["type"];
  title: string;
  body: string;
  language: string;
  data: Record<string, unknown>;
}

function makeEmptyBlock(
  type: TopicBlockInput["type"] = "MARKDOWN",
): BlockEditorEntry {
  return {
    type,
    title: "",
    body: "",
    language: "",
    data: {},
  };
}

function coerceEntry(block: TopicBlockInput): BlockEditorEntry {
  const v = coerceBlockValue(block as TopicBlockInput);
  const b = block as unknown as {
    id?: string;
    data?: unknown;
  };
  return {
    id: b.id,
    type: block.type,
    title: v.title,
    body: v.body,
    language: v.language,
    data: v.data,
  };
}

export function TopicBlocksEditor({
  name,
  initial,
  error,
}: {
  name: string;
  initial: TopicBlockInput[];
  error?: string[];
}) {
  const [items, setItems] = useState<BlockEditorEntry[]>(
    initial.length > 0 ? initial.map(coerceEntry) : [makeEmptyBlock()],
  );

  function update(index: number, patch: Partial<BlockEditorEntry>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const t = index + dir;
      if (t < 0 || t >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }

  function add(type: TopicBlockInput["type"] = "MARKDOWN") {
    setItems((prev) => [...prev, makeEmptyBlock(type)]);
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Block {index + 1}</CardTitle>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move block ${index + 1} up`}
              >
                <ArrowUpIcon className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Move block ${index + 1} down`}
              >
                <ArrowDownIcon className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={items.length <= 1}
                aria-label={`Remove block ${index + 1}`}
              >
                <Trash2Icon className="size-4" aria-hidden />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={item.type}
                  onValueChange={(v) =>
                    update(index, { type: v as TopicBlockInput["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKDOWN">Markdown</SelectItem>
                    <SelectItem value="CODE">Code</SelectItem>
                    <SelectItem value="CALLOUT">Callout</SelectItem>
                    <SelectItem value="CHECKLIST">Checklist</SelectItem>
                    <SelectItem value="TABLE">Table</SelectItem>
                    <SelectItem value="RESOURCE_LIST">Resource list</SelectItem>
                    <SelectItem value="FAQ">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Heading (optional)</Label>
                <Input
                  value={item.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  maxLength={160}
                />
              </div>
            </div>

            {item.type === "MARKDOWN" ? (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={item.body}
                  onChange={(e) => update(index, { body: e.target.value })}
                  rows={10}
                />
              </div>
            ) : item.type === "CODE" ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Code</Label>
                  <Textarea
                    value={item.body}
                    onChange={(e) => update(index, { body: e.target.value })}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input
                    value={item.language}
                    onChange={(e) =>
                      update(index, { language: e.target.value })
                    }
                    maxLength={40}
                    placeholder="ts, tsx, python…"
                  />
                </div>
              </div>
            ) : item.type === "CALLOUT" ? (
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={item.body}
                  onChange={(e) => update(index, { body: e.target.value })}
                  rows={8}
                />
              </div>
            ) : null}

            {item.type === "CHECKLIST" ? (
              <ChecklistEditor
                items={(item.data?.items ?? []) as ChecklistItem[]}
                onChange={(items) =>
                  update(index, { data: { ...item.data, items } })
                }
              />
            ) : null}
            {item.type === "FAQ" ? (
              <FaqEditor
                items={(item.data?.items ?? []) as FaqItem[]}
                onChange={(items) =>
                  update(index, { data: { ...item.data, items } })
                }
              />
            ) : null}
            {item.type === "RESOURCE_LIST" ? (
              <ResourceListEditor
                items={(item.data?.items ?? []) as ResourceListItem[]}
                onChange={(items) =>
                  update(index, { data: { ...item.data, items } })
                }
              />
            ) : null}
            {item.type === "TABLE" ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                Table block editing via JSON is supported by RepeatableList; for
                now keep simple or extend later.
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-between">
            <FieldError messages={error} />
          </CardFooter>
        </Card>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => add("MARKDOWN")}>
          <PlusIcon className="mr-2 size-4" /> Add markdown
        </Button>
        <Button type="button" variant="outline" onClick={() => add("CODE")}>
          <PlusIcon className="mr-2 size-4" /> Add code
        </Button>
        <Button type="button" variant="outline" onClick={() => add("CALLOUT")}>
          <PlusIcon className="mr-2 size-4" /> Add callout
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => add("CHECKLIST")}
        >
          <PlusIcon className="mr-2 size-4" /> Add checklist
        </Button>
        <Button type="button" variant="outline" onClick={() => add("FAQ")}>
          <PlusIcon className="mr-2 size-4" /> Add FAQ
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => add("RESOURCE_LIST")}
        >
          <PlusIcon className="mr-2 size-4" /> Add resource list
        </Button>
      </div>
    </div>
  );
}
