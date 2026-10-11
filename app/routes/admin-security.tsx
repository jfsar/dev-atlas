import { Form, useSearchParams } from "react-router";
import {
  KeyRoundIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
} from "lucide-react";

import type { Route } from "./+types/admin-security";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { auth } from "~/lib/auth.server";
import { prisma } from "~/lib/prisma";
import { totpQrSvg, totpSecretFromUri } from "~/lib/qr.server";
import { requireAdmin } from "~/lib/session.server";
import {
  twoFactorCodeSchema,
  twoFactorPasswordSchema,
} from "~/lib/validation/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAdmin(request);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, twoFactorEnabled: true },
  });
  return {
    email: user?.email ?? session.user.email,
    twoFactorEnabled: user?.twoFactorEnabled ?? false,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Security · DevAtlas Admin" },
    { name: "robots", content: "noindex" },
  ];
}

function cookieHeaders(response: Response): Headers {
  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }
  return headers;
}

async function errorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

function parseBackupCodes(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((code): code is string => typeof code === "string")
      : [];
  } catch {
    return [];
  }
}

async function verifyView(
  totpURI: string,
  backupCodes: string[],
  error: string,
) {
  return {
    stage: "verify" as const,
    totpURI,
    secret: totpSecretFromUri(totpURI),
    qrSvg: totpURI ? await totpQrSvg(totpURI) : "",
    backupCodes,
    error,
  };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "begin") {
    const parsed = twoFactorPasswordSchema.safeParse({
      password: form.get("password"),
    });
    if (!parsed.success) {
      return {
        stage: "error" as const,
        error: parsed.error.issues[0]?.message ?? "Password is required.",
      };
    }

    const response = await auth.api.enableTwoFactor({
      body: {
        password: parsed.data.password,
        method: "totp",
        issuer: "DevAtlas",
      },
      headers: request.headers,
      asResponse: true,
    });
    if (!response.ok) {
      return {
        stage: "error" as const,
        error: await errorMessage(
          response,
          "Could not start two-factor setup. Check your password and try again.",
        ),
      };
    }

    const result = (await response.json()) as {
      totpURI: string;
      backupCodes: string[];
    };
    return {
      stage: "verify" as const,
      totpURI: result.totpURI,
      secret: totpSecretFromUri(result.totpURI),
      qrSvg: await totpQrSvg(result.totpURI),
      backupCodes: result.backupCodes,
      error: null,
    };
  }

  if (intent === "verify") {
    const totpURI = String(form.get("totpURI") ?? "");
    const backupCodes = parseBackupCodes(form.get("backupCodes"));
    const parsed = twoFactorCodeSchema.safeParse({ code: form.get("code") });
    if (!parsed.success) {
      return verifyView(
        totpURI,
        backupCodes,
        parsed.error.issues[0]?.message ?? "Enter the 6-digit code.",
      );
    }

    const response = await auth.api.verifyTOTP({
      body: { code: parsed.data.code },
      headers: request.headers,
      asResponse: true,
    });
    if (!response.ok) {
      return verifyView(
        totpURI,
        backupCodes,
        "That code is invalid or expired. Try again.",
      );
    }

    const headers = cookieHeaders(response);
    headers.set("Location", "/admin/security?enabled=1");
    return new Response(null, { status: 302, headers });
  }

  if (intent === "disable") {
    const parsed = twoFactorPasswordSchema.safeParse({
      password: form.get("password"),
    });
    if (!parsed.success) {
      return {
        stage: "error" as const,
        error: parsed.error.issues[0]?.message ?? "Password is required.",
      };
    }

    const response = await auth.api.disableTwoFactor({
      body: { password: parsed.data.password },
      headers: request.headers,
      asResponse: true,
    });
    if (!response.ok) {
      return {
        stage: "error" as const,
        error: await errorMessage(
          response,
          "Could not disable two-factor authentication. Check your password.",
        ),
      };
    }

    const headers = cookieHeaders(response);
    headers.set("Location", "/admin/security?disabled=1");
    return new Response(null, { status: 302, headers });
  }

  if (intent === "regenerate") {
    const parsed = twoFactorPasswordSchema.safeParse({
      password: form.get("password"),
    });
    if (!parsed.success) {
      return {
        stage: "error" as const,
        error: parsed.error.issues[0]?.message ?? "Password is required.",
      };
    }

    const response = await auth.api.generateBackupCodes({
      body: { password: parsed.data.password },
      headers: request.headers,
      asResponse: true,
    });
    if (!response.ok) {
      return {
        stage: "error" as const,
        error: await errorMessage(
          response,
          "Could not regenerate backup codes. Check your password.",
        ),
      };
    }

    const result = (await response.json()) as { backupCodes: string[] };
    return {
      stage: "regenerated" as const,
      backupCodes: result.backupCodes,
      error: null,
    };
  }

  return { stage: "error" as const, error: "Unknown action." };
}

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
      {codes.map((code) => (
        <li
          key={code}
          className="rounded-md border bg-muted/40 px-2 py-1 text-center select-all"
        >
          {code}
        </li>
      ))}
    </ul>
  );
}

export default function AdminSecurity({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { email, twoFactorEnabled } = loaderData;
  const [searchParams] = useSearchParams();
  const notice = searchParams.get("enabled")
    ? "Two-factor authentication is now enabled."
    : searchParams.get("disabled")
      ? "Two-factor authentication has been disabled."
      : null;

  const verifying = actionData?.stage === "verify";
  const error = actionData?.error ?? null;
  const regeneratedCodes =
    actionData?.stage === "regenerated" ? actionData.backupCodes : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Security
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Protect the {email} account with two-factor authentication.
        </p>
      </header>

      {notice ? (
        <Alert>
          <ShieldCheckIcon aria-hidden />
          <AlertTitle>Updated</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {verifying ? (
        <Card>
          <CardHeader>
            <CardTitle>Set up your authenticator app</CardTitle>
            <CardDescription>
              Scan the QR code, or enter the setup key manually, then confirm
              with a generated code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div
                role="img"
                aria-label="QR code to add this account to your authenticator app"
                className="w-fit rounded-md border bg-white p-3 [&>svg]:size-48"
                dangerouslySetInnerHTML={{ __html: actionData.qrSvg }}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Setup key</p>
                <code className="block rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm break-all select-all">
                  {actionData.secret}
                </code>
                <p className="text-xs text-muted-foreground">
                  Tip: codes rotate every 30 seconds. Submit the code shown
                  after the QR scan.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Backup codes</p>
              <p className="text-xs text-muted-foreground">
                Store these somewhere safe. Each code can be used once to sign
                in if you lose your device.
              </p>
              <BackupCodes codes={actionData.backupCodes} />
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="totpURI" value={actionData.totpURI} />
              <input
                type="hidden"
                name="backupCodes"
                value={JSON.stringify(actionData.backupCodes)}
              />
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>
              <Button type="submit" name="intent" value="verify">
                <ShieldCheckIcon aria-hidden />
                Confirm and enable
              </Button>
            </Form>
          </CardContent>
        </Card>
      ) : twoFactorEnabled ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication is enabled</CardTitle>
              <CardDescription>
                You&apos;ll be asked for a code from your authenticator app each
                time you sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="regenerate" />
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="regenerate-password">Password</Label>
                  <Input
                    id="regenerate-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" variant="outline">
                  <RefreshCwIcon aria-hidden />
                  Regenerate backup codes
                </Button>
              </Form>
            </CardContent>
          </Card>

          {regeneratedCodes ? (
            <Card>
              <CardHeader>
                <CardTitle>New backup codes</CardTitle>
                <CardDescription>
                  Previous codes are now invalid. Store these somewhere safe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackupCodes codes={regeneratedCodes} />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Disable two-factor authentication</CardTitle>
              <CardDescription>
                Removing two-factor authentication makes your account less
                secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="disable" />
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="disable-password">Password</Label>
                  <Input
                    id="disable-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" variant="destructive">
                  <ShieldOffIcon aria-hidden />
                  Disable two-factor authentication
                </Button>
              </Form>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Enable two-factor authentication</CardTitle>
            <CardDescription>
              Add a second step to sign-in using an authenticator app such as
              1Password, Authy, or Google Authenticator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="begin" />
              <div className="max-w-xs space-y-2">
                <Label htmlFor="begin-password">Confirm your password</Label>
                <Input
                  id="begin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit">
                <KeyRoundIcon aria-hidden />
                Begin setup
              </Button>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
