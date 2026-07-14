import { currentUser, nodes, posts } from "@/lib/mock-data";

export type QueryParams = Record<string, string | string[] | undefined>;

export type CatchAllPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<QueryParams>;
};

const privatePrefixes = [
  "/settings", "/moderation", "/admin", "/journey", "/play", "/quests", "/me",
  "/drafts", "/bookmarks", "/following", "/notifications", "/reports", "/appeals",
  "/report", "/quick-compose", "/compose", "/login", "/register", "/verify-email",
  "/forgot-password", "/reset-password", "/auth", "/blocked", "/403", "/prototype",
];

const exactRoutes = new Set([
  "/feed", "/nodes", "/search", "/tags", "/me", "/quick-compose", "/compose", "/drafts", "/bookmarks", "/following", "/notifications",
  "/coins", "/coins/ledger", "/coins/rules", "/coins/bounties", "/coins/economy",
  "/journey", "/journey/onboarding", "/journey/states", "/quests", "/me/progress", "/me/contributions", "/me/collection", "/seasons",
  "/play", "/play/quests", "/play/journey", "/play/teams",
  "/settings/profile", "/settings/privacy", "/settings/notifications", "/settings/security", "/settings/security/password", "/settings/sessions", "/settings/blocked", "/settings/coins", "/settings/journey", "/blocked",
  "/reports", "/me/reports", "/report/new", "/appeals", "/appeals/new",
  "/moderation", "/moderation/cases", "/moderation/appeals", "/moderation/coins", "/moderation/audit", "/moderation/audit-logs",
  "/admin/coins/control", "/admin/coins/reconciliation", "/403", "/prototype/states",
  "/login", "/register", "/verify-email", "/verify-email/result", "/forgot-password", "/reset-password", "/auth/login", "/auth/register", "/auth/verify", "/auth/forgot", "/auth/reset", "/auth/recover-task",
]);

export const knownTags = new Set(posts.flatMap((post) => post.tags));
const knownUsers = new Set(posts.map((post) => post.author.userName).concat(currentUser.userName));
const knownSeasons = new Set(["summer-first-reply", "spring-discovery"]);
const knownQuests = new Set(["first-reply", "source-trail", "thread-garden"]);

export function pathFrom(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/feed";
}

export function shouldNoIndex(path: string) {
  if (path === "/coins/rules" || path === "/coins/economy" || path === "/seasons" || path.startsWith("/seasons/")) return false;
  if (path === "/coins" || path.startsWith("/coins/")) return true;
  return privatePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isKnownRoute(path: string) {
  if (exactRoutes.has(path)) return true;
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "posts" && parts.length === 2) return posts.some((post) => post.id === parts[1]);
  if (parts[0] === "nodes" && parts.length >= 2 && parts.length <= 3) {
    const parent = nodes.find((node) => node.slug === parts[1]);
    return Boolean(parent && (parts.length === 2 || parts[2] === "project" || parent.children.some((child) => child.slug === parts[2])));
  }
  if ((parts[0] === "users" || parts[0] === "user") && (parts.length === 2 || parts.length === 3)) {
    return knownUsers.has(parts[1]) && (parts.length === 2 || ["posts", "comments", "followers", "following"].includes(parts[2]));
  }
  if (parts[0] === "tags" && parts.length === 2) return knownTags.has(decodeURIComponent(parts[1]));
  if (parts[0] === "seasons" && parts.length === 2) return knownSeasons.has(parts[1]);
  if (parts[0] === "quests" && parts.length === 2) return knownQuests.has(parts[1]);
  if (parts[0] === "play" && parts[1] === "quests" && parts.length === 3) return knownQuests.has(parts[2]);
  return [
    /^\/coins\/bounties\/[^/]+$/, /^\/me\/reports\/[^/]+$/, /^\/appeals\/[^/]+$/,
    /^\/moderation\/cases\/[^/]+$/, /^\/moderation\/coins\/cases\/[^/]+$/,
    /^\/admin\/coins\/adjustments\/[^/]+$/,
  ].some((pattern) => pattern.test(path));
}

export function titleFor(path: string) {
  if (path === "/feed") return "最新帖子";
  if (path === "/nodes") return "节点目录";
  if (path.startsWith("/nodes/")) {
    const [, , parentSlug, childSlug] = path.split("/");
    const parent = nodes.find((node) => node.slug === parentSlug);
    if (parent && childSlug === "project") return `${parent.name} · 公开共建`;
    const child = parent?.children.find((item) => item.slug === childSlug);
    return child ? `${parent?.name} / ${child.name}` : parent?.name ?? "社区节点";
  }
  if (path.startsWith("/posts/")) return posts.find((post) => path.endsWith(post.id))?.title ?? "帖子";
  if (path.startsWith("/users/") || path.startsWith("/user/")) return `${currentUser.displayName} (@${currentUser.userName})`;
  if (path === "/search") return "搜索";
  if (path.startsWith("/tags")) return "社区标签";
  if (path === "/coins/rules") return "金币经济规则";
  if (path === "/coins/economy") return "金币经济透明度";
  if (path === "/seasons") return "社区共建季";
  if (path.startsWith("/seasons/")) return "社区共建季详情";
  if (path === "/login" || path === "/auth/login") return "登录";
  if (path === "/register" || path === "/auth/register") return "注册";
  if (path.startsWith("/verify-email") || path === "/auth/verify") return "验证邮箱";
  if (path === "/forgot-password" || path === "/auth/forgot") return "找回密码";
  if (path === "/reset-password" || path === "/auth/reset") return "重置密码";
  return "X2Post";
}
