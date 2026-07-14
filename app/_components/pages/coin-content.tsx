import Link from "next/link";
import { ActionButton, SettingsForm } from "../client/demo-actions";
import { CoinEconomyContent, CoinRulesContent } from "./coin-public-content";
import { Breadcrumbs, DataTable, Notice, PageHeader, PageTabs, Panel, ProgressBar, StatGrid } from "../shared/ui";

const tabs = [
  ["钱包", "/coins"], ["明细", "/coins/ledger"], ["悬赏", "/coins/bounties"], ["规则", "/coins/rules"], ["透明度", "/coins/economy"],
] as const;

function CoinTabs({ path }: { path: string }) {
  return <PageTabs items={tabs.map(([label, href]) => ({ label, href, active: path === href || (href === "/coins/bounties" && path.startsWith(`${href}/`)) }))} label="金币页面" />;
}

function WalletPage() {
  return <><PageHeader title="我的金币" description="金币只用于感谢与悬赏，不可购买、提现、转账，也不影响排序。" action={<Link className="btn" href="/coins/rules">查看规则</Link>} /><CoinTabs path="/coins" /><StatGrid items={[{ title: "可用", value: 286, description: "可用于感谢和悬赏" }, { title: "待确认", value: 10, description: "质量事件观察中" }, { title: "托管", value: 50, description: "开放悬赏" }, { title: "保留", value: 5, description: "风险复核中" }]} /><div className="mt-5 grid gap-5 sm:grid-cols-2"><Panel title="本周质量奖励"><ProgressBar value={42} max={60} label="已确认金币" /><p className="mt-3 text-sm opacity-65">发布数量和在线时长不会直接产生奖励。</p></Panel><Panel title="快捷入口"><div className="flex flex-wrap gap-2"><Link className="btn" href="/coins/ledger">查看明细</Link><Link className="btn" href="/coins/bounties">管理悬赏</Link><Link className="btn" href="/settings/coins">偏好设置</Link></div></Panel></div></>;
}

const ledgerRows = [
  ["7 月 14 日 15:20", "金币感谢", "+1", "POST:immutable-content", "已入账"],
  ["7 月 14 日 12:04", "感谢成本", "-2", "THANK:TX-8421", "已入账"],
  ["7 月 13 日 19:30", "质量奖励", "+6", "QUALITY:comment-1", "已确认"],
  ["7 月 10 日 09:12", "悬赏托管", "-50", "BOUNTY:B-2026-17", "托管中"],
];

function LedgerPage() {
  return <><PageHeader title="金币明细" description="每次变化都有来源、方向和不可变分录。" /><CoinTabs path="/coins/ledger" /><DataTable headers={["时间", "类型", "变化", "来源", "状态"]} rows={ledgerRows} /></>;
}

function BountiesPage({ id }: { id?: string }) {
  if (id) return <><Breadcrumbs items={[{ label: "悬赏", href: "/coins/bounties" }, { label: id }]} /><div className="mt-4"><PageHeader title="如何为社区建立无障碍验收清单？" description={`悬赏 ${id} · 50 金币已托管`} /></div><Notice kind="info"><p>发布满 24 小时后可以采纳；答主获得 80%，20% 永久销毁。</p></Notice><Panel className="mt-5" title="候选回答" footer={<div className="flex justify-end"><ActionButton className="btn btn-primary" dialogTitle="确认采纳这个回答？" dialogBody={<div><p>50 托管金币将结算：答主获得 40，系统销毁 10。</p><div className="mt-4"><ActionButton className="btn btn-primary" message="悬赏已结算">确认采纳</ActionButton></div></div>}>采纳回答</ActionButton></div>}><p className="font-bold">阿澈的回答</p><p className="mt-2 leading-relaxed">可以从键盘路径、焦点可见性、200% 缩放和错误恢复四类任务建立验收矩阵，并为每一项保留复现证据。</p></Panel></>;
  return <><PageHeader title="问题悬赏" description="用固定档位托管金币，为真实问题邀请高质量回答。" action={<ActionButton className="btn btn-primary" dialogTitle="创建悬赏" dialogBody={<div><p>固定档位：20 / 50 / 100。金币将先进入托管。</p><div className="join mt-4"><button className="btn join-item">20</button><button className="btn join-item btn-active">50</button><button className="btn join-item">100</button></div></div>}>创建悬赏</ActionButton>} /><CoinTabs path="/coins/bounties" /><Notice kind="info"><p>同一帖子只能有一个开放悬赏；采纳不可自行撤销。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{[["B-2026-17", "如何为社区建立无障碍验收清单？", "50", "开放中 · 还剩 9 天"], ["B-2026-12", "冷启动阶段怎样判断互动节奏健康？", "20", "已结算"]].map(([id, title, amount, status]) => <li className="list-row rounded-none" key={id}><div className="list-col-grow"><Link className="font-bold" href={`/coins/bounties/${id}`}>{title}</Link><p className="mt-1 text-sm opacity-60">{id} · {status}</p></div><span className="badge badge-success">{amount} 金币</span></li>)}</ul></>;
}

function CoinSettingsPage() {
  return <><PageHeader title="金币设置" description="控制金币提醒与默认展示，不改变经济规则。" /><Panel title="提醒与确认"><SettingsForm message="金币设置已保存"><div className="space-y-5"><label className="flex min-h-11 items-center justify-between gap-4"><span><strong>感谢前再次确认</strong><small className="block opacity-65">显示成本、接收金额和销毁金额。</small></span><input className="toggle" type="checkbox" defaultChecked /></label><label className="flex min-h-11 items-center justify-between gap-4"><span><strong>悬赏到期提醒</strong><small className="block opacity-65">只提醒仍需你处理的开放悬赏。</small></span><input className="toggle" type="checkbox" defaultChecked /></label><label className="flex min-h-11 items-center justify-between gap-4"><span><strong>在个人主页展示余额</strong><small className="block opacity-65">余额默认私密，公开透明度只展示聚合数据。</small></span><input className="toggle" type="checkbox" /></label></div></SettingsForm></Panel></>;
}

function CoinModerationPage({ id }: { id?: string }) {
  if (id) return <><Breadcrumbs items={[{ label: "金币风险队列", href: "/moderation/coins" }, { label: id }]} /><div className="mt-4"><PageHeader title={`风险案例 ${id}`} description="异常互评候选 · 等待双人复核" /></div><Notice kind="warning"><p>系统只提供证据与建议，不会自动扣除金币或处罚账号。</p></Notice><Panel className="mt-5" title="证据摘要"><DataTable headers={["信号", "观察值", "基线"]} rows={[["互评密度", "7 次 / 24h", "≤ 2"], ["设备关联", "无", "—"], ["内容相似度", "0.82", "0.31"]]} /><div className="mt-5 flex justify-end gap-2"><ActionButton message="释放建议已提交独立审批">建议释放</ActionButton><ActionButton className="btn btn-primary" message="追回建议已提交独立审批">建议追回</ActionButton></div></Panel></>;
  return <><PageHeader title="金币风险队列" description="只处理金币分录风险；内容治理与账号治理保持独立。" /><DataTable headers={["案例", "信号", "金额", "状态"]} rows={[[<Link className="link" href="/moderation/coins/cases/COIN-2026-014" key="case">COIN-2026-014</Link>, "异常互评", "18", "等待复核"], ["COIN-2026-011", "悬赏串谋", "50", "证据补充中"]]} /></>;
}

function ControlPage() {
  return <><PageHeader title="金币规则控制台" description="所有规则变更都需要独立审批并形成新版本。" /><Notice kind="warning"><p>不能修改历史分录；新版本只影响生效时间之后的事件。</p></Notice><Panel className="mt-5" title="拟议规则版本 2026.08"><div className="grid gap-4 sm:grid-cols-2"><label className="form-control"><span className="label-text mb-2">每周奖励上限</span><input className="input w-full" type="number" defaultValue="60" /></label><label className="form-control"><span className="label-text mb-2">待确认观察期（天）</span><input className="input w-full" type="number" defaultValue="3" /></label></div><div className="mt-5 flex justify-end"><ActionButton className="btn btn-primary" message="规则变更已提交独立审批">提交审批</ActionButton></div></Panel></>;
}

function ReconciliationPage() {
  return <><PageHeader title="金币关账与对账" description="核对子账本平衡、供应量和异常冲正。" /><StatGrid items={[{ title: "借方", value: "128,820" }, { title: "贷方", value: "128,820" }, { title: "差额", value: "0" }, { title: "待审调整", value: "2" }]} /><Panel className="mt-5" title="2026-07 关账检查" footer={<div className="flex justify-end"><ActionButton className="btn btn-primary" message="关账包已提交审批">提交关账包</ActionButton></div>}><DataTable headers={["检查项", "结果", "说明"]} rows={[["双重记账平衡", "通过", "差额 0"], ["供应量连续性", "通过", "期末 126,510"], ["异常调整", "待审批", "2 笔"]]} /></Panel></>;
}

function AdjustmentPage({ id }: { id: string }) {
  return <><Breadcrumbs items={[{ label: "金币关账", href: "/admin/coins/reconciliation" }, { label: id }]} /><div className="mt-4"><PageHeader title={`分录调整 ${id}`} description="通过新增反向分录纠错，不覆盖原始历史。" /></div><Notice kind="warning"><p>发起人不能独自批准此调整。</p></Notice><Panel className="mt-5" title="拟议双重分录"><DataTable headers={["方向", "科目", "金额"]} rows={[["借", "USER_AVAILABLE:U-1042", "10"], ["贷", "SYSTEM_RECOVERY:INC-2026-0711", "10"]]} /><div className="mt-5 flex justify-end gap-2"><ActionButton message="调整单已退回补充">退回补充</ActionButton><ActionButton className="btn btn-primary" message="调整已执行并写入不可变分录">批准并执行</ActionButton></div></Panel></>;
}

export function CoinRouteContent({ path }: { path: string }) {
  if (path === "/coins") return <WalletPage />;
  if (path === "/coins/ledger") return <LedgerPage />;
  if (path === "/coins/rules") return <><CoinTabs path={path} /><CoinRulesContent /></>;
  if (path === "/coins/economy") return <><CoinTabs path={path} /><CoinEconomyContent /></>;
  if (path === "/coins/bounties") return <BountiesPage />;
  if (path.startsWith("/coins/bounties/")) return <BountiesPage id={path.split("/")[3]} />;
  if (path === "/settings/coins") return <CoinSettingsPage />;
  if (path === "/moderation/coins") return <CoinModerationPage />;
  if (path.startsWith("/moderation/coins/cases/")) return <CoinModerationPage id={path.split("/")[4]} />;
  if (path === "/admin/coins/control") return <ControlPage />;
  if (path === "/admin/coins/reconciliation") return <ReconciliationPage />;
  if (path.startsWith("/admin/coins/adjustments/")) return <AdjustmentPage id={path.split("/")[4]} />;
  return null;
}
