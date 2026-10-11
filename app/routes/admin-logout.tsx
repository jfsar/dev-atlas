import { redirect } from "react-router";

import type { Route } from "./+types/admin-logout";
import { auth } from "~/lib/auth.server";

export async function loader() {
  return redirect("/admin/login");
}

export async function action({ request }: Route.ActionArgs) {
  const response = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  });

  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }
  headers.set("Location", "/admin/login");
  return new Response(null, { status: 302, headers });
}
