import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ORIGIN_POLICY,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth-cookies";
import { accessTokenExpiresSoon, refreshSessionTokens, type AuthSessionPayload } from "@/lib/session-tokens";

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
    `img-src 'self' data: blob: ${ORIGIN_POLICY.backendOrigin}`,
    "font-src 'self' data:",
    `connect-src 'self' ${ORIGIN_POLICY.backendOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ORIGIN_POLICY.upgradeInsecureRequests ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const withSecurityHeaders = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };
  const withSessionCookies = (response: NextResponse, session: AuthSessionPayload) => {
    response.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: Math.max(0, Math.floor((new Date(session.accessExpiresAt).getTime() - Date.now()) / 1000)),
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: Math.max(0, Math.floor((new Date(session.refreshExpiresAt).getTime() - Date.now()) / 1000)),
    });
    return response;
  };

  if (!needsSession(pathname)) return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hasSession = Boolean(accessToken || refreshToken);
  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return withSecurityHeaders(NextResponse.redirect(login));
  }
  if (refreshToken && accessTokenExpiresSoon(accessToken, Math.floor(Date.now() / 1000))) {
    const rotated = await refreshSessionTokens(refreshToken);
    if (!rotated) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      const response = withSecurityHeaders(NextResponse.redirect(login));
      response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
      response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
      return response;
    }
    requestHeaders.set("x-x2-access-token", rotated.accessToken);
    return withSessionCookies(
      withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } })),
      rotated,
    );
  }
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
