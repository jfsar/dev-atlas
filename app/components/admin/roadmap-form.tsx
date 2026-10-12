import { Form } from "react-router";

import { CategoryPicker } from "~/components/admin/category-picker";
import { FieldError } from "~/components/admin/field-error";
import { RelatedTopicsPicker } from "~/components/admin/related-topics-picker";
import {
  SectionsEditor,
  type SectionFormValue,
} from "~/components/admin/sections-editor";
import { SeoFields } from "~/components/admin/seo-fields";
import { SlugFields } from "~/components/admin/slug-fields";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
import { formatDifficulty } from "~/lib/format";
import { valueOf, valuesOf } from "~/lib/services/admin/shared";
import { difficulties } from "~/lib/validation/common";

export interface RoadmapFormDefaults {
  slug: string;
  title: string;
  summary: string;
  description: string;
  audience: string;
  prerequisiteNotes: string;
  difficulty: string;
  estimatedHours: string;
  icon: string;
  featured: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  categorySlugs: string[];
  relatedTopicSlugs: string[];
}

export function RoadmapForm({
  categories,
  topics,
  defaults,
  errors,
  values,
  submitLabel,
  sections,
}: {
  categories: { slug: string; name: string }[];
  topics: { slug: string; title: string }[];
  defaults: RoadmapFormDefaults;
  errors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
  submitLabel: string;
  sections?: { initial: SectionFormValue[]; error?: string[] };
}) {
  const featured = values
    ? valuesOf(values, "featured").includes("on")
    : defaults.featured;

  return (
    <Form method="post" className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 sm:max-w-xl">
          <SlugFields
            defaultTitle={valueOf(values, "title", defaults.title)}
            defaultSlug={valueOf(values, "slug", defaults.slug)}
            titleError={errors?.title}
            slugError={errors?.slug}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            name="summary"
            rows={2}
            maxLength={400}
            required
            defaultValue={valueOf(values, "summary", defaults.summary)}
          />
          <FieldError messages={errors?.summary} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description (markdown)</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={valueOf(values, "description", defaults.description)}
          />
          <FieldError messages={errors?.description} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Audience</Label>
          <Input
            id="audience"
            name="audience"
            maxLength={400}
            defaultValue={valueOf(values, "audience", defaults.audience)}
          />
          <FieldError messages={errors?.audience} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input
            id="icon"
            name="icon"
            maxLength={8}
            defaultValue={valueOf(values, "icon", defaults.icon)}
          />
          <FieldError messages={errors?.icon} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="prerequisiteNotes">Prerequisite notes</Label>
          <Textarea
            id="prerequisiteNotes"
            name="prerequisiteNotes"
            rows={2}
            defaultValue={valueOf(
              values,
              "prerequisiteNotes",
              defaults.prerequisiteNotes,
            )}
          />
          <FieldError messages={errors?.prerequisiteNotes} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            name="difficulty"
            defaultValue={
              valueOf(values, "difficulty", defaults.difficulty) || "NONE"
            }
          >
            <SelectTrigger id="difficulty" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Not set</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {formatDifficulty(difficulty)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError messages={errors?.difficulty} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated hours</Label>
          <Input
            id="estimatedHours"
            name="estimatedHours"
            type="number"
            min={1}
            defaultValue={valueOf(
              values,
              "estimatedHours",
              defaults.estimatedHours,
            )}
          />
          <FieldError messages={errors?.estimatedHours} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={valueOf(values, "order", String(defaults.order))}
          />
          <FieldError messages={errors?.order} />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <Checkbox id="featured" name="featured" defaultChecked={featured} />
          <Label htmlFor="featured" className="font-normal">
            Featured
          </Label>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Categories</Label>
          <CategoryPicker
            categories={categories}
            selected={valuesOf(values, "categorySlugs", defaults.categorySlugs)}
            error={errors?.categorySlugs}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Related topics</Label>
          <p className="text-sm text-muted-foreground">
            Curated topics shown under “Related content” on the roadmap page.
          </p>
          <RelatedTopicsPicker
            topics={topics}
            selected={valuesOf(
              values,
              "relatedTopicSlugs",
              defaults.relatedTopicSlugs,
            )}
            error={errors?.relatedTopicSlugs}
          />
        </div>
      </div>

      <SeoFields
        defaultSeoTitle={valueOf(values, "seoTitle", defaults.seoTitle)}
        defaultSeoDescription={valueOf(
          values,
          "seoDescription",
          defaults.seoDescription,
        )}
        defaultSeoImage={valueOf(values, "seoImage", defaults.seoImage)}
        titleError={errors?.seoTitle}
        descriptionError={errors?.seoDescription}
        imageError={errors?.seoImage}
      />

      {sections ? (
        <fieldset className="rounded-xl border bg-card p-4">
          <legend className="px-1 text-sm font-medium">Sections</legend>
          <p className="mb-3 text-sm text-muted-foreground">
            Group roadmap nodes into columns. Nodes are managed in the visual
            editor.
          </p>
          <SectionsEditor initial={sections.initial} error={sections.error} />
        </fieldset>
      ) : null}

      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </Form>
  );
}
