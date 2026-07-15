"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nodes } from "@/lib/mock-data";
import { ActionButton } from "./demo-actions";
import { Avatar } from "../shared/avatar";
import { Notice, Panel, ProgressBar } from "../shared/ui";

const navigation = [
  ["首页", "/"],
  ["节点", "/nodes"],
  ["关注", "/following"],
  ["金币", "/coins"],
  ["共建", "/journey"],
  ["搜索", "/search"],
] as const;

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  if (href === "/journey") {
    return path.startsWith("/journey") || path.startsWith("/quests") || path.startsWith("/seasons") || ["/me/progress", "/me/contributions", "/me/collection"].includes(path);
  }
  return path === href || path.startsWith(`${href}/`);
}

export function RouteNavigation({ mobile = false }: { mobile?: boolean }) {
  const path = usePathname();
  const links = navigation.map(([label, href]) => (
    <li key={href}><Link className={isActive(path, href) ? "menu-active" : ""} href={href}>{label}</Link></li>
  ));

  if (!mobile) return <ul className="menu menu-horizontal gap-1 px-1">{links}</ul>;

  return (
    <details className="dropdown lg:hidden">
      <summary className="btn btn-ghost btn-square" aria-label="打开导航">☰</summary>
      <ul className="menu dropdown-content z-30 mt-2 w-64 border-2 border-base-content/20 bg-base-100 p-2">
        <li className="menu-title">浏览 X2Post</li>
        {links}
        <li className="menu-title mt-3">我的</li>
        <li><Link href="/bookmarks">收藏</Link></li>
        <li><Link href="/notifications">通知</Link></li>
        <li><Link href="/settings/profile">设置</Link></li>
      </ul>
    </details>
  );
}

function AccountRail() {
  return (
    <>
      <Panel title="我的 X2Post" footer={<div className="flex flex-wrap gap-x-4 gap-y-2 text-sm"><Link className="link" href="/me">主页</Link><Link className="link" href="/notifications">通知</Link><Link className="link" href="/drafts">草稿</Link></div>}>
        <div className="flex items-center gap-3"><Avatar name="林默" image="user-linmo" sizeClass="size-12" /><div><Link className="font-bold hover:underline" href="/me">林默</Link><p className="text-sm opacity-65">产品设计 · 上海</p></div></div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center"><div><dt className="text-xs opacity-60">未读</dt><dd className="font-bold">6</dd></div><div><dt className="text-xs opacity-60">草稿</dt><dd className="font-bold">3</dd></div><div><dt className="text-xs opacity-60">关注</dt><dd className="font-bold">48</dd></div></dl>
      </Panel>
      <Panel className="mt-4" title="社区安全"><p className="text-sm leading-relaxed opacity-75">不舒服的互动可以举报或屏蔽。每个举报都会留下进度记录。</p><Link className="link mt-3 inline-block text-sm" href="/reports">查看我的举报</Link></Panel>
    </>
  );
}

function RouteSideRail({ path }: { path: string }) {
  if (path === "/quick-compose") return null;
  if (path.startsWith("/compose") || path.startsWith("/drafts")) return <><Panel title="发布须知"><Notice kind="warning"><p>轻内容和长帖发布后都不能编辑、删除或撤回。发布前请完成确认。</p></Notice></Panel><Panel className="mt-4" title="AI 辅助边界"><p className="text-sm leading-relaxed opacity-75">AI 只能整理你已经写下的原意，不补充事实、不代替判断、不自动发布。</p></Panel></>;
  if (path.startsWith("/coins")) return <><Panel title="经济边界" footer={<div className="flex flex-wrap gap-4 text-sm"><Link className="link" href="/coins/rules">完整规则</Link><Link className="link" href="/settings/coins">金币设置</Link><Link className="link" href="/coins/economy">经济透明度</Link></div>}><p className="text-sm leading-relaxed opacity-75">金币不可购买、提现或兑换法币，也不赋予治理票权。</p></Panel><Panel className="mt-4" title="本周状态"><ProgressBar value={42} max={60} label="个人系统奖励额度" /></Panel></>;
  if (path.startsWith("/journey") || path.startsWith("/quests") || path.startsWith("/seasons") || path.startsWith("/play") || ["/me/progress", "/me/contributions", "/me/collection"].includes(path)) return <><Panel title="健康参与" footer={<Link className="link text-sm" href="/settings/journey">旅程与休息设置</Link>}><p className="text-sm leading-relaxed opacity-75">每周最多激活 3 个任务。离线不会扣除进度。</p></Panel><Panel className="mt-4" title="本周旅程"><ProgressBar value={4} max={7} label="完成节点" /></Panel></>;
  if (path.startsWith("/nodes/")) {
    const [, , parentSlug, childSlug] = path.split("/");
    const parent = nodes.find((node) => node.slug === parentSlug);
    const child = parent?.children.find((item) => item.slug === childSlug);
    if (parent) return <Panel title={child ? `${parent.name} / ${child.name}规则` : `${parent.name}规则`} footer={<Link className="link text-sm" href="/nodes">查看全部节点</Link>}><p className="leading-relaxed">{parent.rule}</p>{child ? <p className="mt-3 border-t-2 border-base-content/20 pt-3"><strong>子节点补充：</strong>{child.rule}</p> : null}<div className="mt-4 flex items-center justify-between text-sm"><span>{child ? `${child.followerCount} 人直接关注` : `${parent.followerCount} 人关注`}</span><ActionButton className="btn btn-sm" message="节点关注状态已更新">关注节点</ActionButton></div></Panel>;
  }
  return <><AccountRail />{path === "/" ? <Panel className="mt-4" title="内容如何组织" footer={<Link className="link text-sm font-semibold" href="/nodes">了解全部 {nodes.length} 个一级节点</Link>}><p className="text-sm leading-relaxed opacity-75"><strong>一级节点</strong>划定长期讨论空间，<strong>子节点</strong>细分稳定主题，<strong>标签</strong>描述跨节点话题。</p></Panel> : null}</>;
}

export function RouteFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  const path = usePathname();
  const compact = path === "/quick-compose";
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 ${compact ? "" : "lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-7"}`}>
      <main id="main-content" className="min-w-0">{children}</main>
      {compact ? null : <aside className="mt-6 lg:mt-0" aria-label="辅助信息"><RouteSideRail path={path} /></aside>}
    </div>
  );
}
