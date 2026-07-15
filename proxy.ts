import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyMockSession } from "@/lib/mock-session";

const privatePrefixes = ["/settings", "/me", "/quick-compose", "/compose", "/drafts", "/bookmarks", "/following", "/notifications", "/reports", "/report", "/appeals", "/journey", "/quests", "/play"];
const governancePrefixes = ["/moderation", "/admin"];

function needsSession(pathname: string) {
  if (pathname === "/coins/rules" || pathname === "/coins/economy") return false;
  return pathname === "/coins" || pathname.startsWith("/coins/") || privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || governancePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!needsSession(pathname)) return NextResponse.next();
  const session = await verifyMockSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  if (governancePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) && !["moderator", "controller"].includes(session.role)) return NextResponse.redirect(new URL("/403", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|opengraph-image).*)"] };
