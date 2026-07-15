import Link from "next/link";
import { nodes } from "@/lib/mock-data";
import { Avatar } from "./shared/avatar";
import { Notice, Panel, ProgressBar } from "./shared/ui";

export function AccountRail() {
  return <><Panel title="我的 X2Post" footer={<div className="flex flex-wrap gap-x-4 gap-y-2 text-sm"><Link className="link" href="/me">主页</Link><Link className="link" href="/notifications">通知</Link><Link className="link" href="/drafts">草稿</Link></div>}><div className="flex items-center gap-3"><Avatar name="林默" image="user-linmo" sizeClass="size-12" /><div><Link className="font-bold hover:underline" href="/me">林默</Link><p className="text-sm opacity-65">产品设计 · 上海</p></div></div><dl className="mt-4 grid grid-cols-3 gap-2 text-center"><div><dt className="text-xs opacity-60">未读</dt><dd className="font-bold">6</dd></div><div><dt className="text-xs opacity-60">草稿</dt><dd className="font-bold">3</dd></div><div><dt className="text-xs opacity-60">关注</dt><dd className="font-bold">48</dd></div></dl></Panel><Panel className="mt-4" title="社区安全"><p className="text-sm leading-relaxed opacity-75">不舒服的互动可以举报或屏蔽。每个举报都会留下进度记录。</p><Link className="link mt-3 inline-block text-sm" href="/reports">查看我的举报</Link></Panel></>;
}

export function ComposeRail() {
  return <><Panel title="发布须知"><Notice kind="warning"><p>轻内容和长帖发布后都不能编辑、删除或撤回。发布前请完成确认。</p></Notice></Panel><Panel className="mt-4" title="AI 辅助边界"><p className="text-sm leading-relaxed opacity-75">AI 只能整理你已经写下的原意，不补充事实、不代替判断、不自动发布。</p></Panel></>;
}

export function CoinRail() {
  return <><Panel title="经济边界" footer={<div className="flex flex-wrap gap-4 text-sm"><Link className="link" href="/coins/rules">完整规则</Link><Link className="link" href="/settings/coins">金币设置</Link><Link className="link" href="/coins/economy">经济透明度</Link></div>}><p className="text-sm leading-relaxed opacity-75">金币不可购买、提现或兑换法币，也不赋予治理票权。</p></Panel><Panel className="mt-4" title="本周状态"><ProgressBar value={42} max={60} label="个人系统奖励额度" /></Panel></>;
}

export function JourneyRail() {
  return <><Panel title="健康参与" footer={<Link className="link text-sm" href="/settings/journey">旅程与休息设置</Link>}><p className="text-sm leading-relaxed opacity-75">每周最多激活 3 个任务。离线不会扣除进度。</p></Panel><Panel className="mt-4" title="本周旅程"><ProgressBar value={4} max={7} label="完成节点" /></Panel></>;
}

export function NodeRail() {
  return <Panel title="节点规则" footer={<Link className="link text-sm" href="/nodes">查看全部节点</Link>}><p className="leading-relaxed">一级节点定义长期边界，子节点补充具体主题规则。发布前请确认父级与子级规则。</p><p className="mt-3 text-sm opacity-65">当前共有 {nodes.length} 个一级节点。</p></Panel>;
}
