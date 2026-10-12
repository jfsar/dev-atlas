import { z } from "zod";

/**
 * Schema for the server-side environment. Validating up front means missing or
 * malformed configuration fails fast with an actionable message instead of
 * surfacing as an opaque runtime error.
 */
export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  // Optional Neon overrides: pooled for app traffic (fetch/insert), unpooled
  // for seeding and migrations. When unset, DATABASE_URL is used.
  NEON_DB_POOLED_URL: z.url().optional(),
  NEON_DB_UNPOOLED_URL: z.url().optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be at least 16 characters."),
  BETTER_AUTH_URL: z.url().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Parse and validate the environment. Pure and side-effect free so it can be
 * unit tested with an explicit source object.
 */
export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const invalid = result.error.issues
      .map((issue) => issue.path.join(".") || "environment")
      .join(", ");
    throw new Error(
      `Invalid server environment (${invalid}). Check your .env file — see .env.example.`,
    );
  }
  return result.data;
}

let cached: ServerEnv | undefined;

/** Lazily validate and memoize the environment on first use. */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv();
  return cached;
}
