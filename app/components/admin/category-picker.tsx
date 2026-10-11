import { useState } from "react";

import { FieldError } from "~/components/admin/field-error";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export interface CategoryOption {
  slug: string;
  name: string;
}

export function CategoryPicker({
  categories,
  selected = [],
  error,
}: {
  categories: CategoryOption[];
  selected?: string[];
  error?: string[];
}) {
  const [checked, setChecked] = useState<string[]>(selected);

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories defined yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {categories.map((category) => {
          const isChecked = checked.includes(category.slug);
          return (
            <Label
              key={category.slug}
              htmlFor={`category-${category.slug}`}
              className="flex items-center gap-2 font-normal"
            >
              <Checkbox
                id={`category-${category.slug}`}
                name="categorySlugs"
                value={category.slug}
                checked={isChecked}
                onCheckedChange={(value) =>
                  setChecked((previous) =>
                    value
                      ? [...previous, category.slug]
                      : previous.filter((slug) => slug !== category.slug),
                  )
                }
              />
              {category.name}
            </Label>
          );
        })}
      </div>
      <FieldError messages={error} />
    </div>
  );
}
