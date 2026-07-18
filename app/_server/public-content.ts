import "server-only";

import type { CommunityNode, PostSummary } from "@/lib/models";
import { requireBackendApiUrl } from "@/lib/auth-cookies";

type CursorPage<T> = { items: T[]; nextCursor?: string; hasMore: boolean };
type ApiNodeSummary = {
  id: string; slug: string; name: string; level: "PARENT" | "CHILD";
  parentSlug?: string; description: string; postCount: number; followerCount: number;
};
type ApiNodeDetail = { node: ApiNodeSummary; ruleText: string; children: ApiNodeSummary[] };
export type ApiPostSummary = {
  id: string; title: string; displayTitle: string; excerpt: string;
  author: { userName: string; displayName: string; avatarUrl?: string };
  nodePath: { parent: ApiNodeSummary; child?: ApiNodeSummary; displayName: string };
  tags: Array<{ slug: string; label: string; publicPostCount: number }>;
  createdAt: string;
  counts: { comments: number; reactions: number; bookmarks: number };
};
export type ApiComment = {
  id: string; postId: string; anchorKey: string; bodyMarkdown: string;
  author: { userName: string; displayName: string; avatarUrl?: string };
  createdAt: string; replyCount: number; reactionCount: number;
};
export type ApiPublicUserSummary = { id: string; userName: string; displayName: string; avatarUrl?: string };
export type ApiPublicUser = {
  user: ApiPublicUserSummary;
  bio: string;
  location?: string;
  joinedAt: string;
  stats: { postCount: number; commentCount: number; followingCount: number; followerCount: number };
};
export type ApiTagSummary = { slug: string; label: string; publicPostCount: number };
export type ApiQuest = {
  id: string;
  title: string;
  description: string;
  status: "AVAILABLE" | "ACTIVE" | "UNAVAILABLE";
  cxpPotential: number;
};
export type ApiCurrentNodeProject = {
  project: {
    id: string;
    node: ApiNodeSummary;
    title: string;
    goal: string;
    status: "OPEN" | "ARCHIVED";
    memberCount: number;
    memberLimit: number;
    progress: { accepted: number; target: number };
    openTaskCount: number;
    participant: boolean;
    displayNamePublic?: boolean;
  };
  quests: ApiQuest[];
  acceptanceRule: string;
  contributors: ApiPublicUserSummary[];
};
export type ApiSeason = {
  slug: string;
  title: string;
  scope: string;
  status: "UPCOMING" | "ACTIVE" | "ARCHIVED";
  startsAt: string;
  endsAt: string;
  progress: { accepted: number; target: number };
  goal: string;
  acceptanceRule: string;
  archiveProjectId?: string;
};
export type ApiSeasonDetail = {
  season: ApiSeason;
  steps: Array<{ label: string; completed: boolean }>;
  availableQuestCount: number;
};
type ApiPostDetail = { post: ApiPostSummary; bodyMarkdown: string; bodyHtml: string };
type FeedResponse = {
  page: CursorPage<ApiPostSummary>;
  recovery: "NONE" | "INVALID_PARENT" | "INVALID_CHILD";
};

export class PublicApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function apiBaseUrl() {
  return requireBackendApiUrl();
}

async function publicGet<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string } | null;
    throw new PublicApiError(response.status, problem?.detail ?? `Public API request failed: ${path}`);
  }
  return response.json() as Promise<T>;
}

function createdLabel(value: string) {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(timestamp);
}

export function toPostSummary(post: ApiPostSummary, bodyMarkdown = ""): PostSummary {
  return {
    id: post.id,
    title: post.title || post.displayTitle,
    excerpt: post.excerpt,
    bodyMarkdown,
    author: post.author,
    nodePath: {
      parentSlug: post.nodePath.parent.slug,
      parentName: post.nodePath.parent.name,
      childSlug: post.nodePath.child?.slug,
      childName: post.nodePath.child?.name,
    },
    createdAt: post.createdAt,
    createdLabel: createdLabel(post.createdAt),
    commentCount: post.counts.comments,
    reactionCount: post.counts.reactions,
    tags: post.tags.map((tag) => tag.label),
  };
}

function toCommunityNode(detail: ApiNodeDetail): CommunityNode {
  return {
    id: detail.node.id,
    slug: detail.node.slug,
    name: detail.node.name,
    description: detail.node.description,
    postCount: detail.node.postCount,
    followerCount: detail.node.followerCount,
    rule: detail.ruleText,
    children: detail.children.map((child) => ({
      id: child.id,
      slug: child.slug,
      name: child.name,
      description: child.description,
      postCount: child.postCount,
      followerCount: child.followerCount,
      rule: "",
    })),
  };
}

export async function getPublicNodes() {
  const response = await publicGet<{ items: ApiNodeDetail[] }>("/nodes", 300);
  return response.items.map(toCommunityNode);
}

export async function getPublicNode(parentSlug: string, childSlug?: string) {
  try {
    const parentDetail = await publicGet<ApiNodeDetail>(`/nodes/${encodeURIComponent(parentSlug)}`, 300);
    const parent = toCommunityNode(parentDetail);
    if (!childSlug) return { parent, child: null };
    const childDetail = await publicGet<ApiNodeDetail>(
      `/nodes/${encodeURIComponent(parentSlug)}/children/${encodeURIComponent(childSlug)}`,
      300,
    );
    const child = {
      id: childDetail.node.id,
      slug: childDetail.node.slug,
      name: childDetail.node.name,
      description: childDetail.node.description,
      postCount: childDetail.node.postCount,
      followerCount: childDetail.node.followerCount,
      rule: childDetail.ruleText,
    };
    parent.children = parent.children.map((item) => item.id === child.id ? child : item);
    return { parent, child };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getPublicFeed(parentNode?: string, childNode?: string, cursor?: string) {
  const query = new URLSearchParams({ limit: "50" });
  if (parentNode) query.set("parentNode", parentNode);
  if (childNode) query.set("childNode", childNode);
  if (cursor) query.set("cursor", cursor);
  const response = await publicGet<FeedResponse>(`/feed?${query}`, 60);
  return {
    items: response.page.items.map((post) => toPostSummary(post)),
    recovery: response.recovery,
    nextCursor: response.page.nextCursor,
    hasMore: response.page.hasMore,
  };
}

export async function getPublicPost(postId: string) {
  try {
    const detail = await publicGet<ApiPostDetail>(`/posts/${encodeURIComponent(postId)}`, 60);
    return { post: toPostSummary(detail.post, detail.bodyMarkdown), bodyMarkdown: detail.bodyMarkdown };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

function publicCursorQuery(cursor?: string, entries: Record<string, string> = {}) {
  const query = new URLSearchParams({ ...entries, limit: "50" });
  if (cursor) query.set("cursor", cursor);
  return query;
}

export async function getPublicComments(postId: string, cursor?: string) {
  const response = await publicGet<CursorPage<ApiComment>>(
    `/posts/${encodeURIComponent(postId)}/comments?${publicCursorQuery(cursor, { sort: "OLDEST" })}`,
    30,
  );
  return response;
}

export async function getPublicCommentReplies(commentId: string, cursor?: string) {
  return publicGet<CursorPage<ApiComment>>(
    `/comments/${encodeURIComponent(commentId)}/replies?${publicCursorQuery(cursor)}`,
    30,
  );
}

export async function getPublicUser(userName: string) {
  try {
    return await publicGet<ApiPublicUser>(`/users/${encodeURIComponent(userName)}`, 60);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getPublicUserPosts(userName: string, cursor?: string) {
  const response = await publicGet<CursorPage<ApiPostSummary>>(
    `/users/${encodeURIComponent(userName)}/posts?${publicCursorQuery(cursor)}`,
    60,
  );
  return { ...response, items: response.items.map((post) => toPostSummary(post)) };
}

export function getPublicUserComments(userName: string, cursor?: string) {
  return publicGet<CursorPage<ApiComment>>(
    `/users/${encodeURIComponent(userName)}/comments?${publicCursorQuery(cursor)}`,
    60,
  );
}

export async function getPublicRelationshipUsers(
  userName: string,
  relationship: "followers" | "following",
  cursor?: string,
) {
  const query = publicCursorQuery(
    cursor,
    relationship === "following" ? { section: "USERS" } : {},
  );
  return publicGet<CursorPage<ApiPublicUserSummary>>(
    `/users/${encodeURIComponent(userName)}/${relationship}?${query}`,
    60,
  );
}

export function getPublicTags(cursor?: string) {
  return publicGet<CursorPage<ApiTagSummary>>(`/tags?${publicCursorQuery(cursor)}`, 300);
}

export async function getPublicTagPosts(slug: string, cursor?: string) {
  try {
    const response = await publicGet<{ tag: ApiTagSummary; page: CursorPage<ApiPostSummary> }>(
      `/tags/${encodeURIComponent(slug)}/posts?${publicCursorQuery(cursor)}`,
      60,
    );
    return {
      tag: response.tag,
      page: {
        ...response.page,
        items: response.page.items.map((post) => toPostSummary(post)),
      },
    };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export async function searchPublicPosts(query: string, sort = "RELEVANCE", cursor?: string, parentNode?: string, childNode?: string) {
  const params = new URLSearchParams({ q: query, sort, limit: "50" });
  if (cursor) params.set("cursor", cursor);
  if (parentNode) params.set("parentNode", parentNode);
  if (childNode) params.set("childNode", childNode);
  const response = await publicGet<CursorPage<ApiPostSummary>>(`/search/posts?${params}`, 30);
  return {
    items: response.items.map((post) => toPostSummary(post)),
    nextCursor: response.nextCursor,
    hasMore: response.hasMore,
  };
}

export async function searchPublicUsers(query: string, cursor?: string) {
  const params = new URLSearchParams({ q: query, limit: "50" });
  if (cursor) params.set("cursor", cursor);
  return publicGet<CursorPage<ApiPublicUserSummary>>(`/search/users?${params}`, 30);
}

export async function searchPublicNodes(query: string) {
  const params = new URLSearchParams({ q: query, limit: "50" });
  return (await publicGet<{ items: ApiNodeSummary[] }>(`/search/nodes?${params}`, 30)).items;
}

export async function searchPublicTags(query: string) {
  const params = new URLSearchParams({ q: query, limit: "50" });
  return (await publicGet<{ items: ApiTagSummary[] }>(`/search/tags?${params}`, 30)).items;
}

export async function getCurrentNodeProject(slug: string) {
  try {
    return await publicGet<ApiCurrentNodeProject>(
      `/nodes/${encodeURIComponent(slug)}/projects/current`,
      60,
    );
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export function getPublicSeasons(cursor?: string) {
  return publicGet<CursorPage<ApiSeason>>(
    `/seasons?${publicCursorQuery(cursor, { status: "ALL" })}`,
    300,
  );
}

export async function getPublicSeason(slug: string) {
  try {
    return await publicGet<ApiSeasonDetail>(
      `/seasons/${encodeURIComponent(slug)}`,
      300,
    );
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}
