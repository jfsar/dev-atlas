import { Form } from "react-router";

import { CategoryPicker } from "~/components/admin/category-picker";
import { FieldError } from "~/components/admin/field-error";
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
import { Textarea } from "~/components/ui/textarea";
import { formatResourceKind } from "~/lib/format";
import { valueOf, valuesOf } from "~/lib/services/admin/shared";
import { resourceKinds } from "~/lib/validation/common";

export interface ResourceFormDefaults {
  url: string;
  title: string;
  summary: string;
  kind: string;
  categorySlugs: string[];
}

export function ResourceForm({
  categories,
  defaults,
  errors,
  values,
  submitLabel,
}: {
  categories: { slug: string; name: string }[];
  defaults: ResourceFormDefaults;
  errors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
  submitLabel: string;
}) {
  return (
    <Form method="post" className="grid max-w-xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={valueOf(values, "title", defaults.title)}
          maxLength={200}
          required
        />
        <FieldError messages={errors?.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={valueOf(values, "url", defaults.url)}
          placeholder="https://example.com"
          required
        />
        <FieldError messages={errors?.url} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kind">Kind</Label>
        <Select
          name="kind"
          defaultValue={valueOf(values, "kind", defaults.kind)}
        >
          <SelectTrigger id="kind" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resourceKinds.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {formatResourceKind(kind)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError messages={errors?.kind} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          rows={2}
          maxLength={400}
          defaultValue={valueOf(values, "summary", defaults.summary)}
        />
        <FieldError messages={errors?.summary} />
      </div>

      <div className="space-y-2">
        <Label>Categories</Label>
        <CategoryPicker
          categories={categories}
          selected={valuesOf(values, "categorySlugs", defaults.categorySlugs)}
          error={errors?.categorySlugs}
        />
      </div>

      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </Form>
  );
}
