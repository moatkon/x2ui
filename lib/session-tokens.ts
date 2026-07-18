import { requireBackendApiUrl } from "./auth-cookies";
export { accessTokenExpiresSoon } from "./token-expiry.mjs";

export type AuthSessionPayload = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  [key: string]: unknown;
};

export function isAuthSessionPayload(value: unknown): value is AuthSessionPayload {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.accessToken === "string"
    && typeof item.accessExpiresAt === "string"
    && typeof item.refreshToken === "string"
    && typeof item.refreshExpiresAt === "string";
}

export async function refreshSessionTokens(refreshToken: string) {
  const response = await fetch(`${requireBackendApiUrl()}/api/v1/auth/session-refreshes`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
      "X-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  return response.ok && isAuthSessionPayload(payload) ? payload : null;
}
