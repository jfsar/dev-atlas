import { data, Form, Link, redirect, useSearchParams } from "react-router";
import {
  KeyRoundIcon,
  LogInIcon,
  RouteIcon,
  ShieldCheckIcon,
} from "lucide-react";

import type { Route } from "./+types/admin-login";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { auth } from "~/lib/auth.server";
import { prisma } from "~/lib/prisma";
import { getClientIp, loginRateLimiter } from "~/lib/rate-limit.server";
import { sanitizeRedirectTo } from "~/lib/safe-redirect";
import { getAdminSession } from "~/lib/session.server";
import { adminLoginSchema, twoFactorCodeSchema } from "~/lib/validation/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getAdminSession(request);
  if (session) {
    const redirectTo = sanitizeRedirectTo(
      new URL(request.url).searchParams.get("redirectTo"),
    );
    throw redirect(redirectTo);
  }
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin sign in · DevAtlas" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");
  const email = form.get("email");
  const password = form.get("password");
  const code = form.get("code");
  const redirectTo = sanitizeRedirectTo(
    typeof form.get("redirectTo") === "string"
      ? (form.get("redirectTo") as string)
      : null,
  );

  const values = { email: typeof email === "string" ? email : "", redirectTo };

  if (intent === "verify-totp" || intent === "verify-backup") {
    const parsedCode = twoFactorCodeSchema.safeParse({ code });
    if (!parsedCode.success) {
      return {
        step: "challenge" as const,
        error: parsedCode.error.issues[0]?.message ?? "Enter your code.",
        values,
      };
    }

    const ip = getClientIp(request);
    const limit = loginRateLimiter(ip);
    if (!limit.allowed) {
      return {
        step: "challenge" as const,
        error: `Too many attempts. Try again in ${Math.ceil(
          limit.retryAfterMs / 1000,
        )} seconds.`,
        values,
      };
    }

    const response =
      intent === "verify-backup"
        ? await auth.api.verifyBackupCode({
            body: { code: parsedCode.data.code },
            headers: request.headers,
            asResponse: true,
          })
        : await auth.api.verifyTOTP({
            body: { code: parsedCode.data.code },
            headers: request.headers,
            asResponse: true,
          });

    if (!response.ok) {
      return {
        step: "challenge" as const,
        error: "That code is invalid or expired. Try again.",
        values,
      };
    }

    const headers = new Headers();
    for (const cookie of response.headers.getSetCookie()) {
      headers.append("Set-Cookie", cookie);
    }
    headers.set("Location", redirectTo);
    return new Response(null, { status: 302, headers });
  }

  const submit = {
    step: null,
    error: "Enter a valid email and password.",
    values,
  };

  const parsed = adminLoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return submit;
  }

  const ip = getClientIp(request);
  const limit = loginRateLimiter(ip);
  if (!limit.allowed) {
    return {
      step: null,
      error: `Too many sign-in attempts. Try again in ${Math.ceil(
        limit.retryAfterMs / 1000,
      )} seconds.`,
      values: { email: parsed.data.email, redirectTo },
    };
  }

  const account = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });
  if (!account || account.role !== "ADMIN") {
    return {
      step: null,
      error: "Invalid email or password.",
      values: { email: parsed.data.email, redirectTo },
    };
  }

  const response = await auth.api.signInEmail({
    body: { email: parsed.data.email, password: parsed.data.password },
    headers: request.headers,
    asResponse: true,
  });

  if (!response.ok) {
    return {
      step: null,
      error: "Invalid email or password.",
      values: { email: parsed.data.email, redirectTo },
    };
  }

  const payload = (await response.json().catch(() => null)) as {
    twoFactorRedirect?: boolean;
  } | null;

  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }

  if (payload?.twoFactorRedirect) {
    return data(
      {
        step: "challenge" as const,
        error: null,
        values: { email: parsed.data.email, redirectTo },
      },
      { headers },
    );
  }

  headers.set("Location", redirectTo);
  return new Response(null, { status: 302, headers });
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const email = actionData?.values.email ?? "";
  const redirectTo =
    actionData?.values.redirectTo ?? searchParams.get("redirectTo") ?? "";
  const isChallenge = actionData?.step === "challenge";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <Link
        to="/"
        className="flex items-center gap-2 font-heading text-base font-semibold"
      >
        <RouteIcon className="size-5" aria-hidden />
        DevAtlas
      </Link>

      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {isChallenge ? "Two-factor verification" : "Admin sign in"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isChallenge
            ? "Enter the code from your authenticator app, or use a backup code."
            : "Authorized editors only. Public registration is disabled."}
        </p>

        {isChallenge ? (
          <Form method="post" className="mt-6 space-y-4">
            <input type="hidden" name="email" value={email} />
            {redirectTo ? (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="code">Authentication code</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>

            {actionData?.error ? (
              <Alert variant="destructive">
                <AlertTitle>Verification failed</AlertTitle>
                <AlertDescription>{actionData.error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              name="intent"
              value="verify-totp"
              className="w-full"
            >
              <ShieldCheckIcon aria-hidden />
              Verify and sign in
            </Button>
            <Button
              type="submit"
              name="intent"
              value="verify-backup"
              variant="outline"
              className="w-full"
            >
              <KeyRoundIcon aria-hidden />
              Use a backup code
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/admin/login">Back to sign in</Link>
            </Button>
          </Form>
        ) : (
          <Form method="post" className="mt-6 space-y-4">
            {redirectTo ? (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                defaultValue={email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {actionData?.error ? (
              <Alert variant="destructive">
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{actionData.error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full">
              <LogInIcon aria-hidden />
              Sign in
            </Button>
          </Form>
        )}
      </div>

      <Button asChild variant="link" size="sm">
        <Link to="/">Back to DevAtlas</Link>
      </Button>
    </div>
  );
}
