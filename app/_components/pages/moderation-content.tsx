import Link from "next/link";
import { ActionButton } from "../client/demo-actions";
import { Breadcrumbs, DataTable, Notice, PageHeader, Panel } from "../shared/ui";

function ModerationQueue() {
  return <><PageHeader title="治理案例队列" description="基于规则、证据和权限处理风险，所有动作进入不可变审计日志。" /><Notice kind="warning"><p>隐藏、锁定与账号措施相互独立；不能用金币风险代替内容治理判断。</p></Notice><div className="mt-5"><DataTable headers={["案例", "对象", "风险", "状态", "更新时间"]} rows={[[<Link className="link" href="/moderation/cases/CASE-2026-0714" key="case">CASE-2026-0714</Link>, "帖子", "隐私信息", "等待复核", "16:40"], [<Link className="link" href="/moderation/cases/CASE-2026-0709" key="case2">CASE-2026-0709</Link>, "评论", "骚扰", "处理中", "昨天"]]} /></div></>;
}

function ModerationCase({ id }: { id: string }) {
  return <><Breadcrumbs items={[{ label: "治理案例", href: "/moderation/cases" }, { label: id }]} /><div className="mt-4"><PageHeader title={`治理案例 ${id}`} description="隐私信息 · 帖子 · 等待复核" /></div><Notice kind="info"><p>原始内容保持不可变；可见性变化与理由会作为独立记录保存。</p></Notice><Panel className="mt-5" title="证据与上下文"><p className="leading-relaxed">举报指出帖子正文可能包含未经授权的联系方式。初审已限制搜索展示，等待第二位治理者复核完整上下文。</p></Panel><Panel className="mt-5" title="选择治理动作"><div className="grid gap-3 sm:grid-cols-2"><label className="rounded-box border-2 border-base-content/20 p-4"><input className="radio mr-3" type="radio" name="action" defaultChecked />保持限制并隐藏正文</label><label className="rounded-box border-2 border-base-content/20 p-4"><input className="radio mr-3" type="radio" name="action" />恢复公开展示</label></div><label className="form-control mt-4"><span className="label-text mb-2 font-semibold">处置理由</span><textarea className="textarea min-h-28 w-full" defaultValue="根据隐私规则，需要继续限制展示并通知作者申诉入口。" /></label><div className="mt-5 flex justify-end"><ActionButton className="btn btn-primary" message="治理动作已执行并写入审计日志">确认执行</ActionButton></div></Panel></>;
}

function ModerationAppeals() {
  return <><PageHeader title="申诉复核队列" description="由未参与原处置的治理者复核事实、规则与上下文。" /><DataTable headers={["申诉", "原处置", "申请人", "状态"]} rows={[[<Link className="link" href="/appeals/AP-2026-0042" key="appeal">AP-2026-0042</Link>, "帖子锁定", "@linmo", "等待独立复核"], ["AP-2026-0038", "账号限流", "@qingyu", "补充材料中"]]} /></>;
}

function AuditLogs() {
  return <><PageHeader title="治理审计日志" description="公开可核对的动作类型、规则版本与结果，不暴露举报人身份。" /><DataTable headers={["时间", "执行者", "动作", "对象", "规则版本"]} rows={[["7 月 14 日 16:40", "Moderator M-07", "限制搜索展示", "POST:immutable-content", "2026.07"], ["7 月 14 日 15:10", "Moderator M-02", "锁定评论", "POST:small-community", "2026.07"], ["7 月 13 日 09:20", "Controller D-04", "金币分录冲正", "TX:8421", "2026.07"]]} /></>;
}

export function ModerationRouteContent({ path }: { path: string }) {
  if (path === "/moderation" || path === "/moderation/cases") return <ModerationQueue />;
  if (path.startsWith("/moderation/cases/")) return <ModerationCase id={path.split("/")[3]} />;
  if (path === "/moderation/appeals") return <ModerationAppeals />;
  if (path === "/moderation/audit" || path === "/moderation/audit-logs") return <AuditLogs />;
  return null;
}
