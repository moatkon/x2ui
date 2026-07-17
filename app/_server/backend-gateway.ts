import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, usesBackendApi } from "@/lib/auth-cookies";
import { mutationOriginAllowed, selectBrowserResponseBody } from "@/lib/bff-policy.mjs";

type AuthSessionPayload = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  [key: string]: unknown;
};

const requestHeadersToDrop = new Set([
  "authorization",
  "connection",
  "content-length",
  "cookie",
  "host",
  "transfer-encoding",
]);

const responseHeadersToDrop = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "set-cookie",
  "transfer-encoding",
]);

function backendBaseUrl() {
  const configured = process.env.X2API_BASE_URL;
  if (!configured) throw new Error("X2API_BASE_URL is required when the backend API mode is enabled");
  return configured.replace(/\/+$/, "");
}

function backendUrl(request: NextRequest, segments: string[]) {
  const url = new URL(`${backendBaseUrl()}/api/v1/${segments.map(encodeURIComponent).join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  return url;
}

function outboundHeaders(request: NextRequest, accessToken?: string) {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!requestHeadersToDrop.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("accept", request.headers.get("accept") ?? "application/json");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  return headers;
}

async function requestBody(request: NextRequest) {
  return request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();
}

async function callBackend(
  request: NextRequest,
  segments: string[],
  accessToken?: string,
  body?: ArrayBuffer,
) {
  return fetch(backendUrl(request, segments), {
    method: request.method,
    headers: outboundHeaders(request, accessToken),
    body,
    cache: "no-store",
    redirect: "manual",
  });
}

function maxAge(expiresAt: string) {
  const milliseconds = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(milliseconds / 1000));
}

function setSessionCookies(response: NextResponse, payload: AuthSessionPayload) {
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    priority: "high" as const,
  };
  response.cookies.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    ...common,
    maxAge: maxAge(payload.accessExpiresAt),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
    ...common,
    maxAge: maxAge(payload.refreshExpiresAt),
  });
}

function clearSessionCookies(response: NextResponse) {
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    priority: "high" as const,
  };
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", common);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", common);
}

function isAuthSessionPayload(value: unknown): value is AuthSessionPayload {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.accessToken === "string"
    && typeof item.accessExpiresAt === "string"
    && typeof item.refreshToken === "string"
    && typeof item.refreshExpiresAt === "string";
}

async function refreshSession(refreshToken: string) {
  const response = await fetch(`${backendBaseUrl()}/api/v1/auth/session-refreshes`, {
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

async function toNextResponse(
  backendResponse: Response,
  sessionCookies?: AuthSessionPayload | null,
  sanitizeSessionResponse = false,
  clearSession = false,
) {
  const headers = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (!responseHeadersToDrop.has(key.toLowerCase())) headers.set(key, value);
  });

  const backendBody: BodyInit | null = backendResponse.status === 204
    ? null
    : await backendResponse.arrayBuffer();
  const selectedBody = selectBrowserResponseBody(
    backendBody,
    sessionCookies,
    sanitizeSessionResponse,
  );
  const body = selectedBody === null || typeof selectedBody === "string" || selectedBody instanceof ArrayBuffer
    ? selectedBody
    : new Uint8Array(selectedBody);

  if (sessionCookies && sanitizeSessionResponse) {
    headers.set("content-type", "application/json");
  }

  const response = new NextResponse(body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers,
  });
  if (sessionCookies) setSessionCookies(response, sessionCookies);
  if (clearSession) clearSessionCookies(response);
  return response;
}

function isSessionCreation(segments: string[], method: string) {
  return method === "POST" && segments.join("/") === "auth/sessions";
}

function isSessionRefresh(segments: string[], method: string) {
  return method === "POST" && segments.join("/") === "auth/session-refreshes";
}

function isSessionDeletion(segments: string[], method: string) {
  return method === "DELETE" && segments.join("/") === "auth/current-session";
}

export async function proxyBackendRequest(request: NextRequest, segments: string[]) {
  if (!mutationOriginAllowed({
    method: request.method,
    origin: request.headers.get("origin"),
    requestUrl: request.url,
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProtocol: request.headers.get("x-forwarded-proto"),
  })) {
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    return NextResponse.json({
      type: `${request.nextUrl.origin}/problems/invalid-request-origin`,
      title: "Forbidden",
      status: 403,
      code: "INVALID_REQUEST_ORIGIN",
      detail: "写操作只接受同源请求",
      instance: request.nextUrl.pathname,
      requestId,
      fieldErrors: [],
    }, {
      status: 403,
      headers: {
        "Content-Type": "application/problem+json",
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    });
  }
  const body = await requestBody(request);
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let backendResponse = await callBackend(request, segments, accessToken, body);
  let rotatedSession: AuthSessionPayload | null = null;

  if (
    backendResponse.status === 401
    && !isSessionCreation(segments, request.method)
    && !isSessionRefresh(segments, request.method)
  ) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      rotatedSession = await refreshSession(refreshToken);
      if (rotatedSession) {
        backendResponse = await callBackend(request, segments, rotatedSession.accessToken, body);
      }
    }
  }

  if (
    backendResponse.ok
    && (isSessionCreation(segments, request.method) || isSessionRefresh(segments, request.method))
  ) {
    const payload: unknown = await backendResponse.clone().json().catch(() => null);
    if (isAuthSessionPayload(payload)) return toNextResponse(backendResponse, payload, true);
  }

  const shouldClear = isSessionDeletion(segments, request.method)
    || (backendResponse.status === 401 && Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE)));
  return toNextResponse(backendResponse, rotatedSession, false, shouldClear);
}

export { usesBackendApi };
