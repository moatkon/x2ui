import "server-only";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, requireBackendApiUrl } from "@/lib/auth-cookies";
import { toPostSummary, type ApiPostSummary } from "./public-content";

export type CursorPage<T> = { items: T[]; nextCursor?: string; hasMore: boolean };

export async function authenticatedGet<T>(path: string): Promise<T> {
  return (await authenticatedGetWithMetadata<T>(path)).data;
}

export async function authenticatedGetWithMetadata<T>(
  path: string,
): Promise<{ data: T; etag?: string }> {
  const accessToken = (await headers()).get("x-x2-access-token")
    ?? (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) redirect("/login");
  const response = await fetch(`${requireBackendApiUrl()}/api/v1${path}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/login");
  if (response.status === 403) redirect("/403");
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(problem?.detail ?? `Authenticated API request failed: ${path}`);
  }
  return {
    data: await response.json() as T,
    etag: response.headers.get("etag") ?? undefined,
  };
}

export async function getMyBookmarks(cursor?: string) {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) query.set("cursor", cursor);
  const page = await authenticatedGet<CursorPage<ApiPostSummary>>(`/users/me/bookmarks?${query}`);
  return { ...page, items: page.items.map((item) => toPostSummary(item)) };
}

export async function getFollowingFeed(cursor?: string) {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) query.set("cursor", cursor);
  const page = await authenticatedGet<CursorPage<ApiPostSummary>>(`/feed/following?${query}`);
  return { ...page, items: page.items.map((item) => toPostSummary(item)) };
}
