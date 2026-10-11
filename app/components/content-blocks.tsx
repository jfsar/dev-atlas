import {
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import type { BlockType } from "~/generated/prisma/client";
import { Markdown } from "~/components/markdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { safeExternalHref } from "~/lib/format";
import { cn } from "~/lib/utils";

export interface TopicBlock {
  id: string;
  type: BlockType;
  title: string | null;
  body: string | null;
  language: string | null;
  data: unknown;
  order: number;
}

export function blockAnchor(id: string): string {
  return `block-${id}`;
}

/** Blocks that carry a heading, used to build the table of contents. */
export function buildToc(
  blocks: TopicBlock[],
): { id: string; title: string }[] {
  return blocks
    .filter((block) => block.title && block.title.trim().length > 0)
    .map((block) => ({
      id: blockAnchor(block.id),
      title: block.title!.trim(),
    }));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function BlockHeading({ id, title }: { id: string; title: string | null }) {
  if (!title) return null;
  return (
    <h3
      id={id}
      className="scroll-mt-20 font-heading text-xl font-semibold tracking-tight"
    >
      {title}
    </h3>
  );
}

function ChecklistBlock({ data }: { data: unknown }) {
  const items = asArray(asRecord(data).items)
    .map((item) => readString(asRecord(item).text))
    .filter((text): text is string => Boolean(text));
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((text, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <CheckIcon
            className="mt-0.5 size-4 shrink-0 text-blueprint"
            aria-hidden
          />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function FaqBlock({ data }: { data: unknown }) {
  const items = asArray(asRecord(data).items)
    .map((item) => {
      const record = asRecord(item);
      return {
        question: readString(record.question),
        answer: readString(record.answer),
      };
    })
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item.question && item.answer),
    );
  if (items.length === 0) return null;
  return (
    <div className="divide-y rounded-lg border">
      {items.map((item, index) => (
        <details key={index} className="group px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
            {item.question}
            <ChevronDownIcon
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="pt-2">
            <Markdown content={item.answer} className="prose-sm" />
          </div>
        </details>
      ))}
    </div>
  );
}

function TableBlock({ data }: { data: unknown }) {
  const record = asRecord(data);
  const headers = asArray(record.headers)
    .map((header) => readString(header))
    .filter((header): header is string => Boolean(header));
  const rows = asArray(record.rows).map((row) =>
    asArray(row).map((cell) =>
      typeof cell === "string" ? cell : String(cell),
    ),
  );
  if (headers.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((_, cellIndex) => (
                <TableCell key={cellIndex}>{row[cellIndex] ?? ""}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ResourceListBlock({ data }: { data: unknown }) {
  const items = asArray(asRecord(data).items)
    .map((item) => {
      const record = asRecord(item);
      return {
        title: readString(record.title),
        url: readString(record.url),
      };
    })
    .filter((item): item is { title: string; url: string } =>
      Boolean(item.title && item.url),
    );
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const href = safeExternalHref(item.url);
        return (
          <li key={item.url}>
            <a
              href={href ?? undefined}
              target={href ? "_blank" : undefined}
              rel={href ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 hover:text-primary"
            >
              <ExternalLinkIcon className="size-4" aria-hidden />
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

const calloutVariants = {
  info: {
    icon: InfoIcon,
    className: "border-blueprint/60 bg-blueprint/5",
    iconClassName: "text-blueprint",
  },
  warning: {
    icon: TriangleAlertIcon,
    className: "border-rust/60 bg-rust/5",
    iconClassName: "text-rust",
  },
  success: {
    icon: CircleCheckIcon,
    className: "border-foreground/50 bg-foreground/5",
    iconClassName: "text-foreground",
  },
  danger: {
    icon: CircleAlertIcon,
    className: "border-rust/70 bg-rust/10",
    iconClassName: "text-rust",
  },
} as const;

type CalloutVariant = keyof typeof calloutVariants;

function CalloutBlock({ data, body }: { data: unknown; body: string | null }) {
  const variantRaw = readString(asRecord(data).variant);
  const variant: CalloutVariant =
    variantRaw && variantRaw in calloutVariants
      ? (variantRaw as CalloutVariant)
      : "info";
  const config = calloutVariants[variant];
  const Icon = config.icon;
  return (
    <div
      className={cn("flex gap-3 rounded-lg border-l-4 p-4", config.className)}
    >
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", config.iconClassName)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        {body ? <Markdown content={body} className="prose-sm" /> : null}
      </div>
    </div>
  );
}

function CodeBlock({
  body,
  language,
}: {
  body: string | null;
  language: string | null;
}) {
  if (!body) return null;
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        <span>Code</span>
        {language ? <span className="font-mono">{language}</span> : null}
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={language ? `language-${language}` : undefined}>
          {body}
        </code>
      </pre>
    </div>
  );
}

function ContentBlock({ block }: { block: TopicBlock }) {
  const anchor = blockAnchor(block.id);

  return (
    <section
      aria-labelledby={block.title ? anchor : undefined}
      className="space-y-3"
    >
      <BlockHeading id={anchor} title={block.title} />
      {block.type === "MARKDOWN" && block.body ? (
        <Markdown content={block.body} />
      ) : null}
      {block.type === "CODE" ? (
        <CodeBlock body={block.body} language={block.language} />
      ) : null}
      {block.type === "CALLOUT" ? (
        <CalloutBlock data={block.data} body={block.body} />
      ) : null}
      {block.type === "CHECKLIST" ? <ChecklistBlock data={block.data} /> : null}
      {block.type === "FAQ" ? <FaqBlock data={block.data} /> : null}
      {block.type === "TABLE" ? <TableBlock data={block.data} /> : null}
      {block.type === "RESOURCE_LIST" ? (
        <ResourceListBlock data={block.data} />
      ) : null}
    </section>
  );
}

export function ContentBlocks({ blocks }: { blocks: TopicBlock[] }) {
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This topic doesn’t have content blocks yet.
      </p>
    );
  }
  return (
    <div className="space-y-10">
      {blocks.map((block) => (
        <ContentBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
