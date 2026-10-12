import { useState } from "react";

import { FieldError } from "~/components/admin/field-error";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export interface RelatedTopicOption {
  slug: string;
  title: string;
}

/** Multi-select of topics curated as "related" for a roadmap. */
export function RelatedTopicsPicker({
  topics,
  selected = [],
  error,
}: {
  topics: RelatedTopicOption[];
  selected?: string[];
  error?: string[];
}) {
  const [checked, setChecked] = useState<string[]>(selected);

  if (topics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No topics defined yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid max-h-64 gap-x-4 gap-y-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
        {topics.map((topic) => {
          const isChecked = checked.includes(topic.slug);
          return (
            <Label
              key={topic.slug}
              htmlFor={`related-topic-${topic.slug}`}
              className="flex items-center gap-2 font-normal"
            >
              <Checkbox
                id={`related-topic-${topic.slug}`}
                name="relatedTopicSlugs"
                value={topic.slug}
                checked={isChecked}
                onCheckedChange={(value) =>
                  setChecked((previous) =>
                    value
                      ? [...previous, topic.slug]
                      : previous.filter((slug) => slug !== topic.slug),
                  )
                }
              />
              {topic.title}
            </Label>
          );
        })}
      </div>
      <FieldError messages={error} />
    </div>
  );
}
