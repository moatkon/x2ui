"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCloseOnNavigation } from "./use-close-on-navigation";

const navigation = [["首页", "/"], ["节点", "/nodes"], ["关注", "/following"], ["金币", "/coins"], ["共建", "/journey"], ["搜索", "/search"]] as const;

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  if (href === "/journey") return path.startsWith("/journey") || path.startsWith("/quests") || path.startsWith("/seasons") || ["/me/progress", "/me/contributions", "/me/collection"].includes(path);
  return path === href || path.startsWith(`${href}/`);
}

function NavigationLinks({ path }: { path: string }) {
  return <>{navigation.map(([label, href]) => <li key={href}><Link className={isActive(path, href) ? "menu-active" : ""} href={href}>{label}</Link></li>)}</>;
}

export function DesktopNavigation() {
  const path = usePathname();
  return <ul className="menu menu-horizontal gap-1 px-1"><NavigationLinks path={path} /></ul>;
}

export function MobileNavigation() {
  const path = usePathname();
  const { detailsRef, close } = useCloseOnNavigation();
  return <details ref={detailsRef} className="dropdown lg:hidden"><summary className="btn btn-ghost btn-square" aria-label="打开导航">☰</summary><ul className="menu dropdown-content z-30 mt-2 w-64 border-2 border-base-content/20 bg-base-100 p-2" onClick={close}><li className="menu-title">浏览 X2Post</li><NavigationLinks path={path} /><li className="menu-title mt-3">我的</li><li><Link href="/bookmarks">收藏</Link></li><li><Link href="/notifications">通知</Link></li><li><Link href="/settings/profile">设置</Link></li></ul></details>;
}
