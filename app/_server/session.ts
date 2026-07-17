import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyMockSession } from "@/lib/mock-session";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, usesBackendApi } from "@/lib/auth-cookies";

export async function requirePageSession(requiredRole?: "moderator" | "controller") {
  const cookieStore = await cookies();
  if (usesBackendApi()) {
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const hasSession = Boolean(accessToken || cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);
    if (!hasSession || !accessToken) redirect("/login");
    if (requiredRole) {
      const backend = process.env.X2API_BASE_URL?.replace(/\/+$/, "");
      if (!backend) redirect("/login");
      const capabilityProbe = requiredRole === "controller"
        ? "/api/v1/admin/coin-budgets/current"
        : "/api/v1/moderation/cases?limit=1";
      const response = await fetch(`${backend}${capabilityProbe}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (response.status === 401) redirect("/login");
      if (response.status === 403 || response.status === 404) redirect("/403");
      if (!response.ok) throw new Error(`Capability verification failed with ${response.status}`);
    }
    return { authenticated: true };
  }
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifyMockSession(token);
  if (!session) redirect("/login");
  if (requiredRole === "moderator" && !["moderator", "controller"].includes(session.role)) redirect("/403");
  if (requiredRole === "controller" && session.role !== "controller") redirect("/403");
  return session;
}
