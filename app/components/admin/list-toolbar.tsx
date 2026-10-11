import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function ListToolbar({
  action,
  q,
  status,
  placeholder = "Search…",
}: {
  action: string;
  q: string;
  status: string | null;
  placeholder?: string;
}) {
  const hasFilters = q !== "" || status !== null;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <form
        method="get"
        action={action}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="min-w-56 space-y-2">
          <Label htmlFor="q" className="sr-only">
            Search
          </Label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={placeholder}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="sr-only">
            Status
          </Label>
          <Select name="status" defaultValue={status ?? "all"}>
            <SelectTrigger id="status" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {hasFilters ? (
        <Button asChild variant="ghost">
          <Link to={action}>Reset</Link>
        </Button>
      ) : null}
    </div>
  );
}
