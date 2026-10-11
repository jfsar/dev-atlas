import { FieldError } from "~/components/admin/field-error";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function SeoFields({
  defaultSeoTitle = "",
  defaultSeoDescription = "",
  defaultSeoImage = "",
  titleError,
  descriptionError,
  imageError,
}: {
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultSeoImage?: string;
  titleError?: string[];
  descriptionError?: string[];
  imageError?: string[];
}) {
  return (
    <details className="rounded-lg border bg-card p-4">
      <summary className="cursor-pointer text-sm font-medium">
        SEO metadata
      </summary>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={defaultSeoTitle}
            maxLength={70}
            placeholder="Overrides the page title in search results"
          />
          <FieldError messages={titleError} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={defaultSeoDescription}
            maxLength={200}
            rows={3}
            placeholder="Up to 200 characters shown under the title in search results"
          />
          <FieldError messages={descriptionError} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoImage">SEO image URL</Label>
          <Input
            id="seoImage"
            name="seoImage"
            type="url"
            defaultValue={defaultSeoImage}
            maxLength={2048}
            placeholder="https://example.com/social-card.png"
          />
          <FieldError messages={imageError} />
        </div>
      </div>
    </details>
  );
}
