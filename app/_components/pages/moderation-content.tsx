import Link from "next/link";
import { ActionButton } from "../client/action-button";
import { Breadcrumbs, DataTable, Notice, PageHeader, Pagination, Panel } from "../shared/ui";

export function ModerationQueuePage() {
  return <><PageHeader title="审核队列" description="按风险与时效处理举报；原始内容不可被改写或删除。" /><Notice kind="warning"><p>治理动作会进入不可变审计记录。隐藏内容和限制用户都必须填写理由。</p></Notice><div className="mt-5"><DataTable headers={["案件", "对象", "原因", "状态", "进入队列"]} rows={[[<Link className="link" href="/moderation/cases/MC-0713-18" key="18">MC-0713-18</Link>, "帖子", "隐私泄露", <span className="badge badge-error" key="s">紧急</span>, "2 分钟前"], [<Link className="link" href="/moderation/cases/MC-0713-17" key="17">MC-0713-17</Link>, "用户", "骚扰", <span className="badge badge-warning" key="s">待分派</span>, "18 分钟前"], [<Link className="link" href="/moderation/cases/MC-0713-16" key="16">MC-0713-16</Link>, "评论", "垃圾信息", <span className="badge badge-info" key="s">审核中</span>, "31 分钟前"]]} /></div></>;
}

export function ModerationCasePage({ id }: { id: string }) {
  return <><Breadcrumbs items={[{ label: "审核队列", href: "/moderation" }, { label: id }]} /><div className="mt-3"><PageHeader title={`案件 ${id}`} description="高风险 · 隐私泄露 · 2 分钟前进入队列" /></div><Panel title="举报上下文"><dl className="grid gap-3 text-sm sm:grid-cols-2">{[["举报对象", "帖子：城市散步路线分享"], ["举报次数", "3 次独立举报"], ["当前可见性", "已紧急隐藏"], ["作者历史", "近 90 天无处置"]].map(([label, value]) => <div key={label}><dt className="opacity-60">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl><div className="mt-4 border-t-2 border-base-content/20 pt-4"><p className="font-bold">风险摘要</p><p className="mt-2 leading-relaxed">内容可能包含可识别的私人住址。为避免扩散，此原型不展示原文，只保留必要案件上下文。</p></div></Panel><Panel className="mt-5" title="治理动作"><div className="grid gap-3 sm:grid-cols-2"><ActionButton message="已选择恢复可见性">恢复可见性</ActionButton><ActionButton message="已选择保持隐藏">保持隐藏</ActionButton><ActionButton message="已选择锁定评论">锁定评论</ActionButton><ActionButton message="已选择限制用户">限制用户</ActionButton></div><textarea className="textarea mt-4 min-h-32 w-full" placeholder="说明证据、风险与处置期限" required /><div className="mt-5 flex justify-end"><ActionButton className="btn btn-primary" message="治理动作已执行并写入审计日志">记录并执行</ActionButton></div></Panel></>;
}

export function ModerationAppealsPage() {
  return <><PageHeader title="申诉处理" description="独立复核处置依据，并将决定写入审计日志。" /><Panel title="申诉队列" action={<select className="select select-sm"><option>待处理</option><option>已处理</option><option>全部</option></select>} footer={<Pagination />}><ul className="list x2-list -m-5"><li className="list-row rounded-none"><div className="list-col-grow"><Link className="font-bold hover:underline" href="/appeals/AP-2026-0041">AP-2026-0041 · 帖子锁定</Link><p className="text-sm opacity-65">新证据 · 等待 18 小时</p></div><span className="badge badge-warning">待复核</span></li><li className="list-row rounded-none"><div className="list-col-grow"><Link className="font-bold hover:underline" href="/appeals/AP-2026-0039">AP-2026-0039 · 用户限流</Link><p className="text-sm opacity-65">处置范围 · 等待 1 天</p></div><span className="badge badge-info">审核中</span></li></ul></Panel></>;
}

export function ModerationAuditPage() {
  return <><PageHeader title="审计日志" description="只读记录所有治理动作、理由与责任主体。" /><DataTable headers={["记录", "动作", "案件", "执行者", "时间"]} rows={[["AL-8891", "保持内容隐藏", "MC-0713-18", "审核员 A-17", "14:42"], ["AL-8890", "紧急隐藏", "MC-0713-18", "系统规则", "14:39"], ["AL-8889", "解除用户限流", "MC-0712-41", "审核员 B-03", "13:17"]]} /></>;
}
