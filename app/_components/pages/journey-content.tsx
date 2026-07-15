import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "../client/action-button";
import { SettingsForm } from "../client/settings-form";
import { Breadcrumbs, Notice, PageHeader, PageTabs, Panel, ProgressBar, StatGrid } from "../shared/ui";

const quests = [
  { id: "first-reply", node: "产品设计", title: "给新人的第一条有效回应", description: "从 3 个尚未得到回复的新主题中选择一个，提供具体、友善且有信息量的回应。", reward: "贡献进度 +1", progress: 1, max: 3, time: "约 8 分钟", status: "进行中" },
  { id: "source-trail", node: "前端开发", title: "补全无障碍资料路径", description: "为讨论补充一手标准或官方文档，并说明它解决了什么问题。", reward: "贡献进度 +1", progress: 0, max: 2, time: "约 12 分钟", status: "可开始" },
  { id: "thread-garden", node: "社区运营", title: "整理一段分散讨论", description: "将已有观点归纳成共识、分歧和待验证问题，不改写任何原始内容。", reward: "贡献进度 +1", progress: 2, max: 4, time: "约 15 分钟", status: "进行中" },
];

function JourneyTabs({ active }: { active: "hub" | "quests" | "journey" | "teams" }) {
  return <PageTabs items={[{ label: "旅程首页", href: "/journey", active: active === "hub" }, { label: "任务板", href: "/quests", active: active === "quests" }, { label: "成长路径", href: "/me/progress", active: active === "journey" }, { label: "节点协作", href: "/play/teams", active: active === "teams" }]} label="社区旅程" />;
}

function QuestList({ limit }: { limit?: number }) {
  return <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{quests.slice(0, limit ?? quests.length).map((quest) => <li className="list-row rounded-none" key={quest.id}><div className="list-col-grow min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="badge badge-outline">{quest.node}</span><span className="text-xs opacity-60">{quest.time}</span></div><Link className="mt-2 block font-bold hover:underline" href={`/quests/${quest.id}`}>{quest.title}</Link><p className="mt-1 text-sm opacity-65">{quest.description}</p><div className="mt-3"><ProgressBar value={quest.progress} max={quest.max} label="当前进度" /></div></div><div className="text-right"><span className="badge badge-success">{quest.reward}</span><p className="mt-2 text-xs opacity-60">{quest.status}</p></div></li>)}</ul>;
}

export function JourneyHubPage() {
  return <><PageHeader title="社区旅程" description="把阅读、回应和整理变成有边界的社区协作旅程。" action={<Link className="btn btn-primary" href="/quests/first-reply">继续当前任务</Link>} /><JourneyTabs active="hub" /><Notice kind="info"><p>游戏奖励贡献质量，不奖励发帖数量或在线时长；每周最多激活 3 个任务，离线不会损失进度。</p></Notice><div className="mt-5"><StatGrid items={[{ title: "本周共建", value: "4 / 7", description: "覆盖 3 个节点" }, { title: "确认 CXP", value: 68, description: "另有 12 待确认" }, { title: "贡献角色", value: "回应者", description: "下一级：整理者" }]} /></div><Panel className="mt-5" title="当前旅程" footer={<p className="text-sm opacity-65">每一步都对应真实社区对象；任务完成不会自动发布任何内容。</p>}><ul className="steps steps-vertical w-full sm:steps-horizontal"><li className="step step-primary">发现问题</li><li className="step step-primary">提供回应</li><li className="step">获得确认</li><li className="step">沉淀成果</li></ul></Panel><Panel className="mt-5" title="推荐任务" action={<Link className="link text-sm" href="/quests">完整任务板</Link>}><div className="-m-5"><QuestList limit={2} /></div></Panel></>;
}

export function QuestsPageContent() {
  return <><PageHeader title="共建任务板" description="选择能真正帮助某个节点的任务，而不是追求任务数量。" /><JourneyTabs active="quests" /><Panel title="筛选任务"><div className="grid gap-3 sm:grid-cols-3"><select className="select w-full"><option>全部节点</option><option>产品设计</option><option>前端开发</option></select><select className="select w-full"><option>全部类型</option><option>回应</option><option>资料</option><option>整理</option></select><select className="select w-full"><option>适合我</option><option>用时最短</option><option>即将结束</option></select></div></Panel><div className="mt-5"><QuestList /></div></>;
}

export function QuestDetailPage({ id }: { id: string }) {
  const quest = quests.find((item) => item.id === id);
  if (!quest) notFound();
  return <><Breadcrumbs items={[{ label: "社区旅程", href: "/journey" }, { label: "任务板", href: "/quests" }, { label: quest.title }]} /><div className="mt-4"><PageHeader title={quest.title} description={`${quest.node} · ${quest.time} · 完成后 ${quest.reward}`} /></div><Panel title="为什么做"><p className="leading-relaxed">{quest.description}</p><div className="mt-4"><Notice kind="warning"><p>只提交你愿意公开保留的内容。评论提交后不能编辑或删除。</p></Notice></div></Panel><Panel className="mt-5" title="验收路径"><ul className="steps steps-vertical w-full sm:steps-horizontal"><li className="step step-primary">阅读节点规则</li><li className="step step-primary">选择真实主题</li><li className="step">提交贡献</li><li className="step">质量确认</li></ul></Panel><Panel className="mt-5" title="任务清单" footer={<div className="flex justify-end gap-2"><Link className="btn" href="/quests">暂时退出</Link><ActionButton className="btn btn-primary" dialogTitle="开始共建任务" dialogBody={<div><p>任务会保存来源和进度，但不会自动发布任何内容。</p><Link className="btn btn-primary mt-4" href="/posts/immutable-content">进入真实主题</Link></div>}>{quest.progress ? "继续任务" : "开始任务"}</ActionButton></div>}><div className="space-y-3"><label className="label justify-start gap-3"><input className="checkbox" type="checkbox" defaultChecked /><span>已阅读 {quest.node} 节点规则</span></label><label className="label justify-start gap-3"><input className="checkbox" type="checkbox" /><span>选择一个仍需要帮助的真实主题</span></label><label className="label justify-start gap-3"><input className="checkbox" type="checkbox" /><span>完成贡献并主动提交验收</span></label></div></Panel></>;
}

export function JourneyProgressPage() {
  const stages = [["发现者", "理解节点与标签，完成 3 次有目的的阅读", true], ["回应者", "完成 5 次被确认的有效回应", true], ["整理者", "归纳 2 段分散讨论；当前 1 / 2", false], ["守望者", "协助发现风险并给出规则引导", false]] as const;
  return <><PageHeader title="成长路径" description="记录你如何帮助社区，而不是制造等级压力。" /><JourneyTabs active="journey" /><Panel title="贡献路径"><ol className="timeline timeline-vertical timeline-compact">{stages.map(([title, description, done]) => <li key={title}><div className="timeline-middle">{done ? "✓" : "◇"}</div><div className="timeline-end mb-6"><p className="font-bold">{title}</p><p className="text-sm opacity-65">{description}</p></div><hr className="bg-base-content/20" /></li>)}</ol></Panel><Panel className="mt-5" title="本周共建记录"><p className="leading-relaxed">你在 3 个不同节点完成了 4 次真实贡献，其中 3 次帮助讨论获得后续回应。周记录只展示贡献类型与社区影响。</p></Panel></>;
}

export function JourneyTeamsPage() {
  const teams = [["产品设计", "新人问题首响小队", "6 / 8 人", "本周帮助 12 个无人回应的新主题", 7, 12], ["前端开发", "无障碍资料整理局", "8 / 10 人", "完成公开资料索引第一版", 16, 24], ["社区运营", "案例归档协作局", "4 / 6 人", "整理 5 个真实冷启动案例", 3, 5]] as const;
  return <><PageHeader title="节点协作" description="小队围绕公开成果协作，不建立私聊、权力等级或无限排行。" /><JourneyTabs active="teams" /><Notice kind="info"><p>协作任务、验收规则和进度全部公开；成员可随时退出，不会失去已完成的个人贡献记录。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{teams.map(([node, title, members, goal, value, max], index) => <li className="list-row rounded-none" key={title}><div className="list-col-grow"><div className="flex gap-2"><span className="badge badge-outline">{node}</span><span className="text-xs opacity-60">{members}</span></div><p className="mt-2 font-bold">{title}</p><p className="mt-1 text-sm opacity-65">{goal}</p><div className="mt-3"><ProgressBar value={value} max={max} label="团队进度" /></div></div><ActionButton className="btn btn-sm" message={index ? "已提交加入申请" : "你已在这个节点协作局中"}>{index ? "申请加入" : "已加入"}</ActionButton></li>)}</ul></>;
}

export function JourneyOnboardingPage() {
  const options = [["回应具体问题", "帮助尚未得到有效首响的真实主题"], ["整理公开资料", "将分散讨论沉淀成可复用索引"], ["照护讨论秩序", "提醒规则、报告风险，不以处置数量计酬"], ["每周轻量参与", "最多 3 个激活任务，不设连续签到"]];
  return <><PageHeader title="开启社区旅程" description="先选择愿意帮助的方式，再由你决定何时开始。" /><Notice kind="info"><p>旅程完全可选。跳过、暂停或休息都不会影响核心社区功能。</p></Notice><Panel className="mt-5" title="选择贡献偏好"><div className="grid gap-3 sm:grid-cols-2">{options.map(([title, description], index) => <label className="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4" key={title}><input className="checkbox checkbox-primary mt-1" type="checkbox" defaultChecked={index === 0 || index === 3} /><span><strong>{title}</strong><small className="mt-1 block opacity-65">{description}</small></span></label>)}</div><div className="mt-5 flex justify-end gap-2"><Link className="btn" href="/">暂时跳过</Link><ActionButton className="btn btn-primary" message="旅程偏好已保存" href="/quests">保存并查看任务</ActionButton></div></Panel></>;
}

export function JourneyContributionsPage() {
  return <><PageHeader title="我的贡献" description="从真实社区对象回看你产生的影响，不展示财富或名次。" /><StatGrid items={[{ title: "已确认贡献", value: 18, description: "永久记录" }, { title: "覆盖节点", value: 4, description: "最近 90 天" }, { title: "待质量确认", value: 2, description: "不计入已确认 CXP" }]} /><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{[["有效首响", "前端开发", "帮助提问者补齐复现条件", "质量已确认", "7 月 12 日"], ["讨论整理", "产品设计", "把 9 条评论归纳为 3 个决策点", "待确认", "7 月 11 日"], ["规则引导", "社区运营", "为新成员指出节点边界", "质量已确认", "7 月 9 日"]].map(([type, node, impact, status, date]) => <li className="list-row rounded-none" key={impact}><div className="list-col-grow"><div className="flex gap-2"><span className="badge badge-outline">{type}</span><span className="badge badge-info">{node}</span></div><p className="mt-2 font-bold">{impact}</p><p className="mt-1 text-sm opacity-60">{date} · {status}</p></div><Link className="btn btn-sm" href="/posts/immutable-content">查看来源</Link></li>)}</ul></>;
}

export function JourneyCollectionPage() {
  const rows = [["回应者 · 路径印记", "完成 5 次经质量确认的有效回应", "2026-06-18"], ["开放资料索引 · 共建纪念", "参与前端开发节点公开资料第一期", "2026-07-01"], ["友善首响 · 展示徽记", "由被帮助者确认 3 次有效首响", "2026-07-08"]];
  return <><PageHeader title="贡献收藏" description="收藏是个人历程的纪念，不提供功能优势，也不能交易。" /><Notice kind="info"><p>所有收藏均可隐藏；隐藏不会撤销贡献记录，展示也不会影响内容排序或治理权。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{rows.map(([name, description, date]) => <li className="list-row rounded-none" key={name}><div className="flex size-12 items-center justify-center rounded-full border-2 border-base-content/20">◇</div><div className="list-col-grow"><p className="font-bold">{name}</p><p className="mt-1 text-sm opacity-65">{description}</p><p className="mt-2 text-xs opacity-55">获得于 {date}</p></div><ActionButton className="btn btn-sm" dialogTitle="收藏展示设置" dialogBody={<p>是否展示只影响个人主页外观，不影响功能与排序。</p>}>展示设置</ActionButton></li>)}</ul></>;
}

export function JourneySettingsPage() {
  return <><PageHeader title="旅程与休息设置" description="控制提醒频率、可见性和暂停状态，核心社区功能不受影响。" /><Panel title="健康参与"><SettingsForm message="旅程与休息设置已保存"><div className="space-y-5">{[["每周旅程摘要", "只在有真实进展时发送一次", true], ["任务推荐", "最多保留 3 个激活任务", true], ["公开展示路径印记", "隐藏不影响贡献记录和 CXP", false], ["暂停旅程", "停止任务与旅程通知，不清空任何进度", false]].map(([title, description, checked]) => <label className="flex min-h-11 items-center justify-between gap-4" key={String(title)}><span><strong>{title}</strong><small className="block opacity-65">{description}</small></span><input className="toggle" type="checkbox" defaultChecked={Boolean(checked)} /></label>)}</div></SettingsForm></Panel></>;
}

export function JourneyStatesPage() {
  return <><PageHeader title="旅程状态样例" description="用于验证空、暂停、待确认与完成状态。" /><div className="space-y-5"><Panel title="尚未开启"><p>旅程是可选体验。你可以先正常浏览社区。</p></Panel><Panel title="休息中"><Notice kind="info"><p>旅程已暂停。任务和提醒停止，已有进度完整保留。</p></Notice></Panel><Panel title="等待质量确认"><p>贡献已关联真实评论，正在等待同行确认。</p></Panel><Panel title="本周回顾已生成"><p>你帮助 2 个主题获得了后续回应，并整理了 1 个公开资料条目。</p></Panel></div></>;
}
