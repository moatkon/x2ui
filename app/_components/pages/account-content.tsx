import Link from "next/link";
import type { QueryParams } from "@/app/_lib/query";
import { posts } from "@/lib/mock-data";
import { ActionButton, AuthForm, ComposeForm, SettingsForm } from "../client/demo-actions";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { Breadcrumbs, DataTable, Notice, PageHeader, PageTabs, Panel } from "../shared/ui";

const settingsTabs = [["profile", "资料"], ["privacy", "隐私"], ["notifications", "通知"], ["security", "安全"], ["sessions", "设备会话"]] as const;

function AuthPage({ type }: { type: "login" | "register" | "verify" | "forgot" | "reset" }) {
  const copy = {
    login: ["欢迎回来", "登录后继续参与讨论"], register: ["加入 X2Post", "从一段真诚的自我介绍开始"],
    verify: ["验证邮箱", "我们已向 li•••@example.com 发送验证链接"], forgot: ["找回密码", "输入注册邮箱，我们会发送重置说明"],
    reset: ["设置新密码", "新密码会让其他设备上的旧会话失效"],
  } as const;
  return <div className="mx-auto w-full max-w-md"><Link className="mb-8 block text-center text-3xl font-black" href="/">X2Post</Link><section className="overflow-hidden rounded-box border-2 border-base-content/20"><header className="border-b-2 border-base-content/20 p-5 text-center"><h1 className="text-2xl font-black">{copy[type][0]}</h1><p className="mt-1 opacity-65">{copy[type][1]}</p></header><div className="p-5">{type === "verify" ? <Notice><p>请在 30 分钟内完成验证。如果没有收到，请检查垃圾邮件。</p></Notice> : null}<div className={type === "verify" ? "mt-4" : ""}><AuthForm type={type} /></div></div></section><p className="mt-5 text-center text-sm opacity-60">继续即表示你理解：已发布内容不能编辑或删除。</p></div>;
}

function ComposePage({ compact, query }: { compact: boolean; query: QueryParams }) {
  const node = typeof query.node === "string" ? query.node : compact ? "" : "product";
  const child = typeof query.subnode === "string" ? query.subnode : "";
  if (compact) return <><h1 className="sr-only">轻发布</h1><ComposeForm compact initialNode={node || "product"} initialChild={child} /></>;
  return <><PageHeader title="发布帖子" description={query.from === "quick" ? "轻发布内容已带入，请补充标题后继续完善。" : "先保存为草稿，确认无误后再发布。"} /><Panel title="内容草稿"><ComposeForm initialNode={node} initialChild={child} /></Panel></>;
}

function DraftsPage() {
  const drafts = [["怎样建立一个友善的提问模板", "产品设计", "2 分钟前", "68%"], ["社区健康度应该看哪些信号？", "社区运营", "昨天", "42%"], ["未命名草稿", "前端开发", "7 月 8 日", "12%"]];
  return <><PageHeader title="我的草稿" description="草稿可在发布前修改或放弃。" action={<Link className="btn btn-primary" href="/compose">新建草稿</Link>} /><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{drafts.map(([title, node, saved, progress], index) => <li className="list-row rounded-none" key={title}><div className="list-col-grow min-w-0"><Link className="font-bold hover:underline" href={`/compose?draft=${index}`}>{title}</Link><p className="mt-1 text-sm opacity-65">{node} · 保存于 {saved}</p></div><span className="badge badge-outline">{progress}</span><ActionButton className="btn btn-ghost btn-sm" message="草稿已放弃">放弃</ActionButton></li>)}</ul></>;
}

function NotificationsPage() {
  const items = [["青屿回复了你的帖子", "为什么社区内容需要明确的不可变边界？", "5 分钟前", true, "/posts/immutable-content#comments"], ["阿澈提到了你", "给内容社区做无障碍，不只是加 aria-label", "1 小时前", true, "/posts/accessible-ui"], ["你的举报有新进展", "案件 RP-2026-0712 已完成初步审核", "昨天", true, "/reports"], ["青屿关注了你", "现在有 231 人关注你", "周日", false, "/users/qingyu"], ["安全提醒", "新的设备登录了你的 X2Post 账号", "7 月 9 日", false, "/settings/sessions"]] as const;
  return <><PageHeader title="通知中心" description="回复、提及、关注、治理与账户安全消息。" action={<ActionButton message="已将全部通知标为已读">全部标为已读</ActionButton>} /><Panel title="通知" action={<select className="select select-sm" aria-label="通知筛选"><option>全部通知</option><option>未读</option><option>互动</option><option>系统</option></select>}><ul className="list x2-list -m-5 sm:-m-5">{items.map(([title, summary, time, unread, href]) => <li className="list-row rounded-none" key={title}><span className={`status ${unread ? "status-primary" : ""}`} aria-label={unread ? "未读" : "已读"} /><div className="list-col-grow min-w-0"><Link className="font-bold hover:underline" href={href}>{title}</Link><p className="mt-1 opacity-70">{summary}</p><p className="mt-2 text-sm opacity-55">{time}</p></div>{unread ? <ActionButton className="btn btn-ghost btn-sm" message="已标为已读">标为已读</ActionButton> : <span className="badge badge-outline">已读</span>}</li>)}</ul></Panel></>;
}

function SettingsPage({ tab }: { tab: string }) {
  const active = settingsTabs.some(([key]) => key === tab) ? tab : "profile";
  const titles: Record<string, string> = { profile: "编辑资料", privacy: "隐私设置", notifications: "通知设置", security: "账户安全", sessions: "设备会话" };
  let body = <><label className="form-control"><span className="label-text mb-2 font-semibold">显示名称</span><input className="input w-full" defaultValue="林默" required /></label><label className="form-control mt-4"><span className="label-text mb-2 font-semibold">个人简介</span><textarea className="textarea w-full" rows={4} maxLength={160} defaultValue="在复杂系统里寻找简单边界。" /><span className="label-text-alt mt-1 opacity-60">公开展示，最多 160 字。</span></label><label className="form-control mt-4"><span className="label-text mb-2 font-semibold">所在地</span><input className="input w-full" defaultValue="上海" /></label></>;
  if (active === "privacy") body = <div className="space-y-5">{[["允许出现在提及建议中", "被屏蔽的用户始终看不到你。", true], ["展示关注列表", "关闭后仅你自己可见。", true], ["搜索引擎收录个人页", "只影响公开个人页。", false]].map(([title, description, checked]) => <ToggleRow title={String(title)} description={String(description)} checked={Boolean(checked)} key={String(title)} />)}</div>;
  if (active === "notifications") body = <div className="space-y-5">{["回复与提及", "新关注", "内容互动", "治理进度", "账户安全"].map((title, index) => <ToggleRow title={title} description={index === 4 ? "安全通知不可完全关闭" : "站内通知与邮件摘要"} checked={index !== 2} disabled={index === 4} key={title} />)}</div>;
  if (active === "security") body = <><Notice><p>账号邮箱：li•••@example.com（已验证）</p></Notice><div className="mt-5 divide-y-2 divide-base-content/20"><SettingLink title="登录密码" description="上次修改于 2026 年 4 月 18 日" href="/settings/security/password" label="修改密码" /><SettingLink title="设备会话" description="当前有 3 个有效会话" href="/settings/sessions" label="管理设备" /></div></>;
  if (active === "sessions") body = <DataTable headers={["设备", "位置", "最近活动", "操作"]} rows={[["Mac · Chrome（当前）", "上海", "刚刚", <span className="badge badge-success" key="current">当前</span>], ["iPhone · Safari", "上海", "昨天", <ActionButton className="btn btn-sm" message="设备会话已撤销" key="iphone">撤销</ActionButton>], ["Windows · Edge", "杭州", "7 月 4 日", <ActionButton className="btn btn-sm" message="设备会话已撤销" key="windows">撤销</ActionButton>]]} />;
  return <><PageHeader title="设置" description="管理公开资料、隐私、通知与账户安全。" /><PageTabs items={settingsTabs.map(([key, label]) => ({ label, href: `/settings/${key}`, active: key === active }))} /><Panel title={titles[active]}><SettingsForm>{body}{active === "sessions" ? <div className="mt-5"><ActionButton message="其他会话已全部撤销">撤销其他全部会话</ActionButton></div> : null}</SettingsForm></Panel></>;
}

function ToggleRow({ title, description, checked, disabled = false }: { title: string; description: string; checked: boolean; disabled?: boolean }) {
  return <label className="flex min-h-11 items-center justify-between gap-4"><span><strong>{title}</strong><small className="block opacity-65">{description}</small></span><input className="toggle" type="checkbox" defaultChecked={checked} disabled={disabled} /></label>;
}

function SettingLink({ title, description, href, label }: { title: string; description: string; href: string; label: string }) {
  return <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{title}</p><p className="text-sm opacity-65">{description}</p></div><Link className="btn" href={href}>{label}</Link></div>;
}

function ReportsPage({ id }: { id?: string }) {
  if (id) return <><Breadcrumbs items={[{ label: "我的举报", href: "/me/reports" }, { label: id }]} /><div className="mt-3"><PageHeader title={`举报 ${id}`} description="仅显示你需要知道的进度，不公开内部审核信息。" /></div><Panel title="目标摘要"><p className="font-bold">为什么社区内容需要明确的不可变边界？</p><p className="mt-1 text-sm opacity-65">帖子 · 举报原因：骚扰或人身攻击</p></Panel><Panel className="mt-5" title="处理进度" footer={<Link className="link text-sm" href="/posts/immutable-content">目标仍公开，查看上下文</Link>}><ol className="space-y-5"><ProgressItem title="已提交" description="7 月 12 日 16:20 · 已生成提交凭证" status="success" /><ProgressItem title="审核中" description="社区团队正在核对上下文" status="warning" /><ProgressItem title="结果" description="处理完成后会在此说明结果类别" /></ol></Panel></>;
  const reports = [["RP-2026-0712", "帖子", "骚扰或人身攻击", "审核中", "warning"], ["RP-2026-0628", "评论", "垃圾信息", "已处理", "success"], ["RP-2026-0511", "用户", "冒充他人", "未违规", "default"]];
  return <><PageHeader title="我的举报" description="查看已提交举报的安全进度，不公开审核人员信息。" /><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{reports.map(([reportId, target, reason, status, kind]) => <li className="list-row rounded-none" key={reportId}><div className="list-col-grow"><Link className="font-bold hover:underline" href={`/me/reports/${reportId}`}>{reportId}</Link><p className="mt-1 text-sm opacity-65">{target} · {reason}</p></div><span className={`badge ${kind === "default" ? "badge-outline" : `badge-${kind}`}`}>{status}</span><span aria-hidden>›</span></li>)}</ul></>;
}

function ProgressItem({ title, description, status }: { title: string; description: string; status?: string }) {
  return <li className={`flex gap-3 ${status ? "" : "opacity-55"}`}><span className={`status mt-1 ${status ? `status-${status}` : ""}`} /><div><p className="font-bold">{title}</p><p className="text-sm opacity-65">{description}</p></div></li>;
}

function ReportFormPage() {
  return <><PageHeader title="提交举报" description="举报用于处理具体风险，不用于表达观点不同。" /><Panel title="被举报内容" footer={<Link className="link text-sm" href="/posts/immutable-content">查看公开上下文</Link>}><p className="font-bold">为什么社区内容需要明确的不可变边界？</p><p className="mt-1 text-sm opacity-65">帖子 · 林默 · 12 分钟前</p></Panel><Panel className="mt-5" title="举报详情"><div className="space-y-4"><label className="form-control"><span className="label-text mb-2 font-semibold">原因</span><select className="select w-full" required defaultValue=""><option value="" disabled>请选择原因</option>{["骚扰或人身攻击", "仇恨或歧视", "垃圾信息", "危险或违法内容", "侵犯隐私", "其他"].map((reason) => <option key={reason}>{reason}</option>)}</select></label><label className="form-control"><span className="label-text mb-2 font-semibold">补充说明</span><textarea className="textarea min-h-32 w-full" maxLength={1000} placeholder="说明具体位置和影响，避免重复粘贴敏感内容" /><span className="label-text-alt mt-1 opacity-60">最多 1,000 字。</span></label><label className="label cursor-pointer justify-start gap-3"><input className="checkbox" type="checkbox" required /><span>我确认信息真实，并理解恶意举报可能受到限制。</span></label><div className="flex justify-end gap-2"><Link className="btn" href="/posts/immutable-content">取消</Link><ActionButton className="btn btn-primary" message="举报已提交" href="/reports" api={{ method: "POST", path: "/reports", body: { target: { type: "POST", id: "immutable-content" }, reason: "OTHER", details: "原型演示举报", evidenceUploadIds: [], truthfulConfirmation: true }, idempotent: true }}>提交举报</ActionButton></div></div></Panel></>;
}

function BlockedPage() {
  const people = [["广告清理机", "已屏蔽于 6 月 28 日", "user-ad-cleaner"], ["争论到底", "已屏蔽于 5 月 11 日", "user-debater"]];
  return <><PageHeader title="屏蔽列表" description="屏蔽会减少双方在 Feed、搜索、提及和通知中的相互可见。" /><Notice><p>对方不会收到屏蔽通知。公开内容在必要的讨论上下文中仍可能以安全占位显示。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{people.map(([name, date, image]) => <li className="list-row rounded-none" key={name}><Avatar name={name} image={image.replace("user-", "user-")} /><div className="list-col-grow"><p className="font-bold">{name}</p><p className="text-sm opacity-65">{date}</p></div><ActionButton className="btn btn-sm" message="已解除屏蔽">解除屏蔽</ActionButton></li>)}</ul></>;
}

function AppealsPage({ path }: { path: string }) {
  if (path === "/appeals/new") return <AppealNewPage />;
  const id = path.split("/")[2];
  if (id) return <><Breadcrumbs items={[{ label: "我的申诉", href: "/appeals" }, { label: id }]} /><div className="mt-3"><PageHeader title={`申诉 ${id}`} description="状态、决定与补充说明会保留在时间线上。" /></div><Panel title="当前状态" footer={<ActionButton dialogTitle="补充申诉说明" dialogBody={<textarea className="textarea min-h-32 w-full" placeholder="只补充与复核有关的新事实" />}>补充说明</ActionButton>}><Notice><p>申诉正在由另一位治理人员复核。预计 3 个工作日内更新。</p></Notice><ol className="mt-5 space-y-4"><li><p className="font-bold">已提交申诉</p><p className="text-sm opacity-60">7 月 10 日 18:42</p></li><li><p className="font-bold">进入复核</p><p className="text-sm opacity-60">7 月 11 日 09:10</p></li></ol></Panel></>;
  return <><PageHeader title="申诉" description="对内容或账户处置提出复核，并持续查看进度。" action={<Link className="btn btn-primary" href="/appeals/new">发起申诉</Link>} /><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20"><li className="list-row rounded-none"><div className="list-col-grow"><Link className="font-bold" href="/appeals/AP-2026-0041">AP-2026-0041 · 帖子锁定</Link><p className="mt-1 text-sm opacity-65">提交于 7 月 10 日 · 已补充说明</p></div><span className="badge badge-warning">复核中</span></li><li className="list-row rounded-none"><div className="list-col-grow"><p className="font-bold">AP-2026-0018 · 账户限流</p><p className="mt-1 text-sm opacity-65">提交于 5 月 3 日</p></div><span className="badge badge-success">已结束</span></li></ul></>;
}

function AppealNewPage() {
  return <><PageHeader title="发起申诉" description="说明需要复核的事实，不会改写原始处置记录。" /><Panel title="关联处置"><p className="font-bold">帖子锁定 · 2026 年 7 月 10 日</p><p className="mt-1 opacity-70">原因：讨论偏离节点规则，多次出现人身攻击。</p><Link className="link mt-3 inline-block text-sm" href="/nodes/product">查看适用规则</Link></Panel><Panel className="mt-5" title="申诉说明"><div className="space-y-4"><select className="select w-full" required defaultValue=""><option value="" disabled>请选择申诉理由</option><option>上下文理解有误</option><option>处置范围不合适</option><option>补充新证据</option><option>其他</option></select><textarea className="textarea min-h-32 w-full" maxLength={2000} placeholder="说明你希望复核的事实与依据" required /><input className="file-input w-full" type="file" /><p className="text-sm opacity-60">请勿上传无关个人信息。</p><div className="flex justify-end"><ActionButton className="btn btn-primary" message="申诉已提交" href="/appeals/AP-2026-0041">提交申诉</ActionButton></div></div></Panel></>;
}

function MePage() {
  return <><PageHeader title="我的主页" description="管理你的内容、关系和待办。" action={<Link className="btn" href="/users/linmo">查看公开主页</Link>} /><Panel title="林默" footer={<div className="flex flex-wrap gap-2"><Link className="btn" href="/settings/profile">编辑资料</Link><Link className="btn" href="/drafts">草稿 3</Link><Link className="btn" href="/notifications">通知 6</Link><Link className="btn" href="/bookmarks">收藏</Link></div>}><div className="flex items-center gap-4"><Avatar name="林默" image="user-linmo" sizeClass="size-16" /><div><p className="text-xl font-black">林默 <span className="text-sm font-normal opacity-60">@linmo</span></p><p className="mt-1 opacity-70">在复杂系统里寻找简单边界。</p></div></div><dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["帖子", "36"], ["评论", "128"], ["关注", "48"], ["粉丝", "231"]].map(([label, value]) => <div key={label}><dt className="text-sm opacity-60">{label}</dt><dd className="text-xl font-bold">{value}</dd></div>)}</dl></Panel></>;
}

function ChangePasswordPage() {
  return <><Breadcrumbs items={[{ label: "账户安全", href: "/settings/security" }, { label: "修改密码" }]} /><div className="mt-3"><PageHeader title="修改密码" description="更新成功后可以选择撤销其他设备会话。" /></div><Panel title="设置新密码"><div className="space-y-4"><input className="input w-full" type="password" autoComplete="current-password" placeholder="当前密码" required /><input className="input w-full" type="password" autoComplete="new-password" placeholder="新密码" minLength={8} required /><p className="text-sm opacity-60">至少 8 位，避免与其他网站重复。</p><input className="input w-full" type="password" autoComplete="new-password" placeholder="确认新密码" minLength={8} required /><div className="flex justify-end"><ActionButton className="btn btn-primary" message="密码已更新" href="/settings/sessions">更新密码</ActionButton></div></div></Panel></>;
}

function VerifyResultPage() {
  return <div className="mx-auto w-full max-w-md"><Link className="mb-8 block text-center text-3xl font-black" href="/">X2Post</Link><Panel title="邮箱验证成功" footer={<Link className="btn btn-primary w-full" href="/auth/recover-task">继续</Link>}><div className="text-center"><div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-success text-2xl text-success">✓</div><h1 className="mt-4 text-2xl font-black">欢迎加入 X2Post</h1><p className="mt-2 opacity-70">邮箱已验证。接下来将恢复你登录前的任务。</p></div></Panel><div className="mt-4"><Notice><p>链接失效或已使用时，此页会安全提示重新发送，不泄露账号信息。</p></Notice></div></div>;
}

function AuthRecoveryPage() {
  return <div className="mx-auto w-full max-w-md"><Link className="mb-8 block text-center text-3xl font-black" href="/">X2Post</Link><Panel title="恢复之前的任务" footer={<div className="flex justify-end gap-2"><Link className="btn" href="/posts/immutable-content">取消</Link><ActionButton className="btn btn-primary" message="原任务已恢复：帖子已收藏" href="/posts/immutable-content" api={{ method: "PUT", path: "/users/me/bookmarks/immutable-content" }}>继续收藏</ActionButton></div>}><div className="flex items-start gap-3"><span className="loading loading-spinner loading-md" /><div><h1 className="font-bold">已回到原帖子与评论位置</h1><p className="mt-1 opacity-70">你登录前准备收藏帖子。为避免意外操作，请再次确认。</p></div></div><div className="mt-5 border-y-2 border-base-content/20 py-4"><p className="font-bold">为什么社区内容需要明确的不可变边界？</p><p className="mt-1 text-sm opacity-60">来源：帖子详情 · 评论区</p></div></Panel></div>;
}

export function AccountRouteContent({ path, query }: { path: string; query: QueryParams }) {
  const authMap: Record<string, "login" | "register" | "verify" | "forgot" | "reset"> = { "/login": "login", "/auth/login": "login", "/register": "register", "/auth/register": "register", "/verify-email": "verify", "/auth/verify": "verify", "/forgot-password": "forgot", "/auth/forgot": "forgot", "/reset-password": "reset", "/auth/reset": "reset" };
  if (authMap[path]) return <AuthPage type={authMap[path]} />;
  if (path === "/quick-compose") return <ComposePage compact query={query} />;
  if (path === "/compose") return <ComposePage compact={false} query={query} />;
  if (path === "/drafts") return <DraftsPage />;
  if (path === "/bookmarks") return <><PageHeader title="我的收藏" description="保存下来，稍后继续阅读。" /><PostRows filter={(post) => posts.slice(0, 2).includes(post)} /></>;
  if (path === "/following") return <><PageHeader title="关注 Feed" description="来自你关注的用户和节点，按时间排序。" /><PostRows filter={(post) => posts.slice(1).includes(post)} /></>;
  if (path === "/notifications") return <NotificationsPage />;
  if (path === "/me") return <MePage />;
  if (path === "/settings/security/password") return <ChangePasswordPage />;
  if (path.startsWith("/settings/") && !["/settings/blocked", "/settings/coins", "/settings/journey"].includes(path)) return <SettingsPage tab={path.split("/")[2]} />;
  if (path === "/blocked" || path === "/settings/blocked") return <BlockedPage />;
  if (path === "/reports" || path === "/me/reports") return <ReportsPage />;
  if (path.startsWith("/me/reports/")) return <ReportsPage id={path.split("/")[3]} />;
  if (path === "/report/new") return <ReportFormPage />;
  if (path === "/appeals" || path.startsWith("/appeals/")) return <AppealsPage path={path} />;
  if (path === "/verify-email/result") return <VerifyResultPage />;
  if (path === "/auth/recover-task") return <AuthRecoveryPage />;
  if (path === "/403") return <Panel title="没有访问权限" footer={<div className="flex gap-2"><Link className="btn btn-primary" href="/">返回首页</Link><Link className="btn" href="/nodes">查看公开规则</Link></div>}><h1 className="text-3xl font-black">403</h1><p className="mt-2 opacity-70">你的账号没有进入治理工作台的权限。公开内容仍可正常浏览。</p><div className="mt-4"><Notice kind="warning"><p>如果你刚获得权限，请重新登录或联系社区管理员确认授权。</p></Notice></div></Panel>;
  return null;
}
