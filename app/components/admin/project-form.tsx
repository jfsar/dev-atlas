import { Form } from "react-router";

import { CategoryPicker } from "~/components/admin/category-picker";
import { EntityMultiSelect } from "~/components/admin/entity-multiselect";
import { FieldError } from "~/components/admin/field-error";
import { MilestonesEditor } from "~/components/admin/milestones-editor";
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
import { formatDifficulty } from "~/lib/format";
import type { MilestoneFormValue } from "~/lib/services/admin/parse.project";
import { valueOf, valuesOf } from "~/lib/services/admin/shared";
import { difficulties } from "~/lib/validation/common";

export interface ProjectFormDefaults {
  slug: string;
  title: string;
  summary: string;
  scenario: string;
  difficulty: string;
  estimatedHours: string;
  learningGoals: string;
  requirements: string;
  features: string;
  architectureNotes: string;
  databaseNotes: string;
  apiNotes: string;
  testingNotes: string;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  categorySlugs: string[];
  topicSlugs: string[];
  domainSlugs: string[];
  resourceIds: string[];
}

export interface ProjectFormProps {
  categories: { slug: string; name: string }[];
  topics: { slug: string; title: string }[];
  domains: { slug: string; title: string }[];
  resources: { id: string; title: string; url: string }[];
  defaults: ProjectFormDefaults;
  milestones: MilestoneFormValue[];
  errors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
  submitLabel?: string;
}

interface GuidanceField {
  name: keyof ProjectFormDefaults;
  label: string;
  rows: number;
  maxLength: number;
}

const guidanceFields: GuidanceField[] = [
  {
    name: "learningGoals",
    label: "Learning goals",
    rows: 3,
    maxLength: 10_000,
  },
  { name: "requirements", label: "Requirements", rows: 3, maxLength: 10_000 },
  { name: "features", label: "Features", rows: 4, maxLength: 20_000 },
  {
    name: "architectureNotes",
    label: "Architecture notes",
    rows: 4,
    maxLength: 20_000,
  },
  {
    name: "databaseNotes",
    label: "Database notes",
    rows: 4,
    maxLength: 20_000,
  },
  { name: "apiNotes", label: "API notes", rows: 4, maxLength: 20_000 },
  { name: "testingNotes", label: "Testing notes", rows: 3, maxLength: 20_000 },
];

export function ProjectForm({
  categories,
  topics,
  domains,
  resources,
  defaults,
  milestones,
  errors,
  values,
  submitLabel = "Save",
}: ProjectFormProps) {
  return (
    <Form method="post" className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="scenario">Scenario</Label>
              <Textarea
                id="scenario"
                name="scenario"
                rows={5}
                required
                minLength={20}
                maxLength={20_000}
                placeholder="Describe the situation a developer must build for."
                defaultValue={valueOf(values, "scenario", defaults.scenario)}
              />
              <FieldError messages={errors?.scenario} />
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
                max={10_000}
                defaultValue={valueOf(
                  values,
                  "estimatedHours",
                  defaults.estimatedHours,
                )}
              />
              <FieldError messages={errors?.estimatedHours} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-medium">Guidance</h2>
          <div className="grid gap-4">
            {guidanceFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={field.rows}
                  maxLength={field.maxLength}
                  defaultValue={valueOf(
                    values,
                    field.name,
                    defaults[field.name] as string,
                  )}
                />
                <FieldError messages={errors?.[field.name]} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-medium">Milestones</h2>
          <p className="text-sm text-muted-foreground">
            At least one milestone is required before publishing.
          </p>
          <MilestonesEditor initial={milestones} error={errors?.milestones} />
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
            <Label>Related domains</Label>
            <EntityMultiSelect
              name="domainSlugs"
              options={domains.map((domain) => ({
                value: domain.slug,
                label: domain.title,
              }))}
              selected={valuesOf(values, "domainSlugs", defaults.domainSlugs)}
              placeholder="Search domains…"
            />
            <FieldError messages={errors?.domainSlugs} />
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
