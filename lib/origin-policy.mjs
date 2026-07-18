function requiredHttpUrl(value, name) {
  if (!value) throw new Error(`${name} is required`);
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https`);
  }
  return url;
}

function isLoopback(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function resolveOriginPolicy(siteUrl, backendUrl, production) {
  const site = requiredHttpUrl(siteUrl, "SITE_URL");
  const backend = requiredHttpUrl(backendUrl, "X2API_BASE_URL");
  const secureCookies = site.protocol === "https:";
  if (!secureCookies && !isLoopback(site.hostname)) {
    throw new Error("HTTP SITE_URL is only allowed for localhost, 127.0.0.1 or ::1");
  }
  return {
    siteOrigin: site.origin,
    backendOrigin: backend.origin,
    secureCookies,
    accessCookieName: secureCookies ? "__Host-x2post_access" : "x2post_access",
    refreshCookieName: secureCookies ? "__Host-x2post_refresh" : "x2post_refresh",
    upgradeInsecureRequests: Boolean(production && secureCookies && backend.protocol === "https:"),
  };
}
