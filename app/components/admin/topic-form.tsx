import { Form } from "react-router";

import type { TopicInput } from "~/lib/validation/topic";
import { CategoryPicker } from "~/components/admin/category-picker";
import { EntityMultiSelect } from "~/components/admin/entity-multiselect";
import { FieldError } from "~/components/admin/field-error";
import { SeoFields } from "~/components/admin/seo-fields";
import { SlugFields } from "~/components/admin/slug-fields";
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
import { TopicBlocksEditor } from "~/components/admin/blocks-editor";
import { valueOf, valuesOf } from "~/lib/services/admin/shared";

export interface TopicFormDefaults {
  slug: string;
  title: string;
  summary: string;
  difficulty: string;
  estimatedMinutes: string;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  categorySlugs: string[];
  relatedSlugs: string[];
  resourceIds: string[];
}

export interface TopicFormProps {
  categories: { slug: string; name: string }[];
  resources: { id: string; title: string; url: string }[];
  topics: { slug: string; title: string }[];
  defaults: TopicFormDefaults;
  blocks: TopicInput["blocks"];
  errors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
  submitLabel?: string;
}

export function TopicForm({
  categories,
  resources,
  topics,
  defaults,
  blocks,
  errors,
  values,
  submitLabel = "Save",
}: TopicFormProps) {
  return (
    <Form method="post" className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="min-w-0 space-y-6">
        <section className="space-y-4 rounded-xl border bg-card p-4">
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
                rows={3}
                required
                minLength={10}
                maxLength={400}
                defaultValue={valueOf(values, "summary", defaults.summary)}
              />
              <FieldError messages={errors?.summary} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                name="difficulty"
                defaultValue={
                  valueOf(values, "difficulty", defaults.difficulty) || "NONE"
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Not specified</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
              <FieldError messages={errors?.difficulty} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated minutes</Label>
              <Input
                id="estimatedMinutes"
                name="estimatedMinutes"
                type="number"
                min={1}
                max={60000}
                defaultValue={valueOf(
                  values,
                  "estimatedMinutes",
                  defaults.estimatedMinutes,
                )}
              />
              <FieldError messages={errors?.estimatedMinutes} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-medium">Content</h2>
          <TopicBlocksEditor
            name="blocks"
            initial={blocks}
            error={errors?.blocks}
          />
        </section>
      </div>

      <aside className="min-w-0 space-y-6">
        <section className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Taxonomy &amp; relations
          </h2>
          <div className="space-y-2">
            <Label>Categories</Label>
            <CategoryPicker
              categories={categories}
              selected={valuesOf(
                values,
                "categorySlugs",
                defaults.categorySlugs,
              )}
              error={errors?.categorySlugs}
            />
          </div>
          <div className="space-y-2">
            <Label>Related topics</Label>
            <EntityMultiSelect
              name="relatedSlugs"
              options={topics.map((topic) => ({
                value: topic.slug,
                label: topic.title,
              }))}
              selected={valuesOf(values, "relatedSlugs", defaults.relatedSlugs)}
              placeholder="Search topics…"
            />
            <FieldError messages={errors?.relatedSlugs} />
          </div>
          <div className="space-y-2">
            <Label>Attached resources</Label>
            <EntityMultiSelect
              name="resourceIds"
              options={resources.map((resource) => ({
                value: resource.id,
                label: resource.title,
                hint: resource.url,
              }))}
              selected={valuesOf(values, "resourceIds", defaults.resourceIds)}
              placeholder="Search resources…"
            />
            <FieldError messages={errors?.resourceIds} />
          </div>
        </section>

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

        <div className="flex justify-end">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </aside>
    </Form>
  );
}
