export function sanitizeRedirectTo(
  value: string | null | undefined,
  fallback = "/admin",
): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (trimmed.length === 0) return fallback;
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("/\\")) return fallback;
  if (trimmed.startsWith("/admin/login")) return fallback;
  if (/[\r\n\t]/.test(trimmed)) return fallback;
  return trimmed;
}
