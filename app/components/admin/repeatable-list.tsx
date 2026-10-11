import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { FieldError } from "~/components/admin/field-error";
import { Button } from "~/components/ui/button";

export function RepeatableList<T>({
  items,
  onChange,
  makeNew,
  renderItem,
  itemLabel,
  addLabel,
  error,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  renderItem: (
    item: T,
    update: (patch: Partial<T>) => void,
    index: number,
  ) => ReactNode;
  itemLabel: (item: T, index: number) => string;
  addLabel: string;
  error?: string[];
}) {
  function update(index: number, patch: Partial<T>) {
    onChange(
      items.map((item, current) =>
        current === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function remove(index: number) {
    onChange(items.filter((_, current) => current !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const label = itemLabel(item, index) || `Item ${index + 1}`;
        return (
          <div key={index} className="space-y-3 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${label} up`}
                >
                  <ArrowUpIcon aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${label} down`}
                >
                  <ArrowDownIcon aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${label}`}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              </div>
            </div>
            {renderItem(item, (patch) => update(index, patch), index)}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...items, makeNew()])}
      >
        <PlusIcon aria-hidden />
        {addLabel}
      </Button>

      <FieldError messages={error} />
    </div>
  );
}
