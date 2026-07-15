"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Rails = { account: ReactNode; compose: ReactNode; coins: ReactNode; journey: ReactNode; nodes: ReactNode };

function railFor(path: string, rails: Rails) {
  if (path.startsWith("/compose") || path.startsWith("/drafts")) return rails.compose;
  if (path.startsWith("/coins")) return rails.coins;
  if (path.startsWith("/journey") || path.startsWith("/quests") || path.startsWith("/seasons") || path.startsWith("/play") || ["/me/progress", "/me/contributions", "/me/collection"].includes(path)) return rails.journey;
  if (path.startsWith("/nodes/")) return rails.nodes;
  return rails.account;
}

export function RouteFrame({ children, rails }: { children: ReactNode; rails: Rails }) {
  const path = usePathname();
  const compact = path === "/quick-compose";
  return <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 ${compact ? "" : "lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-7"}`}><main id="main-content" className="min-w-0">{children}</main>{compact ? null : <aside className="mt-6 lg:mt-0" aria-label="辅助信息">{railFor(path, rails)}</aside>}</div>;
}
