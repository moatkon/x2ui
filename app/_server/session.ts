import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyMockSession } from "@/lib/mock-session";

export async function requirePageSession(requiredRole?: "moderator" | "controller") {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifyMockSession(token);
  if (!session) redirect("/login");
  if (requiredRole === "moderator" && !["moderator", "controller"].includes(session.role)) redirect("/403");
  if (requiredRole === "controller" && session.role !== "controller") redirect("/403");
  return session;
}
