import { useState } from "react";
import { WandSparklesIcon } from "lucide-react";

import { FieldError } from "~/components/admin/field-error";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { slugify } from "~/lib/slug";

export function SlugFields({
  defaultTitle = "",
  defaultSlug = "",
  titleLabel = "Title",
  titleName = "title",
  slugLabel = "Slug",
  titleError,
  slugError,
}: {
  defaultTitle?: string;
  defaultSlug?: string;
  titleLabel?: string;
  titleName?: string;
  slugLabel?: string;
  titleError?: string[];
  slugError?: string[];
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [manualSlug, setManualSlug] = useState(defaultSlug.length > 0);

  const slugValue = manualSlug ? slug : slugify(title);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={titleName}>{titleLabel}</Label>
        <Input
          id={titleName}
          name={titleName}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          required
        />
        <FieldError messages={titleError} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">{slugLabel}</Label>
        <div className="flex gap-2">
          <Input
            id="slug"
            name="slug"
            value={slugValue}
            readOnly={!manualSlug}
            onChange={(event) => {
              setManualSlug(true);
              setSlug(event.target.value);
            }}
            maxLength={120}
            className={manualSlug ? undefined : "text-muted-foreground"}
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setManualSlug(false);
              setSlug("");
            }}
          >
            <WandSparklesIcon aria-hidden />
            Auto
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and single hyphens. Used in the public
          URL.
        </p>
        <FieldError messages={slugError} />
      </div>
    </>
  );
}
