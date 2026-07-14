import { NextRequest, NextResponse } from "next/server";
import { currentUser, cursorPage, nodes, posts } from "@/lib/mock-data";
import { getMockApiState, stableStringify, type StoredMockComment } from "@/lib/mock-api-state";

type Context = { params: Promise<{ segments: string[] }> };

const REQUEST_ID = "00000000-0000-4000-8000-000000000001";
const RULE_VERSION = "2026.07";
const now = () => new Date().toISOString();
const etag = (version = 1) => `\"${version}\"`;

function json(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": REQUEST_ID,
      ...init.headers,
    },
  });
}

function problem(
  request: NextRequest,
  status: number,
  code: string,
  detail: string,
  extra: Record<string, unknown> = {},
) {
  const titles: Record<number, string> = {
    400: "Bad Request",
    401: "Authentication Required",
    403: "Forbidden",
    404: "Resource Not Found",
    409: "Conflict",
    412: "Precondition Failed",
    422: "Validation Failed",
    429: "Rate Limited",
  };
  return json(
    {
      type: `https://x2post.com/problems/${code.toLowerCase().replaceAll("_", "-")}`,
      title: titles[status] ?? "Request Failed",
      status,
      code,
      detail,
      instance: request.nextUrl.pathname,
      requestId: REQUEST_ID,
      fieldErrors: [],
      ...extra,
    },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

function publicUser(user: { userName: string; displayName: string }) {
  return {
    id: `user-${user.userName}`,
    userName: user.userName,
    displayName: user.displayName,
    avatarUrl: `https://x2post.com/assets/avatars/user-${user.userName}.svg`,
  };
}

function nodeSummary(
  node: (typeof nodes)[number] | (typeof nodes)[number]["children"][number],
  parentSlug: string | null = null,
) {
  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    level: parentSlug ? "CHILD" : "PARENT",
    parentSlug,
    description: node.description,
    ruleVersion: RULE_VERSION,
    canPost: true,
    postCount: node.postCount,
    followerCount: node.followerCount,
  };
}

function nodeDetail(parent: (typeof nodes)[number]) {
  return {
    node: nodeSummary(parent),
    ruleText: parent.rule,
    children: parent.children.map((child) => nodeSummary(child, parent.slug)),
    inheritance: { parentFollowCoversChildren: true, childFollowCoversParent: false },
    viewerState: { directlyFollowing: false, coveredByParent: false },
  };
}

function childNodeDetail(parent: (typeof nodes)[number], child: (typeof nodes)[number]["children"][number]) {
  return {
    node: nodeSummary(child, parent.slug),
    ruleText: child.rule,
    children: [],
    inheritance: { parentFollowCoversChildren: true, childFollowCoversParent: false },
    viewerState: { directlyFollowing: false, coveredByParent: false },
  };
}

function nodePathFor(post: (typeof posts)[number]) {
  const parent = nodes.find((node) => node.slug === post.nodePath.parentSlug);
  const child = parent?.children.find((item) => item.slug === post.nodePath.childSlug);
  if (!parent) throw new Error(`Mock post ${post.id} has an invalid parent node`);
  return {
    parent: nodeSummary(parent),
    child: child ? nodeSummary(child, parent.slug) : null,
    displayName: child ? `${parent.name} / ${child.name}` : parent.name,
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function markdownHtml(value: string) {
  return `<p>${escapeHtml(value).replaceAll("\n", "<br />")}</p>`;
}

function postSummary(post: (typeof posts)[number]) {
  const state = getMockApiState();
  const reactions = state.postReactions.get(post.id) ?? new Set<string>();
  const comments = state.commentsByPost.get(post.id) ?? [];
  const bookmarked = state.bookmarks.has(post.id);
  return {
    id: post.id,
    title: post.title,
    displayTitle: post.title || post.excerpt,
    excerpt: post.excerpt,
    contentKind: post.title ? "LONG" : "QUICK",
    author: publicUser(post.author),
    nodePath: nodePathFor(post),
    tags: post.tags.map((label) => ({
      slug: encodeURIComponent(label),
      label,
      publicPostCount: posts.filter((item) => item.tags.includes(label)).length,
    })),
    createdAt: post.createdAt,
    counts: {
      comments: comments.length || post.commentCount,
      reactions: post.reactionCount + (reactions.has("AGREE") ? 1 : 0),
      bookmarks: bookmarked ? 1 : 0,
    },
    status: "PUBLISHED",
    viewerState: { bookmarked, reactions: [...reactions] },
    permissions: { canComment: true, canReport: true },
  };
}

function postDetail(post: (typeof posts)[number]) {
  return {
    post: postSummary(post),
    bodyMarkdown: post.bodyMarkdown,
    bodyHtml: markdownHtml(post.bodyMarkdown),
    commentLock: { locked: false, reasonCategory: null },
    attachments: [],
    activeBounty: null,
    canonicalUrl: `https://x2post.com/posts/${post.id}`,
  };
}

function commentDto(comment: StoredMockComment) {
  const reactions = getMockApiState().commentReactions.get(comment.id) ?? new Set<string>();
  return {
    id: comment.id,
    postId: comment.postId,
    rootCommentId: comment.rootCommentId,
    parentCommentId: comment.parentCommentId,
    anchorKey: comment.anchorKey,
    bodyMarkdown: comment.bodyMarkdown,
    bodyHtml: markdownHtml(comment.bodyMarkdown),
    author: publicUser(comment.author),
    createdAt: comment.createdAt,
    replyCount: comment.replyCount,
    reactionCount: comment.reactionCount + (reactions.has("AGREE") ? 1 : 0),
    status: "PUBLISHED",
    viewerState: { reactions: [...reactions] },
    permissions: { canReply: true, canReport: true },
  };
}

function allNodeSummaries() {
  return nodes.flatMap((parent) => [nodeSummary(parent), ...parent.children.map((child) => nodeSummary(child, parent.slug))]);
}

export async function GET(request: NextRequest, context: Context) {
  const { segments } = await context.params;
  const path = `/${segments.join("/")}`;
  const query = request.nextUrl.searchParams;
  const state = getMockApiState();

  if (path === "/nodes") return json({ items: nodes.map(nodeDetail), taxonomyVersion: "2026-07-14" });
  if (segments[0] === "nodes" && segments.length === 2) {
    const node = nodes.find((item) => item.slug === segments[1]);
    return node ? json(nodeDetail(node)) : problem(request, 404, "NODE_NOT_FOUND", "节点不存在");
  }
  if (segments[0] === "nodes" && segments[2] === "children" && segments.length === 4) {
    const node = nodes.find((item) => item.slug === segments[1]);
    const child = node?.children.find((item) => item.slug === segments[3]);
    return node && child
      ? json(childNodeDetail(node, child))
      : problem(request, 404, "NODE_PATH_NOT_FOUND", "节点路径不存在");
  }
  if (path === "/feed") {
    const requestedParent = query.get("parentNode");
    const requestedChild = query.get("childNode");
    const parent = nodes.find((node) => node.slug === requestedParent);
    const child = parent?.children.find((item) => item.slug === requestedChild);
    const recovery = requestedParent && !parent ? "INVALID_PARENT" : requestedChild && !child ? "INVALID_CHILD" : "NONE";
    const visible = posts.filter((post) => child
      ? post.nodePath.parentSlug === parent?.slug && post.nodePath.childSlug === child.slug
      : parent ? post.nodePath.parentSlug === parent.slug : true);
    const appliedNodePath = parent
      ? {
          parent: nodeSummary(parent),
          child: child ? nodeSummary(child, parent.slug) : null,
          displayName: child ? `${parent.name} / ${child.name}` : parent.name,
        }
      : null;
    return json({ page: cursorPage(visible.map(postSummary)), appliedNodePath, recovery, taxonomyVersion: "2026-07-14" });
  }
  if (path === "/feed/following") return json(cursorPage(posts.slice(1).map(postSummary)));
  if (segments[0] === "posts" && segments.length === 2) {
    const post = posts.find((item) => item.id === segments[1]);
    return post ? json(postDetail(post)) : problem(request, 404, "RESOURCE_NOT_FOUND", "内容不存在或当前不可见");
  }
  if (segments[0] === "posts" && segments[2] === "comments" && segments.length === 3) {
    const post = posts.find((item) => item.id === segments[1]);
    if (!post) return problem(request, 404, "RESOURCE_NOT_FOUND", "内容不存在或当前不可见");
    return json(cursorPage((state.commentsByPost.get(post.id) ?? []).map(commentDto)));
  }
  if (path === "/search/posts") {
    const term = query.get("q")?.toLocaleLowerCase() ?? "";
    const items = posts.filter((post) => `${post.title}${post.excerpt}${post.tags.join("")}`.toLocaleLowerCase().includes(term));
    return json(cursorPage(items.map(postSummary)));
  }
  if (path === "/search/users") return json(cursorPage([publicUser(currentUser)]));
  if (path === "/search/nodes") return json({ items: allNodeSummaries() });
  if (path === "/search/tags") return json({ items: [...new Set(posts.flatMap((post) => post.tags))].map((label) => ({ slug: encodeURIComponent(label), label, publicPostCount: posts.filter((post) => post.tags.includes(label)).length })) });
  if (path === "/tags") return json(cursorPage([...new Set(posts.flatMap((post) => post.tags))].map((label) => ({ slug: encodeURIComponent(label), label, publicPostCount: posts.filter((post) => post.tags.includes(label)).length }))));
  if (segments[0] === "tags" && segments[2] === "posts") {
    const label = decodeURIComponent(segments[1]);
    return json({ tag: { slug: segments[1], label, publicPostCount: posts.filter((post) => post.tags.includes(label)).length }, page: cursorPage(posts.filter((post) => post.tags.includes(label)).map(postSummary)) });
  }
  if (segments[0] === "users" && segments.length === 2) {
    return segments[1] === currentUser.userName
      ? json({ user: publicUser(currentUser), bio: currentUser.bio, location: currentUser.location, joinedAt: "2024-08-01T00:00:00Z", stats: currentUser.stats, viewerState: { following: false, blocked: false }, permissions: { canFollow: false, canBlock: false, canReport: false } })
      : problem(request, 404, "RESOURCE_NOT_FOUND", "用户不存在或资料不可见");
  }
  if (path === "/users/me/summary") return json({ user: publicUser(currentUser), emailMasked: "li•••@example.com", emailVerified: true, counts: { unreadNotifications: 1, drafts: 3, bookmarks: state.bookmarks.size, following: currentUser.stats.followingCount }, security: { activeSessions: 2, passwordChangedAt: null } });
  if (path === "/users/me/bookmarks") return json(cursorPage(posts.filter((post) => state.bookmarks.has(post.id)).map(postSummary)));
  if (path === "/users/me/coin-wallet") return json({ userId: currentUser.id, unit: "X2_COIN", balances: { available: 286, pending: 10, escrow: 50, held: 5 }, weeklyReward: { earned: 42, cap: 60, resetsAt: "2026-07-20T00:00:00Z" }, ruleVersion: RULE_VERSION, updatedAt: now() });
  if (path === "/coin-rule-versions") return json(cursorPage([{ version: RULE_VERSION, qualityRewards: [{ distinctTrustedThreshold: 3, amount: 4 }, { distinctTrustedThreshold: 8, amount: 6 }, { distinctTrustedThreshold: 20, amount: 10 }], pendingObservationSeconds: 259200, weeklyUserRewardCap: 60, thank: { cost: 2, recipientAmount: 1, sinkAmount: 1, dailyCountCap: 5 }, bounty: { amountTiers: [20, 50, 100], acceptDelaySeconds: 86400, answererSharePercent: 80, sinkPercent: 20, defaultDurationDays: 14, maxDurationDays: 30 }, effectiveAt: "2026-07-01T00:00:00Z", nonMonetaryNotice: "金币不可购买、提现、兑换法币，也不赋予曝光或治理权。" }]));
  if (segments[0] === "coin-economy" && segments[1] === "summaries" && segments[2]) return json({ period: segments[2], openingSupply: 120400, issued: 8420, sunk: 2310, closingSupply: 126510, activeWallets: 1842, dormancyRate: 0.18, reversals: 17, ruleVersion: RULE_VERSION, publishedAt: now() });
  if (path === "/notifications") return json(cursorPage([{ id: "notification-1", type: "REPLY", title: "青屿回应了你的帖子", summary: "为什么社区内容需要明确的不可变边界？", createdAt: "2026-07-14T15:35:00Z", readAt: null, deepLink: { route: "/posts/immutable-content", anchorKey: "comment-comment-1" }, actor: publicUser({ userName: "qingyu", displayName: "青屿" }), subject: { type: "COMMENT", id: "comment-1" } }]));
  if (path === "/auth/sessions") return json({ items: [{ id: "session-current", deviceName: "MacBook Pro", browser: "Chrome · macOS", approximateLocation: "上海", createdAt: "2026-07-10T10:00:00Z", lastActiveAt: now(), current: true, riskState: "NORMAL" }, { id: "session-mobile", deviceName: "iPhone", browser: "Safari · iOS", approximateLocation: "上海", createdAt: "2026-07-01T10:00:00Z", lastActiveAt: "2026-07-13T10:00:00Z", current: false, riskState: "NORMAL" }] });

  return problem(request, 404, "RESOURCE_NOT_FOUND", `尚未提供 GET ${path} 的 mock 数据`);
}

async function mutation(request: NextRequest, context: Context, method: string) {
  const { segments } = await context.params;
  const path = `/${segments.join("/")}`;
  const rawBody: unknown = request.headers.get("content-length") === "0" ? {} : await request.json().catch(() => ({}));
  const body = rawBody && typeof rawBody === "object" ? rawBody as Record<string, unknown> : {};
  const state = getMockApiState();
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requiresIdempotency = method === "POST" && ["/posts", "/reports", "/appeals", "/auth/sessions", "/auth/registrations", "/auth/email-verifications", "/auth/password-reset-deliveries", "/auth/password-resets"].some((route) => path === route || path.endsWith("/comments") || path.endsWith("/publications"));

  if (requiresIdempotency && (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128)) {
    return problem(request, 422, "VALIDATION_FAILED", "Idempotency-Key 必须为 16–128 个 ASCII 字符", {
      fieldErrors: [{ field: "Idempotency-Key", code: "INVALID_LENGTH", message: "长度必须为 16–128" }],
    });
  }

  const idempotencyScope = idempotencyKey ? `${method}:${path}:${idempotencyKey}` : null;
  const fingerprint = stableStringify(body);
  if (idempotencyScope) {
    const previous = state.idempotency.get(idempotencyScope);
    if (previous) {
      if (previous.fingerprint !== fingerprint) return problem(request, 409, "IDEMPOTENCY_KEY_REUSED", "同一 Idempotency-Key 不能用于不同请求内容");
      return json(previous.body, { status: previous.status, headers: { ...previous.headers, "Idempotency-Replayed": "true" } });
    }
  }

  const success = (responseBody: unknown, status = 200, headers?: Record<string, string>) => {
    if (idempotencyScope) state.idempotency.set(idempotencyScope, { fingerprint, status, body: responseBody, headers });
    return json(responseBody, { status, headers });
  };

  if (path === "/posts" && method === "POST") {
    const createdId = `mock-post-${Date.now()}`;
    const source = { ...posts[0], id: createdId, title: "", excerpt: String(body.bodyMarkdown ?? "").slice(0, 280), bodyMarkdown: String(body.bodyMarkdown ?? ""), nodePath: { ...posts[0].nodePath }, tags: [] };
    const responseBody = { ...postDetail(source), canonicalUrl: `https://x2post.com/posts/${createdId}` };
    return success(responseBody, 201, { Location: `/posts/${createdId}` });
  }
  if (path.endsWith("/comments") && method === "POST") {
    const postId = segments[1];
    if (!posts.some((post) => post.id === postId)) return problem(request, 404, "RESOURCE_NOT_FOUND", "内容不存在或当前不可见");
    const id = `comment-${state.nextCommentNumber++}`;
    const created: StoredMockComment = {
      id,
      postId,
      rootCommentId: id,
      parentCommentId: null,
      anchorKey: `comment-${id}`,
      bodyMarkdown: String(body.bodyMarkdown ?? ""),
      author: currentUser,
      createdAt: now(),
      replyCount: 0,
      reactionCount: 0,
    };
    state.commentsByPost.set(postId, [...(state.commentsByPost.get(postId) ?? []), created]);
    return success(commentDto(created), 201, { Location: `/posts/${postId}#${created.anchorKey}`, "X-Comment-Anchor": created.anchorKey });
  }

  const bookmarkMatch = path.match(/^\/users\/me\/bookmarks\/([^/]+)$/);
  if (bookmarkMatch && (method === "PUT" || method === "DELETE")) {
    const postId = bookmarkMatch[1];
    if (!posts.some((post) => post.id === postId)) return problem(request, 404, "RESOURCE_NOT_FOUND", "内容不存在或当前不可见");
    if (method === "DELETE") {
      state.bookmarks.delete(postId);
      return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store", "X-Request-Id": REQUEST_ID } });
    }
    state.bookmarks.add(postId);
    return json({ subjectId: postId, active: true, effective: true, count: 1, updatedAt: now() });
  }

  const reactionMatch = path.match(/^\/(posts|comments)\/([^/]+)\/reactions\/([^/]+)$/);
  if (reactionMatch && (method === "PUT" || method === "DELETE")) {
    const [, subjectType, subjectId, reactionType] = reactionMatch;
    if (reactionType !== "AGREE") return problem(request, 422, "REACTION_TYPE_UNSUPPORTED", "不支持的反应类型");
    const exists = subjectType === "posts"
      ? posts.some((post) => post.id === subjectId)
      : [...state.commentsByPost.values()].some((items) => items.some((comment) => comment.id === subjectId));
    if (!exists) return problem(request, 404, "RESOURCE_NOT_FOUND", "内容不存在或当前不可见");
    const store = subjectType === "posts" ? state.postReactions : state.commentReactions;
    const reactions = store.get(subjectId) ?? new Set<string>();
    if (method === "DELETE") {
      reactions.delete(reactionType);
      store.set(subjectId, reactions);
      return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store", "X-Request-Id": REQUEST_ID } });
    }
    reactions.add(reactionType);
    store.set(subjectId, reactions);
    const baseCount = subjectType === "posts" ? posts.find((post) => post.id === subjectId)?.reactionCount ?? 0 : 0;
    return json({ subjectId, active: true, effective: true, count: baseCount + 1, updatedAt: now() });
  }

  if (path === "/notifications/read-cursor" && method === "PUT") return json({ readThrough: body.readThrough ?? now(), markedCount: 1, unreadCount: 0 });
  if (path === "/auth/sessions" && method === "POST") {
    const responseBody = {
      accessToken: "mock-access-token",
      accessExpiresAt: "2026-07-14T16:30:00Z",
      refreshToken: "mock-refresh-token",
      refreshExpiresAt: "2026-08-13T15:30:00Z",
      session: { id: "session-current", deviceName: "MacBook Pro", browser: "Chrome · macOS", approximateLocation: "上海", createdAt: now(), lastActiveAt: now(), current: true, riskState: "NORMAL" },
      user: publicUser(currentUser),
      emailVerified: true,
    };
    return success(responseBody, 201);
  }
  if (path === "/auth/registrations" && method === "POST") {
    const email = String(body.email ?? "user@example.com");
    const [localPart, domain = "example.com"] = email.split("@");
    const maskedEmail = `${localPart.slice(0, 2) || "••"}•••@${domain}`;
    return success({ registrationId: "registration-mock-1", verificationRequired: true, maskedEmail, resendAfterSeconds: 60 }, 202);
  }
  if (path === "/auth/email-verifications" && method === "POST") {
    return success({ verified: true, verifiedAt: now(), accountStatus: "ACTIVE" }, 201);
  }
  if (path === "/auth/password-reset-deliveries" && method === "POST") {
    return success({ accepted: true, maskedEmail: "li•••@example.com", resendAfterSeconds: 60 }, 202);
  }
  if (path === "/auth/password-resets" && method === "POST") {
    return success({ reset: true, passwordChangedAt: now(), revokedSessionCount: 2 }, 201);
  }
  if (path === "/reports" && method === "POST") return success({ id: "report-mock-1", ...body, status: "SUBMITTED", createdAt: now() }, 201);
  if (path === "/appeals" && method === "POST") return success({ id: "appeal-mock-1", ...body, status: "SUBMITTED", createdAt: now() }, 201);
  if (method === "PATCH" && !request.headers.get("If-Match")) return problem(request, 412, "VERSION_MISMATCH", "请提供最新 If-Match 版本", { currentVersion: 1, currentEtag: etag(1) });
  if (method === "PATCH") return json({ ...body, version: 2, updatedAt: now() }, { headers: { ETag: etag(2) } });

  return problem(request, 404, "RESOURCE_NOT_FOUND", `尚未提供 ${method} ${path} 的 mock 交互`);
}

export const POST = (request: NextRequest, context: Context) => mutation(request, context, "POST");
export const PUT = (request: NextRequest, context: Context) => mutation(request, context, "PUT");
export const PATCH = (request: NextRequest, context: Context) => mutation(request, context, "PATCH");
export const DELETE = (request: NextRequest, context: Context) => mutation(request, context, "DELETE");
