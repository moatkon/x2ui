"use client";

import Link from "next/link";
import { Avatar } from "../shared/avatar";
import { LogoutButton } from "./logout-button";
import { useCloseOnNavigation } from "./use-close-on-navigation";

export function UserMenu() {
  const { detailsRef, close } = useCloseOnNavigation();
  return <details ref={detailsRef} className="dropdown dropdown-end"><summary className="btn btn-ghost" aria-label="打开用户菜单"><Avatar name="林默" image="user-linmo" sizeClass="size-8" /><span className="hidden sm:inline">林默</span></summary><ul className="menu dropdown-content z-30 mt-2 max-h-[80vh] w-60 overflow-y-auto border-2 border-base-content/20 bg-base-100 p-2" onClick={close}><li><Link href="/me">我的主页</Link></li><li><Link href="/coins">金币与账本</Link></li><li><Link href="/journey">共建旅程</Link></li><li><Link href="/bookmarks">我的收藏</Link></li><li><Link href="/drafts">我的草稿</Link></li><li><Link href="/me/reports">举报进度</Link></li><li><Link href="/settings/blocked">屏蔽列表</Link></li><li><Link href="/appeals">我的申诉</Link></li><li><Link href="/settings/profile">设置</Link></li><li className="menu-title">治理</li><li><Link href="/moderation/cases">治理工作台</Link></li><li><Link href="/moderation/coins">金币风险案件</Link></li><li><Link href="/moderation/audit-logs">审计日志</Link></li><li className="menu-title">Controller</li><li><Link href="/admin/coins/control">金币控制台</Link></li><li><Link href="/admin/coins/reconciliation">对账与关账</Link></li><li className="mt-1 border-t border-base-content/20 pt-1"><LogoutButton /></li></ul></details>;
}
