import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, requireBackendApiUrl } from "@/lib/auth-cookies";
import { headers } from "next/headers";

export async function requirePageSession(requiredRole?: "moderator" | "controller") {
  const cookieStore = await cookies();
  const refreshedAccessToken = (await headers()).get("x-x2-access-token");
  const accessToken = refreshedAccessToken ?? cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasSession = Boolean(accessToken || cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);
  if (!hasSession || !accessToken) redirect("/login");
  if (requiredRole) {
    const capabilityProbe = requiredRole === "controller"
      ? "/api/v1/admin/coin-budgets/current"
      : "/api/v1/moderation/cases?limit=1";
    const response = await fetch(`${requireBackendApiUrl()}${capabilityProbe}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (response.status === 401) redirect("/login");
    if (response.status === 403 || response.status === 404) redirect("/403");
    if (!response.ok) throw new Error(`Capability verification failed with ${response.status}`);
  }
  return { authenticated: true };
}
