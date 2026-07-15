import Link from "next/link";
import { ActionButton } from "../client/action-button";
import { SettingsForm } from "../client/settings-form";
import { Breadcrumbs, DataTable, Notice, PageHeader, PageTabs, Panel, ProgressBar, StatGrid } from "../shared/ui";

const tabs = [["wallet", "我的金币", "/coins"], ["ledger", "透明账本", "/coins/ledger"], ["bounties", "问题悬赏", "/coins/bounties"], ["rules", "经济规则", "/coins/rules"]] as const;
const ledger = [
  ["今天 14:20", "TX-88421", "内容质量奖励", "可信确认达到 8 人", "+6", "待结算"],
  ["今天 11:42", "TX-88406", "金币感谢", "感谢帖子《不可变边界》", "-2", "已入账"],
  ["昨天 18:30", "TX-88271", "收到感谢", "帖子获得用户感谢", "+1", "已入账"],
  ["7 月 10 日", "TX-87720", "悬赏托管", "BT-2041", "-50", "托管中"],
  ["7 月 8 日", "TX-87114", "社区照护津贴", "节点照护批次已质检", "+20", "已入账"],
] as const;

function CoinTabs({ active }: { active: string }) {
  return <PageTabs items={tabs.map(([key, label, href]) => ({ label, href, active: active === key }))} label="金币页面" />;
}

export function CoinWalletPage() {
  const sources = [["内容质量阶梯", "不同可信账户确认达到 3 / 8 / 20 人", "+4 / +6 / +10", "单内容累计最多 20；72 小时待结算"], ["社区照护津贴", "被授权的节点照护批次经另一角色质检", "+20", "每周最多 40；不按处置数量计酬"], ["感谢与悬赏收入", "来自其他用户已有金币，不增加总发行量", "+1 或 80%", "感谢作者得 1；悬赏采纳按 80/20 结算"]];
  return <><PageHeader title="金币中心" description="用可审计的社区金币确认真实贡献，而不是购买影响力。" action={<Link className="btn" href="/coins/ledger">查看透明账本</Link>} /><CoinTabs active="wallet" /><Notice><p>金币不可付费购买、不可提现、不可自由转账，也不能换取治理票权或内容曝光。</p></Notice><div className="mt-5"><StatGrid items={[{ title: "可用", value: 286, description: "可感谢、悬赏或兑换纯装饰" }, { title: "待结算", value: 10, description: "72 小时质量观察期" }, { title: "托管", value: 50, description: "开放悬赏中" }, { title: "风控保留", value: 5, description: "预计 72 小时内复核" }]} /></div><Panel className="mt-5" title="本周个人系统奖励"><ProgressBar value={42} max={60} label="已使用额度" /><p className="mt-3 text-sm opacity-65">额度限制系统新增发行，不限制你继续帮助社区。预算用尽后不会透支或暗示继续刷行为。</p></Panel><Panel className="mt-5" title="金币来源"><ul className="list x2-list -m-5">{sources.map(([title, description, amount, boundary]) => <li className="list-row rounded-none" key={title}><div className="list-col-grow"><p className="font-bold">{title}</p><p className="mt-1 text-sm opacity-65">{description}</p><p className="mt-2 text-xs opacity-55">{boundary}</p></div><span className="badge badge-success">{amount}</span></li>)}</ul></Panel><Panel className="mt-5" title="最近变动" action={<Link className="link text-sm" href="/coins/ledger">全部记录</Link>}><ul className="list x2-list -m-5">{ledger.slice(0, 4).map((item) => <LedgerListItem item={item} key={item[1]} />)}</ul></Panel></>;
}

function LedgerListItem({ item }: { item: (typeof ledger)[number] }) {
  return <li className="list-row rounded-none"><div className="list-col-grow"><p className="font-bold">{item[2]}</p><p className="mt-1 text-sm opacity-65">{item[3]}</p><p className="mt-2 text-xs opacity-55">{item[0]} · {item[1]}</p></div><div className="text-right"><p className={`font-bold ${item[4].startsWith("+") ? "text-success" : ""}`}>{item[4]}</p><span className={`badge ${item[5] === "待结算" ? "badge-warning" : "badge-outline"}`}>{item[5]}</span></div></li>;
}

export function CoinLedgerPage() {
  return <><PageHeader title="透明账本" description="每一枚金币都能追溯到来源、去向和结算状态。" /><CoinTabs active="ledger" /><Panel title="筛选记录"><div className="grid gap-3 sm:grid-cols-3"><select className="select w-full"><option>全部类型</option><option>获得</option><option>使用</option><option>保留/冲正</option></select><select className="select w-full"><option>全部状态</option><option>已入账</option><option>待结算</option><option>已冲正</option></select><input className="input w-full" type="search" placeholder="搜索流水号" /></div></Panel><div className="mt-5"><DataTable headers={["时间", "流水号", "类型", "说明", "变动", "状态"]} rows={ledger.map((item) => [item[0], <span className="font-mono text-xs" key={item[1]}>{item[1]}</span>, item[2], item[3], <strong className={item[4].startsWith("+") ? "text-success" : ""} key="amount">{item[4]}</strong>, <span className={`badge ${item[5] === "待结算" ? "badge-warning" : "badge-outline"}`} key="status">{item[5]}</span>])} /></div><div className="mt-5"><Notice><p>账本只显示本人可见明细；公共经济面板只公开汇总，不暴露个人贡献或风控信息。</p></Notice></div></>;
}

const bounties = [["BT-2041", "如何验证一条无障碍建议来自一手标准？", "前端开发", "50", "等待回答", "剩余 11 天"], ["BT-1998", "小型社区如何定义有效首响？", "社区运营", "20", "已有 3 个回答", "24 小时后可采纳"], ["BT-1872", "发帖前确认如何减少不可逆误操作？", "产品设计", "100", "已结算", "答主 80 · 销毁 20"]] as const;

export function CoinBountiesPage() {
  return <><PageHeader title="问题悬赏" description="用已有金币为真实问题设置固定档位悬赏。" action={<ActionButton className="btn btn-primary" dialogTitle="创建悬赏" dialogBody={<div><p>金币进入托管；发布满 24 小时后可采纳，答主获得 80%，20% 销毁。</p><div className="join mt-4"><button className="btn join-item">20</button><button className="btn join-item">50</button><button className="btn join-item">100</button></div></div>}>创建悬赏</ActionButton>} /><CoinTabs active="bounties" /><Notice><p>悬赏只能选择 20 / 50 / 100；发布 24 小时后才能采纳，采纳时答主获得 80%，20% 销毁。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{bounties.map(([id, title, node, amount, status, expires]) => <li className="list-row rounded-none" key={id}><div className="list-col-grow"><div className="flex gap-2"><span className="badge badge-outline">{node}</span><span className={`badge ${status === "已结算" ? "badge-success" : "badge-warning"}`}>{status}</span></div><Link className="mt-2 block font-bold hover:underline" href={`/coins/bounties/${id}`}>{title}</Link><p className="mt-2 text-sm opacity-65">{id} · {expires}</p></div><div className="text-right"><p className="text-xl font-black">{amount}</p><p className="text-xs opacity-60">托管金币</p></div></li>)}</ul></>;
}

export function CoinBountyDetail({ id }: { id: string }) {
  return <><Breadcrumbs items={[{ label: "问题悬赏", href: "/coins/bounties" }, { label: id }]} /><div className="mt-3"><PageHeader title={`悬赏 ${id}`} description="开放中 · 50 金币托管 · 11 天后到期" /></div><Panel title="关联问题"><Link className="text-lg font-bold hover:underline" href="/posts/accessible-ui">如何验证一条无障碍建议来自一手标准？</Link><p className="mt-2 opacity-65">前端开发 · 发布 3 天 · 5 个公开回答</p></Panel><Panel className="mt-5" title="资金与时间线"><StatGrid items={[{ title: "托管", value: 50, description: "来自发布者可用余额" }, { title: "采纳给答主", value: 40, description: "80%" }, { title: "系统销毁", value: 10, description: "20%" }]} /><ol className="mt-5 space-y-4"><li><p className="font-bold">✓ 悬赏创建</p><p className="text-sm opacity-65">7 月 10 日 · journal J-77120</p></li><li><p className="font-bold">✓ 最早采纳时间已到</p><p className="text-sm opacity-65">7 月 11 日 · 已满足 24 小时</p></li><li><p className="font-bold">◇ 等待采纳或到期</p><p className="text-sm opacity-65">最晚 7 月 24 日自动处理</p></li></ol><div className="mt-5 flex justify-end gap-2"><ActionButton message="已打开金币交易申诉流程">申请复核</ActionButton><ActionButton className="btn btn-primary" dialogTitle="采纳这个回答？" dialogBody={<p>50 托管金币将结算：答主获得 40，系统销毁 10。采纳后不能自行撤销。</p>}>采纳回答</ActionButton></div></Panel></>;
}

export function CoinRulesPage() {
  const sources = [["邮箱验证启动金", "30", "终身一次", "基础风控通过后发放"], ["内容质量阶梯", "4 / 6 / 10", "单内容累计 20", "3 / 8 / 20 个可信账户确认"], ["社区照护津贴", "20 / 批", "40 / 周", "另一角色质检，不按处置数量"], ["感谢与悬赏", "1 或 80%", "非系统发行", "来自其他用户已有余额"]];
  const sinks = [["金币感谢", "固定成本 2", "作者获得 1，系统销毁 1"], ["问题悬赏", "20 / 50 / 100", "采纳答主 80%，系统销毁 20%"], ["纯装饰兑换", "固定目录价", "100% 销毁；无功能优势、不可转售"], ["风控冲正", "按原额", "等额反向分录，不改写历史"]];
  return <><PageHeader title="金币经济规则" description="发行有预算、流通有摩擦、沉淀有去向、异常可冲正。" /><CoinTabs active="rules" /><Notice kind="warning"><p>金币是站内不可兑换的社区记账单位，不构成资产、存款、证券、工资或任何兑付承诺。</p></Notice><Panel className="mt-5" title="发行来源"><DataTable headers={["来源", "建议值", "个人上限", "验证方式"]} rows={sources} /></Panel><Panel className="mt-5" title="使用与沉淀"><DataTable headers={["用途", "范围", "经济处理"]} rows={sinks} /></Panel><Panel className="mt-5" title="四道经济控制" footer={<p className="text-sm opacity-65">稳定期目标是 28 日净增长率保持在 0–2%；连续两期超过 2% 时先下调发行预算，不通过提高价格掩盖问题。</p>}><ul className="steps steps-vertical w-full sm:steps-horizontal"><li className="step step-primary" data-content="1">周预算封顶</li><li className="step step-primary" data-content="2">72 小时待结算</li><li className="step step-primary" data-content="3">串谋检测</li><li className="step step-primary" data-content="4">月度再平衡</li></ul></Panel></>;
}

export function CoinEconomyPage() {
  return <><PageHeader title="金币经济透明度" description="仅公开汇总供给和系统健康，不公开个人余额与风控阈值。" /><StatGrid items={[{ title: "28 日流通量", value: "184,260", description: "期初 182,040" }, { title: "系统发行", value: "8,420", description: "含合格启动金" }, { title: "销毁", value: "6,200", description: "感谢与悬赏" }, { title: "净增长率", value: "1.22%", description: "目标 0–2%" }]} /><Panel className="mt-5" title="28 日变动"><DataTable headers={["项目", "本期", "上期", "控制线"]} rows={[["验证活跃钱包", "5,218", "5,064", "—"], ["发行 / 销毁", "1.36", "1.28", "≤ 1.50"], ["Top 1% 持有", "18.4%", "18.1%", "< 25%"], ["借贷差异", "0", "0", "必须为 0"]]} /></Panel><div className="mt-5"><Notice><p>规则版本 v1.0.0 · 生效于 2026-07-01。任何数值调整至少提前 7 日公示。</p></Notice></div></>;
}

export function CoinSettingsPage() {
  return <><PageHeader title="金币设置" description="管理通知、公开贡献记录和高风险操作保护。" /><Panel title="偏好"><SettingsForm message="金币设置已保存"><div className="space-y-5"><Toggle title="奖励与结算通知" description="待结算、入账、冲正和预算状态" checked /><Toggle title="公开贡献记录" description="只展示贡献类型，不显示余额和财富排名" /><Toggle title="金币消费二次验证" description="悬赏和高风险设备始终需要确认" checked /></div></SettingsForm></Panel></>;
}

function Toggle({ title, description, checked = false }: { title: string; description: string; checked?: boolean }) {
  return <label className="flex min-h-11 items-center justify-between gap-4"><span><strong>{title}</strong><small className="block opacity-65">{description}</small></span><input className="toggle" type="checkbox" defaultChecked={checked} /></label>;
}

export function CoinModerationPage() {
  return <><PageHeader title="金币风险案件" description="治理人员只能调查并提出建议，不能直接修改余额。" /><Notice kind="warning"><p>释放、追回或人工调整必须交由独立审批人执行；历史分录不可编辑或删除。</p></Notice><div className="mt-5"><DataTable headers={["案件", "类型", "涉及金额", "SLA", "状态"]} rows={[[<Link className="link" href="/moderation/coins/cases/CC-041" key="41">CC-041</Link>, "环形互赠", "84", "剩余 18 小时", <span className="badge badge-warning" key="s">调查中</span>], [<Link className="link" href="/moderation/coins/cases/CC-039" key="39">CC-039</Link>, "悬赏强关联", "100", "剩余 31 小时", <span className="badge badge-outline" key="s">待分派</span>], [<Link className="link" href="/moderation/coins/cases/CC-035" key="35">CC-035</Link>, "账户接管", "50", "已完成", <span className="badge badge-success" key="s">已释放</span>]]} /></div></>;
}

export function CoinModerationDetail({ id }: { id: string }) {
  return <><Breadcrumbs items={[{ label: "金币风险案件", href: "/moderation/coins" }, { label: id }]} /><div className="mt-3"><PageHeader title={`案件 ${id}`} description="环形互赠 · 84 金币已转风控保留" /></div><Panel title="证据摘要"><ul className="list-disc space-y-2 pl-5"><li>4 个账户在 18 分钟内形成闭环感谢。</li><li>相关内容的公开语义相似度异常高。</li><li>设备与网络风险存在强关联；具体阈值不对用户公开。</li></ul></Panel><Panel className="mt-5" title="相关分录"><DataTable headers={["journal", "时间", "借方", "贷方", "金额"]} rows={[["J-8842", "14:06", "USER_HELD:A", "USER_AVAILABLE:A", "24"], ["J-8843", "14:07", "USER_HELD:B", "USER_AVAILABLE:B", "20"], ["J-8844", "14:08", "USER_HELD:C", "USER_AVAILABLE:C", "40"]]} /><div className="mt-5 flex justify-end gap-2"><ActionButton message="释放建议已提交独立审批">建议释放</ActionButton><ActionButton className="btn btn-primary" message="追回建议已提交独立审批">建议追回</ActionButton></div></Panel></>;
}

export function CoinControlPage() {
  return <><PageHeader title="金币控制台" description="Controller 管理预算与规则版本；任何变更都需要独立审批。" /><StatGrid items={[{ title: "本期系统预算", value: "62,000", description: "已使用 71%" }, { title: "待结算", value: "8,420", description: "72 小时观察期" }, { title: "人工调整", value: "0.04%", description: "控制线 < 0.10%" }, { title: "规则版本", value: "v1.0.0", description: "下次复核 7 月 31 日" }]} /><Panel className="mt-5" title="变更申请"><select className="select w-full"><option>预算上限</option><option>奖励参数</option><option>沉淀参数</option><option>紧急停止</option></select><textarea className="textarea mt-4 min-h-32 w-full" placeholder="说明旧值、新值、供给预测和停止条件" /><div className="mt-5 flex justify-end"><ActionButton className="btn btn-primary" message="规则变更已提交独立审批">提交独立审批</ActionButton></div></Panel><Panel className="mt-5" title="待审批人工调整"><Link className="font-bold hover:underline" href="/admin/coins/adjustments/ADJ-1042">ADJ-1042 · 平台事故补偿</Link><p className="mt-1 text-sm opacity-65">10 金币 · 发起人 Controller D-04</p><span className="badge badge-warning mt-3">等待独立审批</span></Panel></>;
}

export function CoinReconciliationPage() {
  return <><PageHeader title="金币对账与关账" description="每日三方核对钱包快照、业务对象和不可变子账。" /><Notice kind="warning"><p>发现非零借贷差或负可用余额时，立即停止金币写入；核心社区功能继续可用。</p></Notice><div className="mt-5"><DataTable headers={["核对项目", "账面", "支持明细", "差异", "状态"]} rows={[["用户四类余额", "184,260", "184,260", "0", <span className="badge badge-success" key="s">已核对</span>], ["累计发行 - 销毁", "184,260", "184,260", "0", <span className="badge badge-success" key="s">已核对</span>], ["开放悬赏托管", "12,840", "12,840", "0", <span className="badge badge-success" key="s">已核对</span>], ["风控保留", "1,142", "1,142", "0", <span className="badge badge-warning" key="s">待复核</span>]]} /></div><Panel className="mt-5" title="7 月关账"><ul className="steps steps-vertical w-full sm:steps-horizontal"><li className="step step-primary">冻结快照</li><li className="step step-primary">调节完成</li><li className="step step-primary">Controller 复核</li><li className="step">独立批准</li></ul><div className="mt-5 flex justify-end"><ActionButton className="btn btn-primary" message="关账包已提交审批">提交关账审批</ActionButton></div></Panel></>;
}

export function CoinAdjustmentPage({ id }: { id: string }) {
  return <><Breadcrumbs items={[{ label: "金币控制台", href: "/admin/coins/control" }, { label: `调整单 ${id}` }]} /><div className="mt-3"><PageHeader title={`人工调整 ${id}`} description="平台事故补偿 · 等待独立审批" /></div><Panel title="调整依据"><dl className="grid gap-3 sm:grid-cols-2">{[["关联事故", "INC-2026-0711"], ["影响期", "2026-07"], ["发起人", "Controller D-04"], ["审批人", "待指派（不可同人）"]].map(([label, value]) => <div key={label}><dt className="opacity-60">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl></Panel><Panel className="mt-5" title="拟议双重分录"><DataTable headers={["方向", "科目", "金额"]} rows={[["借", "USER_AVAILABLE:U-1042", "10"], ["贷", "SYSTEM_RECOVERY:INC-2026-0711", "10"]]} /><div className="mt-5 flex justify-end gap-2"><ActionButton message="调整单已退回补充">退回补充</ActionButton><ActionButton className="btn btn-primary" message="调整已执行并写入不可变分录">批准并执行</ActionButton></div></Panel></>;
}
