import type { Route } from "./+types/robots";
import { absoluteUrl } from "~/lib/seo";
import { buildRobotsTxt } from "~/lib/sitemap";

export async function loader({}: Route.LoaderArgs) {
  const body = buildRobotsTxt({
    sitemapUrl: absoluteUrl("/sitemap.xml"),
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
