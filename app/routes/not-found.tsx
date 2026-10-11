import { Link } from "react-router";

import type { Route } from "./+types/not-found";
import { NotFoundState } from "~/components/states";
import { Button } from "~/components/ui/button";
import { buildMeta } from "~/lib/seo";

export function meta({}: Route.MetaArgs) {
  return buildMeta({
    title: "Page not found",
    description: "The page you requested could not be found.",
    path: "/404",
    noIndex: true,
  });
}

export default function NotFoundRoute() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24">
      <NotFoundState
        action={
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        }
      />
    </div>
  );
}
