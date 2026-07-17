export const ACCESS_TOKEN_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-x2post_access" : "x2post_access";

export const REFRESH_TOKEN_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-x2post_refresh" : "x2post_refresh";

export function usesBackendApi() {
  return Boolean(process.env.X2API_BASE_URL) && process.env.X2API_API_MODE !== "mock";
}
