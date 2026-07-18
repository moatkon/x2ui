import "server-only";

import { cookies, headers } from "next/headers";
import { ACCESS_TOKEN_COOKIE, requireBackendApiUrl } from "@/lib/auth-cookies";
import {
  authenticatedGet,
  authenticatedGetWithMetadata,
} from "./authenticated-api";

export type PublicUserSummary = {
  id: string;
  userName: string;
  displayName: string;
  avatarUrl?: string;
};

export type MeSummary = {
  user: PublicUserSummary;
  emailMasked: string;
  emailVerified: boolean;
  counts: {
    unreadNotifications: number;
    drafts: number;
    bookmarks: number;
    following: number;
  };
  security: {
    activeSessions: number;
    passwordChangedAt?: string;
  };
};

export type EditableProfile = {
  displayName: string;
  bio: string;
  location?: string;
  avatarUploadId?: string;
  version: number;
};

export type PrivacyPreferences = {
  mentionable: boolean;
  showFollowing: boolean;
  indexPublicProfile: boolean;
  version: number;
};

export type NotificationChannel = {
  inApp: boolean;
  emailDigest: boolean;
};

export type NotificationPreferences = {
  reply: NotificationChannel;
  mention: NotificationChannel;
  follow: NotificationChannel;
  reaction: NotificationChannel;
  governance: NotificationChannel;
  security: NotificationChannel;
  version: number;
};

export type AccountSession = {
  id: string;
  deviceName: string;
  browser: string;
  approximateLocation?: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
  riskState: "NORMAL" | "REAUTH_REQUIRED";
};

export type AccountNotification = {
  id: string;
  type: string;
  title: string;
  summary: string;
  createdAt: string;
  readAt?: string;
  deepLink: { route: string; anchorKey?: string };
};

export type Draft = {
  id: string;
  title: string;
  bodyMarkdown: string;
  nodePath?: { parentNodeId: string; childNodeId?: string };
  tagLabels: string[];
  uploadIds: string[];
  status: "EDITING" | "PUBLISHING" | "PUBLISHED";
  completionPercent: number;
  updatedAt: string;
  version: number;
};

export type Report = {
  id: string;
  target: {
    type: string;
    id: string;
    label: string;
    publicUrl?: string;
  };
  reason: string;
  details: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  timeline: Array<{ status: string; at: string; publicMessage: string }>;
  resolution?: { category: "ACTION_TAKEN" | "NO_VIOLATION"; message: string };
};

export type BlockedUser = {
  user: PublicUserSummary;
  blockedAt: string;
};

export type Enforcement = {
  id: string;
  kind: string;
  subject: { type: string; id: string; label: string };
  effectiveAt: string;
  expiresAt?: string;
  appealDeadline: string;
  appealable: boolean;
};

export type Appeal = {
  id: string;
  enforcement: Enforcement;
  reason: string;
  statement: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  version: number;
  supplements: Array<{ id: string; statement: string; createdAt: string }>;
  decision?: { outcome: string; reason: string; decidedAt: string };
};

export type CursorPage<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};

export const getMeSummary = () =>
  authenticatedGet<MeSummary>("/users/me/summary");

export async function getOptionalMeSummary() {
  const accessToken = (await headers()).get("x-x2-access-token")
    ?? (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;
  const response = await fetch(`${requireBackendApiUrl()}/api/v1/users/me/summary`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return null;
  return response.json() as Promise<MeSummary>;
}

export const getEditableProfile = () =>
  authenticatedGetWithMetadata<EditableProfile>("/users/me/profile");

export const getPrivacyPreferences = () =>
  authenticatedGetWithMetadata<PrivacyPreferences>(
    "/users/me/privacy-preferences",
  );

export const getNotificationPreferences = () =>
  authenticatedGetWithMetadata<NotificationPreferences>(
    "/users/me/notification-preferences",
  );

export async function getSessions() {
  return (await authenticatedGet<{ items: AccountSession[] }>("/auth/sessions"))
    .items;
}

function cursorQuery(cursor?: string, entries: Record<string, string> = {}) {
  const query = new URLSearchParams({ ...entries, limit: "50" });
  if (cursor) query.set("cursor", cursor);
  return query;
}

export function getNotifications(cursor?: string) {
  return authenticatedGet<CursorPage<AccountNotification>>(
    `/notifications?${cursorQuery(cursor)}`,
  );
}

export function getDrafts(cursor?: string) {
  return authenticatedGet<CursorPage<Draft>>(
    `/drafts?${cursorQuery(cursor, { status: "EDITING" })}`,
  );
}

export const getDraft = (id: string) =>
  authenticatedGet<Draft>(`/drafts/${encodeURIComponent(id)}`);

export function getReports(cursor?: string) {
  return authenticatedGet<CursorPage<Report>>(
    `/users/me/reports?${cursorQuery(cursor)}`,
  );
}

export const getReport = (id: string) =>
  authenticatedGet<Report>(`/users/me/reports/${encodeURIComponent(id)}`);

export function getBlockedUsers(cursor?: string) {
  return authenticatedGet<CursorPage<BlockedUser>>(
    `/users/me/blocked-users?${cursorQuery(cursor)}`,
  );
}

export function getAppeals(cursor?: string) {
  return authenticatedGet<CursorPage<Appeal>>(
    `/users/me/appeals?${cursorQuery(cursor)}`,
  );
}

export const getAppeal = (id: string) =>
  authenticatedGet<Appeal>(`/appeals/${encodeURIComponent(id)}`);

export function getAppealableEnforcements(cursor?: string) {
  return authenticatedGet<CursorPage<Enforcement>>(
    `/users/me/appealable-enforcements?${cursorQuery(cursor)}`,
  );
}
