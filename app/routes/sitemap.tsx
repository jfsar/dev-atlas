import type { Route } from "./+types/sitemap";
import { appUnexpectedError } from "~/lib/errors";
import { getSitemapEntries } from "~/lib/services/sitemap.server";
import { buildSitemapXml } from "~/lib/sitemap";

export async function loader({}: Route.LoaderArgs) {
  try {
    const entries = await getSitemapEntries();

    return new Response(buildSitemapXml(entries), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return appUnexpectedError(error);
  }
}
