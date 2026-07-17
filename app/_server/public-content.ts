import "server-only";

import type { CommunityNode, PostSummary } from "@/lib/mock-data";
import { comments as mockComments, currentUser, nodes as mockNodes, posts as mockPosts } from "@/lib/mock-data";
import { usesBackendApi } from "@/lib/auth-cookies";

type CursorPage<T> = { items: T[]; nextCursor?: string; hasMore: boolean };
type ApiNodeSummary = {
  id: string; slug: string; name: string; level: "PARENT" | "CHILD";
  parentSlug?: string; description: string; postCount: number; followerCount: number;
};
type ApiNodeDetail = { node: ApiNodeSummary; ruleText: string; children: ApiNodeSummary[] };
type ApiPostSummary = {
  id: string; title: string; displayTitle: string; excerpt: string;
  author: { userName: string; displayName: string };
  nodePath: { parent: ApiNodeSummary; child?: ApiNodeSummary; displayName: string };
  tags: Array<{ slug: string; label: string; publicPostCount: number }>;
  createdAt: string;
  counts: { comments: number; reactions: number; bookmarks: number };
};
export type ApiComment = {
  id: string; postId: string; anchorKey: string; bodyMarkdown: string;
  author: { userName: string; displayName: string };
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
  const value = process.env.X2API_BASE_URL;
  if (!value) throw new Error("X2API_BASE_URL is required");
  return value.replace(/\/+$/, "");
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

function toPostSummary(post: ApiPostSummary, bodyMarkdown = ""): PostSummary {
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
  if (!usesBackendApi()) return mockNodes;
  const response = await publicGet<{ items: ApiNodeDetail[] }>("/nodes", 300);
  return response.items.map(toCommunityNode);
}

export async function getPublicNode(parentSlug: string, childSlug?: string) {
  if (!usesBackendApi()) {
    const parent = mockNodes.find((node) => node.slug === parentSlug);
    if (!parent) return null;
    return { parent, child: childSlug ? parent.children.find((child) => child.slug === childSlug) ?? null : null };
  }
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

export async function getPublicFeed(parentNode?: string, childNode?: string) {
  if (!usesBackendApi()) {
    const items = mockPosts.filter((post) => childNode
      ? post.nodePath.parentSlug === parentNode && post.nodePath.childSlug === childNode
      : parentNode ? post.nodePath.parentSlug === parentNode : true);
    return { items, recovery: "NONE" as const };
  }
  const query = new URLSearchParams({ limit: "50" });
  if (parentNode) query.set("parentNode", parentNode);
  if (childNode) query.set("childNode", childNode);
  const response = await publicGet<FeedResponse>(`/feed?${query}`, 60);
  return { items: response.page.items.map((post) => toPostSummary(post)), recovery: response.recovery };
}

export async function getPublicPost(postId: string) {
  if (!usesBackendApi()) {
    const post = mockPosts.find((item) => item.id === postId);
    return post ? { post, bodyMarkdown: post.bodyMarkdown } : null;
  }
  try {
    const detail = await publicGet<ApiPostDetail>(`/posts/${encodeURIComponent(postId)}`, 60);
    return { post: toPostSummary(detail.post, detail.bodyMarkdown), bodyMarkdown: detail.bodyMarkdown };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getPublicComments(postId: string) {
  if (!usesBackendApi()) return mockComments.map((comment) => ({
    ...comment,
    postId,
    anchorKey: `comment-${comment.id}`,
    reactionCount: 0,
  }));
  const response = await publicGet<CursorPage<ApiComment>>(
    `/posts/${encodeURIComponent(postId)}/comments?sort=OLDEST&limit=100`,
    30,
  );
  return response.items;
}

export async function getPublicUser(userName: string) {
  if (!usesBackendApi()) {
    const authored = mockPosts.find((post) => post.author.userName === userName)?.author;
    if (!authored && userName !== currentUser.userName) return null;
    return {
      user: { id: `user-${userName}`, userName, displayName: authored?.displayName ?? currentUser.displayName },
      bio: userName === currentUser.userName ? currentUser.bio : "",
      location: userName === currentUser.userName ? currentUser.location : undefined,
      joinedAt: "2024-08-01T00:00:00Z",
      stats: userName === currentUser.userName
        ? currentUser.stats
        : { postCount: 1, commentCount: 0, followingCount: 0, followerCount: 0 },
    } satisfies ApiPublicUser;
  }
  try {
    return await publicGet<ApiPublicUser>(`/users/${encodeURIComponent(userName)}`, 60);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getPublicUserPosts(userName: string) {
  if (!usesBackendApi()) return mockPosts.filter((post) => post.author.userName === userName);
  const response = await publicGet<CursorPage<ApiPostSummary>>(
    `/users/${encodeURIComponent(userName)}/posts?limit=50`,
    60,
  );
  return response.items.map((post) => toPostSummary(post));
}

export async function getPublicUserComments(userName: string) {
  if (!usesBackendApi()) return mockComments.map((comment) => ({
    ...comment,
    postId: mockPosts[0]?.id ?? "post",
    anchorKey: `comment-${comment.id}`,
    reactionCount: 0,
  }));
  const response = await publicGet<CursorPage<ApiComment>>(
    `/users/${encodeURIComponent(userName)}/comments?limit=50`,
    60,
  );
  return response.items;
}

export async function getPublicRelationshipUsers(
  userName: string,
  relationship: "followers" | "following",
) {
  if (!usesBackendApi()) {
    return [
      { id: "user-qingyu", userName: "qingyu", displayName: "青屿" },
      { id: "user-ache", userName: "ache", displayName: "阿澈" },
      { id: "user-weekend", userName: "weekend", displayName: "周末写字" },
    ] satisfies ApiPublicUserSummary[];
  }
  const suffix = relationship === "following" ? "?section=USERS&limit=50" : "?limit=50";
  const response = await publicGet<CursorPage<ApiPublicUserSummary>>(
    `/users/${encodeURIComponent(userName)}/${relationship}${suffix}`,
    60,
  );
  return response.items;
}

export async function getPublicTags() {
  if (!usesBackendApi()) {
    return [...new Set(mockPosts.flatMap((post) => post.tags))].map((label) => ({
      slug: encodeURIComponent(label),
      label,
      publicPostCount: mockPosts.filter((post) => post.tags.includes(label)).length,
    }));
  }
  const response = await publicGet<CursorPage<ApiTagSummary>>("/tags?limit=100", 300);
  return response.items;
}

export async function getPublicTagPosts(slug: string) {
  if (!usesBackendApi()) {
    const label = decodeURIComponent(slug);
    const items = mockPosts.filter((post) => post.tags.includes(label));
    return items.length ? { tag: { slug, label, publicPostCount: items.length }, items } : null;
  }
  try {
    const response = await publicGet<{ tag: ApiTagSummary; page: CursorPage<ApiPostSummary> }>(
      `/tags/${encodeURIComponent(slug)}/posts?limit=50`,
      60,
    );
    return { tag: response.tag, items: response.page.items.map((post) => toPostSummary(post)) };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) return null;
    throw error;
  }
}

export async function searchPublicPosts(query: string) {
  if (!usesBackendApi()) return mockPosts.filter((post) => `${post.title}${post.excerpt}${post.tags.join("")}`.includes(query));
  const params = new URLSearchParams({ q: query, sort: "RELEVANCE", limit: "50" });
  const response = await publicGet<CursorPage<ApiPostSummary>>(`/search/posts?${params}`, 30);
  return response.items.map((post) => toPostSummary(post));
}

export async function searchPublicUsers(query: string) {
  if (!usesBackendApi()) {
    const profile = await getPublicUser(currentUser.userName);
    return profile ? [profile.user] : [];
  }
  const params = new URLSearchParams({ q: query, limit: "50" });
  return (await publicGet<CursorPage<ApiPublicUserSummary>>(`/search/users?${params}`, 30)).items;
}

export async function searchPublicNodes(query: string) {
  if (!usesBackendApi()) return mockNodes.filter((node) => `${node.name}${node.description}`.includes(query));
  const params = new URLSearchParams({ q: query, limit: "50" });
  return (await publicGet<{ items: ApiNodeSummary[] }>(`/search/nodes?${params}`, 30)).items;
}

export async function searchPublicTags(query: string) {
  if (!usesBackendApi()) return (await getPublicTags()).filter((tag) => tag.label.includes(query));
  const params = new URLSearchParams({ q: query, limit: "50" });
  return (await publicGet<{ items: ApiTagSummary[] }>(`/search/tags?${params}`, 30)).items;
}
