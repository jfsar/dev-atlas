import "dotenv/config";
import { createOTP } from "@better-auth/utils/otp";

const BASE = "http://localhost:5173";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Missing ADMIN_EMAIL / ADMIN_PASSWORD in env");
  process.exit(1);
}

const jar = new Map();

function storeCookies(response) {
  for (const raw of response.headers.getSetCookie()) {
    const [pair] = raw.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (value === "" || /max-age=0/i.test(raw)) {
      jar.delete(name);
    } else {
      jar.set(name, value);
    }
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function post(path, body) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE,
      Cookie: cookieHeader(),
    },
    body: JSON.stringify(body),
  });
  storeCookies(response);
  let json = null;
  try {
    json = await response.clone().json();
  } catch {
    json = null;
  }
  return { status: response.status, ok: response.ok, json };
}

async function get(path) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookieHeader(), Origin: BASE },
  });
  storeCookies(response);
  return { status: response.status, json: await response.clone().json() };
}

function assert(condition, label) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    throw new Error(label);
  }
  console.log(`ok: ${label}`);
}

function codeFromSecret(secret) {
  return createOTP(secret, { period: 30, digits: 6 }).totp();
}

async function main() {
  let res = await post("/api/auth/sign-in/email", {
    email: EMAIL,
    password: PASSWORD,
  });
  assert(res.ok, `password sign-in (${res.status})`);
  assert(jar.has("better-auth.session_token"), "session cookie issued");

  res = await post("/api/auth/two-factor/enable", {
    password: PASSWORD,
    method: "totp",
  });
  assert(res.ok, `enable two-factor (${res.status})`);
  assert(typeof res.json?.totpURI === "string", "totpURI returned");
  assert(Array.isArray(res.json?.backupCodes), "backup codes returned");
  const secret = new URL(res.json.totpURI).searchParams.get("secret");
  const backupCode = res.json.backupCodes[0];
  assert(Boolean(secret), "secret present in totpURI");

  res = await post("/api/auth/two-factor/verify-totp", {
    code: await codeFromSecret(secret),
  });
  assert(res.ok, `verify-totp enrollment (${res.status})`);

  res = await get("/api/auth/get-session");
  assert(
    res.json?.user?.twoFactorEnabled === true,
    "user.twoFactorEnabled is true",
  );

  await post("/api/auth/sign-out", {});
  res = await post("/api/auth/sign-in/email", {
    email: EMAIL,
    password: PASSWORD,
  });
  assert(res.ok, `password sign-in with 2FA (${res.status})`);
  assert(res.json?.twoFactorRedirect === true, "twoFactorRedirect returned");
  assert(jar.has("better-auth.two_factor"), "two_factor cookie issued");
  assert(!jar.has("better-auth.session_token"), "no session before challenge");

  res = await post("/api/auth/two-factor/verify-totp", {
    code: await codeFromSecret(secret),
  });
  assert(res.ok, `verify-totp challenge (${res.status})`);
  assert(
    jar.has("better-auth.session_token"),
    "session issued after challenge",
  );

  await post("/api/auth/sign-out", {});
  res = await post("/api/auth/sign-in/email", {
    email: EMAIL,
    password: PASSWORD,
  });
  assert(res.json?.twoFactorRedirect === true, "challenge for backup test");
  res = await post("/api/auth/two-factor/verify-backup-code", {
    code: backupCode,
  });
  assert(res.ok, `verify backup code (${res.status})`);

  res = await post("/api/auth/two-factor/disable", { password: PASSWORD });
  assert(res.ok, `disable two-factor (${res.status})`);
  res = await get("/api/auth/get-session");
  assert(
    res.json?.user?.twoFactorEnabled === false,
    "user.twoFactorEnabled reset to false",
  );

  console.log("\nALL 2FA SMOKE CHECKS PASSED");
}

main().catch((error) => {
  console.error("Smoke test error:", error.message);
  process.exitCode = 1;
});
