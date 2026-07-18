import { resolveOriginPolicy } from "./origin-policy.mjs";

export const ORIGIN_POLICY = resolveOriginPolicy(
  process.env.SITE_URL,
  process.env.X2API_BASE_URL,
  process.env.NODE_ENV === "production",
);

export const ACCESS_TOKEN_COOKIE = ORIGIN_POLICY.accessCookieName;
export const REFRESH_TOKEN_COOKIE = ORIGIN_POLICY.refreshCookieName;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ORIGIN_POLICY.secureCookies,
  sameSite: "lax" as const,
  path: "/",
  priority: "high" as const,
};

export function requireBackendApiUrl() {
  const value = process.env.X2API_BASE_URL;
  if (!value) throw new Error("X2API_BASE_URL is required; x2ui does not provide mock runtime data");
  return value.replace(/\/+$/, "");
}
