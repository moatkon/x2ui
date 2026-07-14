/* eslint-disable @next/next/no-html-link-for-pages -- SSR snapshot is replaced by the prototype-compatible pathname renderer. */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { comments, currentUser, nodes, posts } from "@/lib/mock-data";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const privatePrefixes = [
  "/settings",
  "/moderation",
  "/admin",
  "/journey",
  "/play",
  "/quests",
  "/me",
  "/drafts",
  "/bookmarks",
  "/following",
  "/notifications",
  "/reports",
  "/appeals",
  "/report",
  "/quick-compose",
  "/compose",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/blocked",
  "/403",
  "/prototype",
];

const isPrivateRoute = (path: string) => privatePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const shouldNoIndex = (path: string) => {
  if (path === "/coins/rules" || path === "/coins/economy" || path === "/seasons" || path.startsWith("/seasons/")) return false;
  if (path === "/coins" || path.startsWith("/coins/")) return true;
  return isPrivateRoute(path);
};

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

const knownUsers = new Set(posts.map((post) => post.author.userName).concat(currentUser.userName));
const knownTags = new Set(posts.flatMap((post) => post.tags));
const knownSeasons = new Set(["summer-first-reply", "spring-discovery"]);
const knownQuests = new Set(["first-reply", "source-trail", "thread-garden"]);

function isKnownRoute(path: string) {
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
    /^\/coins\/bounties\/[^/]+$/,
    /^\/me\/reports\/[^/]+$/,
    /^\/appeals\/[^/]+$/,
    /^\/moderation\/cases\/[^/]+$/,
    /^\/moderation\/coins\/cases\/[^/]+$/,
    /^\/admin\/coins\/adjustments\/[^/]+$/,
  ].some((pattern) => pattern.test(path));
}

function pathFrom(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/feed";
}

function titleFor(path: string) {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = pathFrom((await params).slug);
  const title = titleFor(path);
  const post = path.startsWith("/posts/") ? posts.find((item) => path.endsWith(item.id)) : undefined;
  const description = post?.excerpt ?? "一个内容优先、公开可读、秩序透明的轻量社区。";
  const canonical = path === "/feed" ? "/" : path;

  return {
    title,
    description,
    alternates: { canonical },
    robots: shouldNoIndex(path) ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title, description, url: canonical },
  };
}

function Avatar({ name, image }: { name: string; image: string }) {
  return (
    <div className="avatar size-10 shrink-0 overflow-hidden rounded-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/avatars/${image}.svg`} alt={`${name}的头像`} width="96" height="96" />
    </div>
  );
}

function PostRows({ filter }: { filter?: (post: (typeof posts)[number]) => boolean }) {
  const list = filter ? posts.filter(filter) : posts;
  return (
    <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
      {list.map((post) => (
        <li className="list-row rounded-none px-4 py-4 sm:px-5" key={post.id}>
          <Avatar name={post.author.displayName} image={`user-${post.author.userName}`} />
          <div className="list-col-grow min-w-0">
            <a className="text-base font-bold leading-snug hover:underline" href={`/posts/${post.id}`}>
              {post.title}
            </a>
            <p className="mt-1 line-clamp-2 opacity-75">{post.excerpt}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm opacity-70">
              <a className="link link-hover" href={`/users/${post.author.userName}`}>{post.author.displayName}</a>
              <span>·</span>
              <a className="link link-hover" href={`/nodes/${post.nodePath.parentSlug}`}>{post.nodePath.parentName}</a>
              {post.nodePath.childSlug ? <><span>/</span><a className="link link-hover" href={`/nodes/${post.nodePath.parentSlug}/${post.nodePath.childSlug}`}>{post.nodePath.childName}</a></> : null}
              <span>·</span><span>{post.createdLabel}</span>
            </div>
          </div>
          <div className="hidden shrink-0 text-right text-sm sm:block">
            <p>💬 {post.commentCount}</p><p className="mt-2">♡ {post.reactionCount}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FeedContent({ query }: { query: Record<string, string | string[] | undefined> }) {
  const parentSlug = typeof query.node === "string" ? query.node : undefined;
  const childSlug = typeof query.subnode === "string" ? query.subnode : undefined;
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);

  return (
    <>
      <header className="mb-5"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">最新帖子</h1><p className="mt-1 opacity-70">先从节点缩小范围，再进入一段具体讨论。</p></header>
      <a href={parent ? `/quick-compose?node=${parent.slug}${child ? `&subnode=${child.slug}` : ""}` : "/quick-compose"} className="flex min-h-14 items-center rounded-box border-2 border-base-content/20 px-4 font-semibold hover:bg-base-200">写点什么……</a>
      <section className="mt-5 overflow-hidden rounded-box border-2 border-base-content/20">
        <header className="flex items-center justify-between border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">浏览帖子</h2><a className="link text-sm" href="/nodes">全部节点</a></header>
        <nav className="p-3" aria-label="按一级节点浏览"><ul className="menu menu-horizontal flex w-full flex-wrap gap-1 px-0"><li><a className={!parent ? "menu-active" : ""} href="/feed">全部</a></li>{nodes.map((node) => <li key={node.id}><a className={parent?.id === node.id ? "menu-active" : ""} href={`/feed?node=${node.slug}`}>{node.name}</a></li>)}</ul></nav>
        {parent ? <nav className="border-t-2 border-base-content/20 p-3" aria-label={`${parent.name}下的主题`}><ul className="menu menu-horizontal flex flex-wrap gap-1 px-0"><li><a className={!child ? "menu-active" : ""} href={`/feed?node=${parent.slug}`}>全部{parent.name}</a></li>{parent.children.map((item) => <li key={item.id}><a className={child?.id === item.id ? "menu-active" : ""} href={`/feed?node=${parent.slug}&subnode=${item.slug}`}>{item.name}</a></li>)}</ul></nav> : null}
      </section>
      <div className="mt-5"><PostRows filter={(post) => child ? post.nodePath.childSlug === child.slug && post.nodePath.parentSlug === parent?.slug : parent ? post.nodePath.parentSlug === parent.slug : true} /></div>
    </>
  );
}

function NodesContent({ path }: { path: string }) {
  const [, , parentSlug, childSlug] = path.split("/");
  const parent = nodes.find((node) => node.slug === parentSlug);
  const selectedChild = parent?.children.find((item) => item.slug === childSlug);
  if (parent) {
    return <><div className="breadcrumbs text-sm"><ul><li><a href="/nodes">节点</a></li>{selectedChild ? <li><a href={`/nodes/${parent.slug}`}>{parent.name}</a></li> : null}<li>{selectedChild?.name ?? parent.name}</li></ul></div><header className="my-4"><h1 className="text-3xl font-black">{selectedChild ? `${parent.name} / ${selectedChild.name}` : parent.name}</h1><p className="mt-1 opacity-70">{selectedChild?.description ?? parent.description}</p></header><div className="alert alert-info alert-soft"><p>{selectedChild ? selectedChild.rule : parent.rule}</p></div><section className="mt-5 rounded-box border-2 border-base-content/20 p-5"><h2 className="text-lg font-bold">{selectedChild ? "同级主题" : `${parent.children.length} 个子节点`}</h2><ul className="menu menu-horizontal mt-3 flex flex-wrap px-0">{parent.children.map((item) => <li key={item.id}><a className={selectedChild?.id === item.id ? "menu-active" : ""} href={`/nodes/${parent.slug}/${item.slug}`}>{item.name}</a></li>)}</ul></section><div className="mt-5"><PostRows filter={(post) => selectedChild ? post.nodePath.parentSlug === parent.slug && post.nodePath.childSlug === selectedChild.slug : post.nodePath.parentSlug === parent.slug} /></div></>;
  }
  return <><header className="mb-5"><h1 className="text-3xl font-black">节点目录</h1><p className="mt-1 opacity-70">一级节点划定社区边界，子节点细分稳定讨论主题。</p></header><div className="alert alert-info alert-soft mb-5"><p>子节点只属于一个一级节点；跨节点的具体概念继续使用标签。当前严格支持两层。</p></div><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{nodes.map((node) => <li className="list-row rounded-none px-4 py-5" key={node.id}><Avatar name={node.name} image={`node-${node.slug}`} /><div className="list-col-grow"><a className="font-bold hover:underline" href={`/nodes/${node.slug}`}>{node.name}</a><p className="mt-1 opacity-70">{node.description}</p><p className="mt-2 text-sm opacity-60">{node.postCount} 个主题 · {node.followerCount} 人关注 · {node.children.length} 个子节点</p></div></li>)}</ul></>;
}

function PostContent({ path }: { path: string }) {
  const post = posts.find((item) => path.endsWith(item.id));
  if (!post) notFound();
  return <><div className="breadcrumbs text-sm"><ul><li><a href="/feed">首页</a></li><li><a href={`/nodes/${post.nodePath.parentSlug}`}>{post.nodePath.parentName}</a></li><li>帖子</li></ul></div><article className="mt-3 overflow-hidden rounded-box border-2 border-base-content/20"><header className="border-b-2 border-base-content/20 px-4 py-5 sm:px-6"><h1 className="text-2xl font-black leading-tight sm:text-3xl">{post.title}</h1><p className="mt-3 text-sm opacity-70">{post.author.displayName} · {post.nodePath.parentName} / {post.nodePath.childName} · {post.createdLabel}</p></header><div className="markdown-body px-4 py-5 sm:px-6"><p>社区里的表达一旦进入公共讨论，就会成为其他回应的上下文。允许作者随时改写，会让后续回复失去依据，也可能伤害讨论记录的可信度。</p><h2>不可变，不等于不治理</h2><p>原始内容保持不变，同时通过可见性状态处理风险：违规内容可以被隐藏，帖子可以被锁定，用户可以申诉，治理动作则进入不可变审计记录。</p><ul><li>发布前提供草稿、预览和明确确认；</li><li>发布后不提供编辑、删除或撤回入口；</li><li>举报和处置都保留上下文与进度。</li></ul></div><footer className="flex flex-wrap gap-2 border-t-2 border-base-content/20 px-4 py-4"><button className="btn">认同 {post.reactionCount}</button><button className="btn">收藏</button><button className="btn">金币感谢</button><button className="btn btn-ghost">举报</button></footer></article><section className="mt-5"><header className="mb-4"><h2 className="text-2xl font-black">评论</h2><p className="opacity-70">共 {post.commentCount} 条，按时间排序。</p></header><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{comments.map((comment) => <li className="list-row rounded-none px-4 py-4" key={comment.id}><Avatar name={comment.author.displayName} image={`user-${comment.author.userName}`} /><div className="list-col-grow"><a className="font-bold" href={`/users/${comment.author.userName}`}>{comment.author.displayName}</a><p className="mt-2 leading-relaxed">{comment.bodyMarkdown}</p><p className="mt-2 text-sm opacity-60">回应 {comment.replyCount}</p></div></li>)}</ul></section></>;
}

function UserContent({ path }: { path: string }) {
  const [, , userName, section = "profile"] = path.split("/");
  const userPosts = posts.filter((post) => post.author.userName === userName);
  const displayName = userPosts[0]?.author.displayName ?? currentUser.displayName;
  return <><header className="flex items-center gap-4"><Avatar name={displayName} image={`user-${userName}`} /><div><h1 className="text-3xl font-black">{displayName}</h1><p className="opacity-60">@{userName} · 上海</p></div></header><nav className="tabs tabs-border mt-5 overflow-x-auto" aria-label="用户公开分区">{[["profile","公开资料"],["posts","帖子"],["comments","评论"],["following","关注"],["followers","粉丝"]].map(([key,label]) => <a className={`tab ${section === key ? "tab-active" : ""}`} href={`/users/${userName}${key === "profile" ? "" : `/${key}`}`} key={key}>{label}</a>)}</nav>{section === "profile" ? <><p className="mt-5 leading-relaxed">{userName === currentUser.userName ? currentUser.bio : "认真参与社区讨论，持续分享可复用的经验。"}</p><dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-4">{Object.entries(currentUser.stats).map(([key, value]) => <div className="p-4" key={key}><dt className="text-sm opacity-60">{key}</dt><dd className="text-2xl font-black">{value}</dd></div>)}</dl></> : null}{section === "posts" ? <div className="mt-5"><PostRows filter={(post) => post.author.userName === userName} /></div> : null}{section === "comments" ? <ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{comments.map((comment) => <li className="list-row rounded-none" key={comment.id}><div><a className="font-bold" href="/posts/immutable-content">为什么社区内容需要明确的不可变边界？</a><p className="mt-2">{comment.bodyMarkdown}</p></div></li>)}</ul> : null}{section === "following" || section === "followers" ? <ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{posts.slice(0,3).map((post) => <li className="list-row rounded-none" key={post.author.userName}><Avatar name={post.author.displayName} image={`user-${post.author.userName}`} /><a className="font-bold" href={`/users/${post.author.userName}`}>{post.author.displayName}</a></li>)}</ul> : null}</>;
}

function NodeProjectContent({ path }: { path: string }) {
  const node = nodes.find((item) => item.slug === path.split("/")[2]);
  if (!node) notFound();
  return <><div className="breadcrumbs text-sm"><ul><li><a href="/nodes">节点</a></li><li><a href={`/nodes/${node.slug}`}>{node.name}</a></li><li>公开共建</li></ul></div><header className="my-4"><h1 className="text-3xl font-black">{node.name} · 公开共建</h1><p className="mt-1 opacity-70">任务、验收规则、贡献者和最终成果都可追溯。</p></header><div className="alert alert-info alert-soft"><p>加入只订阅协作进度，不创建私聊、身份等级或永久义务；可随时退出。</p></div><dl className="mt-5 grid overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-3">{[["公共目标","24 条","可信资料索引"],["已验收","16 条","由两类角色确认"],["开放任务","5","最多同时领取 1 个"]].map(([title,value,desc]) => <div className="p-5" key={title}><dt className="opacity-60">{title}</dt><dd className="mt-1 text-2xl font-black">{value}</dd><dd className="text-sm opacity-60">{desc}</dd></div>)}</dl><section className="mt-5 rounded-box border-2 border-base-content/20 p-5"><h2 className="text-xl font-bold">公开任务</h2><p className="mt-3 leading-relaxed">补全无障碍资料路径，并为仍未得到回应的新主题提供一条有上下文、有下一步的首响。</p></section></>;
}

function CoinRulesContent() {
  return <><header className="mb-5"><h1 className="text-3xl font-black">金币经济规则</h1><p className="mt-1 opacity-70">金币只用于感谢与悬赏，不可购买、提现、转账，也不赋予曝光或治理权。</p></header><div className="alert alert-info alert-soft"><p>当前规则版本 2026.07 · 2026 年 7 月 1 日生效</p></div><section className="mt-5 overflow-hidden rounded-box border-2 border-base-content/20"><header className="border-b-2 border-base-content/20 px-5 py-3"><h2 className="text-lg font-bold">固定规则</h2></header><div className="grid gap-4 p-5 sm:grid-cols-2"><div><h3 className="font-bold">金币感谢</h3><p className="mt-2 opacity-70">固定成本 2：作者获得 1，另 1 永久销毁。同一内容仅可感谢一次。</p></div><div><h3 className="font-bold">问题悬赏</h3><p className="mt-2 opacity-70">固定档位 20 / 50 / 100；采纳后答主获得 80%，20% 销毁。</p></div><div><h3 className="font-bold">系统奖励</h3><p className="mt-2 opacity-70">质量事件经过独立核验后结算，发布数量和在线时长不直接产生金币。</p></div><div><h3 className="font-bold">风险边界</h3><p className="mt-2 opacity-70">异常互评可进入保留与复核，历史分录不被覆盖，只能通过冲正纠正。</p></div></div></section></>;
}

function CoinEconomyContent() {
  return <><header className="mb-5"><h1 className="text-3xl font-black">金币经济透明度</h1><p className="mt-1 opacity-70">公开查看金币发行、销毁和流通概况，不披露任何个人余额。</p></header><dl className="grid overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-2 lg:grid-cols-4">{[["期初供应","120,400"],["本期发行","8,420"],["永久销毁","2,310"],["期末供应","126,510"]].map(([title,value]) => <div className="p-5" key={title}><dt className="text-sm opacity-60">{title}</dt><dd className="mt-1 text-2xl font-black">{value}</dd></div>)}</dl><section className="mt-5 rounded-box border-2 border-base-content/20 p-5"><h2 className="text-xl font-bold">2026 年 7 月说明</h2><p className="mt-3 leading-relaxed">本期共有 1,842 个活跃钱包，休眠率 18%，发生 17 笔合规冲正。所有统计均来自不可变双重记账子账本。</p></section></>;
}

function SeasonsContent({ path }: { path: string }) {
  const slug = path.split("/")[2];
  if (!slug) return <><header className="mb-5"><h1 className="text-3xl font-black">社区共建季</h1><p className="mt-1 opacity-70">围绕一个公开、可验收的社区问题协作，不比较个人排名。</p></header><div className="alert alert-info alert-soft mb-5"><p>季节结束只停止新增任务，不会清空个人进度、CXP、金币或已获得收藏。</p></div><ul className="list x2-list rounded-box border-2 border-base-content/20">{[["summer-first-reply","2026 夏 · 让新人得到第一条好回应","跨节点公共共建 · 进行中"],["spring-discovery","2026 春 · 公开资料可发现性","前端开发 × 产品设计 · 已归档"]].map(([id,title,desc]) => <li className="list-row rounded-none" key={id}><div className="list-col-grow"><a className="font-bold" href={`/seasons/${id}`}>{title}</a><p className="mt-1 opacity-65">{desc}</p></div></li>)}</ul></>;
  const past = slug === "spring-discovery";
  return <><div className="breadcrumbs text-sm"><ul><li><a href="/seasons">社区共建季</a></li><li>{past ? "2026 春" : "2026 夏"}</li></ul></div><header className="my-4"><h1 className="text-3xl font-black">{past ? "公开资料可发现性" : "让新人得到第一条好回应"}</h1><p className="mt-1 opacity-70">{past ? "已完成 · 成果公开归档" : "进行中 · 跨节点公共共建"}</p></header><section className="rounded-box border-2 border-base-content/20 p-5"><h2 className="text-xl font-bold">公共目标</h2><p className="mt-3 leading-relaxed">{past ? "将高频问题、标准链接与讨论结论整理为公开索引，并让节点入口可以反向抵达这些成果。" : "让发布 24 小时仍无有效回应的新主题，在不制造灌水的前提下获得一条有上下文、有下一步的首响。"}</p><progress className="progress mt-5 w-full" value={past ? 100 : 68} max="100" /></section></>;
}

function TagsContent({ path }: { path: string }) {
  const slug = path.split("/")[2] ? decodeURIComponent(path.split("/")[2]) : "";
  if (!slug) return <><h1 className="text-3xl font-black">标签</h1><p className="mt-1 opacity-70">从具体话题进入跨节点讨论。</p><ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{[...knownTags].map((tag) => <li className="list-row rounded-none" key={tag}><a className="font-bold" href={`/tags/${encodeURIComponent(tag)}`}># {tag}</a></li>)}</ul></>;
  return <><h1 className="text-3xl font-black"># {slug}</h1><p className="mt-1 opacity-70">包含此标签的公开帖子。</p><div className="mt-5"><PostRows filter={(post) => post.tags.includes(slug)} /></div></>;
}

function RouteContent({ path, query }: { path: string; query: Record<string, string | string[] | undefined> }) {
  if (path === "/feed") return <FeedContent query={query} />;
  if (/^\/nodes\/[^/]+\/project$/.test(path)) return <NodeProjectContent path={path} />;
  if (path === "/nodes" || path.startsWith("/nodes/")) return <NodesContent path={path} />;
  if (path.startsWith("/posts/")) return <PostContent path={path} />;
  if (path.startsWith("/users/") || path.startsWith("/user/")) return <UserContent path={path} />;
  if (path === "/search") {
    const q = typeof query.q === "string" ? query.q : "";
    const type = typeof query.type === "string" ? query.type : "0";
    const filtered = q ? posts.filter((post) => `${post.title}${post.excerpt}${post.tags.join("")}`.includes(q)) : posts;
    return <><h1 className="text-3xl font-black">搜索</h1><p className="mt-1 opacity-70">在公开帖子、用户、节点和标签中查找。</p><form className="join mt-5 w-full"><input className="input join-item w-full" name="q" defaultValue={q} aria-label="搜索关键词" /><button className="btn btn-primary join-item">搜索</button></form><nav className="tabs tabs-border mt-5"><a className={`tab ${type === "0" ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(q)}&type=0`}>帖子</a><a className={`tab ${type === "1" ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(q)}&type=1`}>用户</a><a className={`tab ${type === "2" ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(q)}&type=2`}>节点</a><a className={`tab ${type === "3" ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(q)}&type=3`}>标签</a></nav><div className="mt-5">{type === "0" ? <PostRows filter={(post) => filtered.includes(post)} /> : type === "1" ? <UserContent path="/users/linmo" /> : type === "2" ? <NodesContent path="/nodes" /> : <TagsContent path="/tags" />}</div></>;
  }
  if (path.startsWith("/tags")) return <TagsContent path={path} />;
  if (path === "/coins/rules") return <CoinRulesContent />;
  if (path === "/coins/economy") return <CoinEconomyContent />;
  if (path === "/seasons" || path.startsWith("/seasons/")) return <SeasonsContent path={path} />;
  return <div className="skeleton h-80 w-full" aria-label="正在加载交互页面" />;
}

export default async function Page({ params, searchParams }: PageProps) {
  const path = pathFrom((await params).slug);
  const query = await searchParams;
  if (path.startsWith("/user/")) redirect(path.replace("/user/", "/users/"));
  if (!isKnownRoute(path)) notFound();
  return (
    <div id="app" aria-live="polite">
      <div className="drawer">
        <div className="drawer-content min-h-screen">
          <header className="sticky top-0 z-30 border-b-2 border-base-content/20 bg-base-100">
            <div className="navbar mx-auto max-w-7xl px-3 sm:px-5">
              <div className="navbar-start"><details className="dropdown lg:hidden"><summary className="btn btn-ghost btn-square" aria-label="打开导航">☰</summary><ul className="menu dropdown-content z-30 mt-2 w-56 border-2 border-base-content/20 bg-base-100 p-2"><li><a href="/feed">首页</a></li><li><a href="/nodes">节点</a></li><li><a href="/following">关注</a></li><li><a href="/coins">金币</a></li><li><a href="/journey">共建</a></li><li><a href="/search">搜索</a></li></ul></details><a className="text-2xl font-black" href="/feed">X2Post</a></div>
              <nav className="navbar-center hidden lg:block" aria-label="主导航"><ul className="menu menu-horizontal gap-1"><li><a className={path === "/feed" ? "menu-active" : ""} href="/feed">首页</a></li><li><a className={path.startsWith("/nodes") ? "menu-active" : ""} href="/nodes">节点</a></li><li><a href="/following">关注</a></li><li><a href="/coins">金币</a></li><li><a href="/journey">共建</a></li><li><a href="/search">搜索</a></li></ul></nav>
              <div className="navbar-end gap-2"><a className="btn btn-primary hidden sm:inline-flex" href="/quick-compose">轻发布</a><a className="btn btn-ghost" href="/me">林默</a></div>
            </div>
          </header>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
            <main id="main-content" className="min-w-0"><RouteContent path={path} query={query} /></main>
            <aside className="min-w-0" aria-label="页面辅助信息"><section className="overflow-hidden rounded-box border-2 border-base-content/20"><header className="border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">我的 X2Post</h2></header><div className="p-5"><div className="flex items-center gap-3"><Avatar name="林默" image="user-linmo" /><div><a className="font-bold" href="/me">林默</a><p className="text-sm opacity-65">产品设计 · 上海</p></div></div></div></section></aside>
          </div>
          <footer className="mt-10 border-t-2 border-base-content/20"><div className="mx-auto max-w-7xl px-5 py-6 text-sm opacity-70">© 2026 X2Post · 认真表达，友善回应</div></footer>
        </div>
      </div>
    </div>
  );
}
