import { redirect } from "react-router";

import { auth } from "~/lib/auth.server";
import { prisma } from "~/lib/prisma";
import { sanitizeRedirectTo } from "~/lib/safe-redirect";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminSession {
  user: AdminUser;
}

/**
 * Resolves the current request's session and confirms the user is an admin.
 * Returns null for anonymous visitors and non-admin accounts.
 */
export async function getAdminSession(
  request: Request,
): Promise<AdminSession | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return null;

  return {
    user: { id: user.id, name: user.name, email: user.email },
  };
}

/**
 * Authorization guard for admin loaders/actions. Redirects anonymous or
 * non-admin requests to the login page, preserving where they were headed.
 */
export async function requireAdmin(request: Request): Promise<AdminSession> {
  const session = await getAdminSession(request);
  if (session) return session;

  const url = new URL(request.url);
  const redirectTo = sanitizeRedirectTo(`${url.pathname}${url.search}`);
  throw redirect(`/admin/login?redirectTo=${encodeURIComponent(redirectTo)}`);
}
