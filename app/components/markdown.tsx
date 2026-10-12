import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import { cn } from "~/lib/utils";

const components: Components = {
  a({ node: _node, href, children, ...props }) {
    const isExternal = Boolean(href && /^https?:\/\//.test(href));
    return (
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
};

/**
 * Renders trusted-authored markdown. Output is sanitized with rehype-sanitize
 * so even admin content can never inject scripts, and external links are
 * opened safely.
 */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("prose max-w-none prose-stone", className)}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
