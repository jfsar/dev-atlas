/**
 * Shared error vocabulary for server route boundaries. Keeps HTTP status codes
 * and user-facing messages consistent across loaders, actions, and resource
 * routes, and makes the failure category explicit for logging/telemetry.
 */
export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNEXPECTED";

export const APP_ERROR_STATUS: Record<AppErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHENTICATED: 401,
  UNAUTHORIZED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNEXPECTED: 500,
};

const DEFAULT_MESSAGE: Record<AppErrorCode, string> = {
  VALIDATION: "The submitted data is invalid.",
  UNAUTHENTICATED: "You must sign in to continue.",
  UNAUTHORIZED: "You do not have permission to do that.",
  NOT_FOUND: "The requested resource could not be found.",
  CONFLICT: "That change conflicts with existing data.",
  UNEXPECTED: "Something went wrong. Please try again.",
};

export interface AppErrorPayload {
  code: AppErrorCode;
  message: string;
  fields?: Record<string, string[]>;
}

export function appErrorStatus(code: AppErrorCode): number {
  return APP_ERROR_STATUS[code];
}

/** Build the JSON body for an error, applying the default message per code. */
export function appErrorPayload(
  code: AppErrorCode,
  options: { message?: string; fields?: Record<string, string[]> } = {},
): AppErrorPayload {
  return {
    code,
    message: options.message ?? DEFAULT_MESSAGE[code],
    ...(options.fields ? { fields: options.fields } : {}),
  };
}

/** Wrap an error payload in a JSON `Response` with the matching status. */
export function appErrorResponse(
  code: AppErrorCode,
  options: {
    message?: string;
    fields?: Record<string, string[]>;
    headers?: HeadersInit;
  } = {},
): Response {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(appErrorPayload(code, options)), {
    status: appErrorStatus(code),
    headers,
  });
}

/**
 * Log an unexpected error server-side and return a generic 500 response so
 * internal details never leak to the client.
 */
export function appUnexpectedError(error: unknown): Response {
  console.error("[unexpected-error]", error);
  return appErrorResponse("UNEXPECTED");
}
