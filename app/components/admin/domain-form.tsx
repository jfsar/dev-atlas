import { Form } from "react-router";

import { CategoryPicker } from "~/components/admin/category-picker";
import { EntityMultiSelect } from "~/components/admin/entity-multiselect";
import { FieldError } from "~/components/admin/field-error";
import { PointsEditor } from "~/components/admin/points-editor";
import { SeoFields } from "~/components/admin/seo-fields";
import { SlugFields } from "~/components/admin/slug-fields";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { DomainPointFormValue } from "~/lib/services/admin/parse.domain";
import { valueOf, valuesOf } from "~/lib/services/admin/shared";

export interface DomainFormDefaults {
  slug: string;
  title: string;
  summary: string;
  definition: string;
  developerRelevance: string;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  categorySlugs: string[];
  topicSlugs: string[];
  resourceIds: string[];
  projectSlugs: string[];
}

export interface DomainFormProps {
  categories: { slug: string; name: string }[];
  topics: { slug: string; title: string }[];
  projects: { slug: string; title: string }[];
  resources: { id: string; title: string; url: string }[];
  defaults: DomainFormDefaults;
  points: DomainPointFormValue[];
  errors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
  submitLabel?: string;
}

export function DomainForm({
  categories,
  topics,
  projects,
  resources,
  defaults,
  points,
  errors,
  values,
  submitLabel = "Save",
}: DomainFormProps) {
  return (
    <Form method="post" className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-card p-4">
          <div className="grid gap-4">
            <div className="sm:max-w-xl">
              <SlugFields
                defaultTitle={valueOf(values, "title", defaults.title)}
                defaultSlug={valueOf(values, "slug", defaults.slug)}
                titleError={errors?.title}
                slugError={errors?.slug}
              />
            </div>
            <div className="space-y-2">
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
              <Label htmlFor="definition">Definition</Label>
              <Textarea
                id="definition"
                name="definition"
                rows={5}
                maxLength={20_000}
                defaultValue={valueOf(
                  values,
                  "definition",
                  defaults.definition,
                )}
              />
              <FieldError messages={errors?.definition} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developerRelevance">Developer relevance</Label>
              <Textarea
                id="developerRelevance"
                name="developerRelevance"
                rows={5}
                maxLength={20_000}
                defaultValue={valueOf(
                  values,
                  "developerRelevance",
                  defaults.developerRelevance,
                )}
              />
              <FieldError messages={errors?.developerRelevance} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-medium">Domain points</h2>
          <p className="text-sm text-muted-foreground">
            At least three points are required before publishing.
          </p>
          <PointsEditor initial={points} error={errors?.points} />
        </section>
      </div>

      <aside className="space-y-6">
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
              name="topicSlugs"
              options={topics.map((topic) => ({
                value: topic.slug,
                label: topic.title,
              }))}
              selected={valuesOf(values, "topicSlugs", defaults.topicSlugs)}
              placeholder="Search topics…"
            />
            <FieldError messages={errors?.topicSlugs} />
          </div>
          <div className="space-y-2">
            <Label>Related projects</Label>
            <EntityMultiSelect
              name="projectSlugs"
              options={projects.map((project) => ({
                value: project.slug,
                label: project.title,
              }))}
              selected={valuesOf(values, "projectSlugs", defaults.projectSlugs)}
              placeholder="Search projects…"
            />
            <FieldError messages={errors?.projectSlugs} />
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
