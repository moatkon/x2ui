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
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const withSecurityHeaders = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };

  if (!needsSession(pathname)) return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
  const session = await verifyMockSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return withSecurityHeaders(NextResponse.redirect(login));
  }
  if (governancePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) && !["moderator", "controller"].includes(session.role)) return withSecurityHeaders(NextResponse.redirect(new URL("/403", request.url)));
  return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: [{
    source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|opengraph-image).*)",
    missing: [
      { type: "header", key: "next-router-prefetch" },
      { type: "header", key: "purpose", value: "prefetch" },
    ],
  }],
};
