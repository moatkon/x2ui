import Link from "next/link";
import type { QueryParams } from "@/app/_lib/page-routing";
import { posts } from "@/lib/mock-data";
import { ActionButton, AuthForm, ComposeForm, SettingsForm } from "../client/demo-actions";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { Breadcrumbs, DataTable, Notice, PageHeader, PageTabs, Panel, StatGrid } from "../shared/ui";

const settingsTabs = [
  ["profile", "个人资料"], ["privacy", "隐私"], ["notifications", "通知"], ["security", "安全"], ["sessions", "设备会话"],
] as const;

function AuthPage({ type }: { type: "login" | "register" | "verify" | "forgot" | "reset" }) {
  const copy = { login: ["登录 X2Post", "登录后会恢复你的来源页面和未完成任务。"], register: ["创建账号", "从一个公开身份开始参与讨论。"], verify: ["验证邮箱", "验证后即可发布和回应。"], forgot: ["找回密码", "我们只会向已注册邮箱发送说明。"], reset: ["重置密码", "更新后需要在其他设备重新登录。"] } as const;
  return <div className="mx-auto max-w-md"><PageHeader title={copy[type][0]} description={copy[type][1]} /><Panel><AuthForm type={type} /></Panel></div>;
}

function ComposePage({ compact, query }: { compact: boolean; query: QueryParams }) {
  const node = typeof query.node === "string" ? query.node : "product";
  const child = typeof query.subnode === "string" ? query.subnode : "";
  return <><PageHeader title={compact ? "轻发布" : "发布长帖"} description={compact ? "先留下一个完整想法，稍后也可以继续扩展。" : "发布前可反复保存与预览，提交后内容保持不可变。"} /><Notice kind="warning"><p>请勿发布密钥、住址、联系方式或未授权的个人信息。</p></Notice><Panel className="mt-5" title={compact ? "写点什么" : "帖子内容"}><ComposeForm compact={compact} initialNode={node} initialChild={child} /></Panel></>;
}

function SimpleListPage({ title, description, mode }: { title: string; description: string; mode: "drafts" | "bookmarks" | "following" }) {
  if (mode !== "drafts") return <><PageHeader title={title} description={description} /><PostRows filter={(post) => mode === "bookmarks" ? posts.slice(0, 2).includes(post) : posts.slice(1).includes(post)} /></>;
  return <><PageHeader title={title} description={description} action={<Link className="btn btn-primary" href="/compose">新建帖子</Link>} /><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{posts.slice(0, 3).map((post, index) => <li className="list-row rounded-none" key={post.id}><div className="list-col-grow"><p className="font-bold">{index ? post.title : "怎样建立一个友善的提问模板"}</p><p className="mt-1 text-sm opacity-60">{index ? "自动保存于昨天" : "刚刚保存"} · {post.nodePath.parentName}</p></div><div className="flex gap-2"><Link className="btn btn-sm" href={`/compose?draft=${index + 1}`}>继续编辑</Link><ActionButton className="btn btn-ghost btn-sm" message="草稿已放弃">放弃</ActionButton></div></li>)}</ul></>;
}

function NotificationsPage() {
  const rows = [
    ["青屿回应了你的帖子", "为什么社区内容需要明确的不可变边界？", "12 分钟前"],
    ["你的举报有了新进度", "CASE-2026-0714 已进入复核", "1 小时前"],
    ["共建任务等待质量确认", "新人问题首响 · 产品设计", "昨天"],
  ];
  return <><PageHeader title="通知" description="回复、治理进度和你主动订阅的社区事件。" action={<ActionButton message="已将全部通知标为已读">全部标为已读</ActionButton>} /><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{rows.map(([title, desc, time]) => <li className="list-row rounded-none" key={title}><div className="list-col-grow"><Link className="font-bold" href="/posts/immutable-content">{title}</Link><p className="mt-1 opacity-65">{desc}</p><p className="mt-2 text-xs opacity-50">{time}</p></div><ActionButton className="btn btn-ghost btn-sm" message="已标为已读">标为已读</ActionButton></li>)}</ul></>;
}

function MePage() {
  return <><PageHeader title="我的 X2Post" description="管理公开身份、内容、贡献与安全设置。" /><Panel><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><Avatar name="林默" image="user-linmo" sizeClass="size-20" /><div><h2 className="text-2xl font-black">林默</h2><p className="opacity-65">@linmo · 产品设计 · 上海</p><p className="mt-2">关注内容社区、产品策略与可信治理。</p></div></div></Panel><div className="mt-5"><StatGrid items={[{ title: "帖子", value: 24 }, { title: "评论", value: 186 }, { title: "粉丝", value: 329 }, { title: "关注", value: 48 }]} /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Panel title="内容"><div className="flex flex-wrap gap-2"><Link className="btn" href="/drafts">草稿</Link><Link className="btn" href="/bookmarks">收藏</Link><Link className="btn" href="/me/reports">举报</Link></div></Panel><Panel title="贡献"><div className="flex flex-wrap gap-2"><Link className="btn" href="/me/progress">成长路径</Link><Link className="btn" href="/me/contributions">贡献记录</Link><Link className="btn" href="/me/collection">收藏品</Link></div></Panel></div></>;
}

function SettingsPage({ section }: { section: string }) {
  const active = settingsTabs.some(([key]) => key === section) ? section : "profile";
  const content = active === "sessions" ? <DataTable headers={["设备", "最近活动", "状态", "操作"]} rows={[["MacBook Pro · Chrome", "刚刚 · 上海", "当前设备", <span key="current">—</span>], ["iPhone · Safari", "昨天 · 上海", "正常", <ActionButton className="btn btn-sm" message="设备会话已撤销" key="revoke">撤销</ActionButton>]]} /> : active === "security" ? <div className="space-y-4"><label className="form-control"><span className="label-text mb-2 font-semibold">当前密码</span><input className="input w-full" type="password" defaultValue="prototype-only" /></label><label className="form-control"><span className="label-text mb-2 font-semibold">新密码</span><input className="input w-full" type="password" defaultValue="prototype-only-new" /></label></div> : <div className="space-y-5"><label className="flex min-h-11 items-center justify-between gap-4"><span><strong>{active === "profile" ? "公开展示所在地" : active === "privacy" ? "允许被搜索发现" : "有人回应时通知"}</strong><small className="block opacity-65">可随时调整，不影响既有公开讨论记录。</small></span><input className="toggle" type="checkbox" defaultChecked /></label><label className="flex min-h-11 items-center justify-between gap-4"><span><strong>{active === "profile" ? "展示贡献收藏" : active === "privacy" ? "允许关注" : "每周社区摘要"}</strong><small className="block opacity-65">关闭后只改变后续展示或提醒。</small></span><input className="toggle" type="checkbox" /></label></div>;
  return <><PageHeader title="设置" description="控制账号、安全、提醒和公开资料。" /><PageTabs items={settingsTabs.map(([key, label]) => ({ label, href: `/settings/${key}`, active: active === key }))} /><Panel title={settingsTabs.find(([key]) => key === active)?.[1]}><SettingsForm>{content}</SettingsForm></Panel></>;
}

function ReportsPage({ detail }: { detail?: string }) {
  if (detail) return <><Breadcrumbs items={[{ label: "我的举报", href: "/me/reports" }, { label: detail }]} /><div className="mt-4"><PageHeader title={`举报 ${detail}`} description="进度、处理说明和可申诉入口会保留在此。" /></div><Notice kind="info"><p>当前状态：复核中 · 最近更新于 7 月 14 日 16:40</p></Notice><Panel className="mt-5" title="进度记录"><ol className="steps steps-vertical"><li className="step step-primary">举报已提交</li><li className="step step-primary">已完成初审</li><li className="step">等待复核结论</li></ol></Panel></>;
  return <><PageHeader title="我的举报" description="查看举报的受理、复核与结论，不公开举报人身份。" action={<Link className="btn btn-primary" href="/report/new">提交举报</Link>} /><DataTable headers={["编号", "对象", "状态", "更新时间"]} rows={[[<Link href="/me/reports/RPT-2026-0714" className="link" key="id">RPT-2026-0714</Link>, "帖子", "复核中", "7 月 14 日"], ["RPT-2026-0628", "评论", "已结案", "6 月 30 日"]]} /></>;
}

function ReportFormPage() {
  return <><PageHeader title="提交举报" description="说明具体风险与上下文；举报不会自动隐藏内容。" /><Notice kind="warning"><p>请如实提交。恶意或批量举报不会提升处理优先级。</p></Notice><Panel className="mt-5" title="举报信息"><div className="space-y-4"><label className="form-control"><span className="label-text mb-2 font-semibold">原因</span><select className="select w-full" defaultValue="OTHER"><option value="HARASSMENT">骚扰</option><option value="PRIVACY">隐私风险</option><option value="OTHER">其他</option></select></label><label className="form-control"><span className="label-text mb-2 font-semibold">详细说明</span><textarea className="textarea min-h-32 w-full" defaultValue="请复核帖子中的相关上下文。" /></label><label className="label justify-start gap-3"><input className="checkbox" type="checkbox" defaultChecked /><span>我确认以上信息真实，并理解处理需要时间。</span></label><div className="flex justify-end"><ActionButton className="btn btn-primary" message="举报已提交" href="/reports" api={{ method: "POST", path: "/reports", body: { target: { type: "POST", id: "immutable-content" }, reason: "OTHER", details: "静态原型演示举报", evidenceUploadIds: [], truthfulConfirmation: true }, idempotent: true }}>提交举报</ActionButton></div></div></Panel></>;
}

function AppealsPage({ path }: { path: string }) {
  if (path === "/appeals/new") return <><PageHeader title="发起申诉" description="指出需要重新核对的事实或上下文。" /><Panel title="申诉信息"><div className="space-y-4"><select className="select w-full" defaultValue="case"><option value="case">帖子锁定 · 7 月 10 日</option></select><textarea className="textarea min-h-32 w-full" placeholder="说明你认为需要复核的事实" /><div className="flex justify-end"><ActionButton className="btn btn-primary" message="申诉已提交" href="/appeals/AP-2026-0042">提交申诉</ActionButton></div></div></Panel></>;
  const id = path.split("/")[2];
  if (id) return <><Breadcrumbs items={[{ label: "申诉", href: "/appeals" }, { label: id }]} /><div className="mt-4"><PageHeader title={`申诉 ${id}`} description="独立复核不会由原处置人单独完成。" /></div><Notice kind="info"><p>状态：等待复核 · 已保留原处置和全部补充说明</p></Notice><Panel className="mt-5" title="申诉说明"><p>我认为原处置遗漏了帖子上下文，请复核完整讨论链。</p></Panel></>;
  return <><PageHeader title="申诉" description="对与你有关的治理处置申请独立复核。" action={<Link className="btn btn-primary" href="/appeals/new">发起申诉</Link>} /><DataTable headers={["编号", "关联处置", "状态", "更新时间"]} rows={[[<Link className="link" href="/appeals/AP-2026-0042" key="appeal">AP-2026-0042</Link>, "帖子锁定", "等待复核", "7 月 14 日"]]} /></>;
}

export function AccountRouteContent({ path, query }: { path: string; query: QueryParams }) {
  const authMap: Record<string, "login" | "register" | "verify" | "forgot" | "reset"> = { "/login": "login", "/auth/login": "login", "/register": "register", "/auth/register": "register", "/verify-email": "verify", "/auth/verify": "verify", "/forgot-password": "forgot", "/auth/forgot": "forgot", "/reset-password": "reset", "/auth/reset": "reset" };
  if (authMap[path]) return <AuthPage type={authMap[path]} />;
  if (path === "/quick-compose") return <ComposePage compact query={query} />;
  if (path === "/compose") return <ComposePage compact={false} query={query} />;
  if (path === "/drafts") return <SimpleListPage title="草稿" description="发布前可以反复修改；草稿不会被公开索引。" mode="drafts" />;
  if (path === "/bookmarks") return <SimpleListPage title="我的收藏" description="保存下来，稍后继续阅读。" mode="bookmarks" />;
  if (path === "/following") return <SimpleListPage title="关注 Feed" description="来自你关注的用户和节点，按时间排序。" mode="following" />;
  if (path === "/notifications") return <NotificationsPage />;
  if (path === "/me") return <MePage />;
  if (path.startsWith("/settings/") && path !== "/settings/blocked" && path !== "/settings/coins" && path !== "/settings/journey") return <SettingsPage section={path.split("/")[2] === "security" && path.endsWith("password") ? "security" : path.split("/")[2]} />;
  if (path === "/blocked" || path === "/settings/blocked") return <><PageHeader title="已屏蔽用户" description="屏蔽减少彼此出现，不会通知对方，也不会改写历史讨论。" /><Panel><div className="flex items-center gap-3"><Avatar name="争论到底" image="user-debater" /><div className="grow"><p className="font-bold">争论到底</p><p className="text-sm opacity-60">@debater</p></div><ActionButton className="btn btn-sm" message="已解除屏蔽">解除屏蔽</ActionButton></div></Panel></>;
  if (path === "/reports" || path === "/me/reports") return <ReportsPage />;
  if (path.startsWith("/me/reports/")) return <ReportsPage detail={path.split("/")[3]} />;
  if (path === "/report/new") return <ReportFormPage />;
  if (path === "/appeals" || path.startsWith("/appeals/")) return <AppealsPage path={path} />;
  if (path === "/auth/recover-task") return <><PageHeader title="恢复原任务" description="登录成功，来源页面和意图仍然保留。" /><Notice kind="success"><p>检测到登录前任务：收藏帖子《为什么社区内容需要明确的不可变边界？》</p></Notice><div className="mt-5"><ActionButton className="btn btn-primary" message="原任务已恢复" href="/posts/immutable-content">继续并完成收藏</ActionButton></div></>;
  if (path === "/verify-email/result") return <><PageHeader title="邮箱已验证" description="账号已准备好，可以开始公开参与讨论。" /><Link className="btn btn-primary" href="/feed">进入首页</Link></>;
  if (path === "/403") return <><PageHeader title="没有访问权限" description="当前账号不能执行此操作。" /><Notice kind="warning"><p>如认为权限判断有误，请通过申诉入口提交复核。</p></Notice><Link className="btn mt-5" href="/feed">返回首页</Link></>;
  return null;
}
