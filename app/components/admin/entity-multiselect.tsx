import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
  hint?: string;
}

export function EntityMultiSelect({
  name,
  options,
  selected = [],
  placeholder = "Select…",
  emptyText = "No matches.",
}: {
  name: string;
  options: MultiSelectOption[];
  selected?: string[];
  placeholder?: string;
  emptyText?: string;
}) {
  const [values, setValues] = useState<string[]>(selected);
  const [open, setOpen] = useState(false);

  const selectedOptions = values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is MultiSelectOption => Boolean(option));

  function toggle(value: string) {
    setValues((previous) =>
      previous.includes(value)
        ? previous.filter((entry) => entry !== value)
        : [...previous, value],
    );
  }

  return (
    <div className="space-y-2">
      {values.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span
              className={values.length === 0 ? "text-muted-foreground" : ""}
            >
              {values.length === 0 ? placeholder : `${values.length} selected`}
            </span>
            <ChevronsUpDownIcon className="opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command>
            <CommandInput placeholder="Search…" />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <Checkbox
                      checked={values.includes(option.value)}
                      className="pointer-events-none"
                      tabIndex={-1}
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.hint ? (
                      <span className="text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    ) : null}
                    {values.includes(option.value) ? (
                      <CheckIcon className="size-4" aria-hidden />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <li key={option.value}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => toggle(option.value)}
                className="h-6 gap-1 px-2 text-xs"
              >
                {option.label}
                <XIcon className="size-3" aria-hidden />
                <span className="sr-only">Remove {option.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
