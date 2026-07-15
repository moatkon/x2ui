import Link from "next/link";
import { ThemeToggle } from "./client/theme-toggle";
import { DesktopNavigation, MobileNavigation } from "./client/active-navigation";
import { RouteFrame } from "./client/route-frame";
import { Avatar } from "./shared/avatar";
import { AccountRail, CoinRail, ComposeRail, JourneyRail, NodeRail } from "./site-rails";

function UserMenu() {
  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-ghost" aria-label="打开用户菜单">
        <Avatar name="林默" image="user-linmo" sizeClass="size-8" />
        <span className="hidden sm:inline">林默</span>
      </summary>
      <ul className="menu dropdown-content z-30 mt-2 max-h-[80vh] w-60 overflow-y-auto border-2 border-base-content/20 bg-base-100 p-2">
        <li><Link href="/me">我的主页</Link></li>
        <li><Link href="/coins">金币与账本</Link></li>
        <li><Link href="/journey">共建旅程</Link></li>
        <li><Link href="/bookmarks">我的收藏</Link></li>
        <li><Link href="/drafts">我的草稿</Link></li>
        <li><Link href="/me/reports">举报进度</Link></li>
        <li><Link href="/settings/blocked">屏蔽列表</Link></li>
        <li><Link href="/appeals">我的申诉</Link></li>
        <li><Link href="/settings/profile">设置</Link></li>
        <li className="menu-title">治理</li>
        <li><Link href="/moderation/cases">治理工作台</Link></li>
        <li><Link href="/moderation/coins">金币风险案件</Link></li>
        <li><Link href="/moderation/audit-logs">审计日志</Link></li>
        <li className="menu-title">Controller</li>
        <li><Link href="/admin/coins/control">金币控制台</Link></li>
        <li><Link href="/admin/coins/reconciliation">对账与关账</Link></li>
      </ul>
    </details>
  );
}

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div id="app" className="min-h-screen">
      <header className="sticky top-0 z-30 border-b-2 border-base-content/20 bg-base-100">
        <div className="navbar mx-auto max-w-7xl px-3 sm:px-5">
          <div className="navbar-start">
            <MobileNavigation />
            <Link className="text-2xl font-black" href="/" aria-label="X2Post 首页">X2Post</Link>
          </div>
          <nav className="navbar-center hidden lg:block" aria-label="主导航">
            <DesktopNavigation />
          </nav>
          <div className="navbar-end gap-1">
            <Link className="btn btn-ghost btn-square" href="/notifications" aria-label="通知">◉</Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <RouteFrame rails={{ account: <AccountRail />, compose: <ComposeRail />, coins: <CoinRail />, journey: <JourneyRail />, nodes: <NodeRail /> }}>{children}</RouteFrame>
      <footer className="border-t-2 border-base-content/20 bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm opacity-70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 X2Post · 内容优先、公开可读、秩序透明</p>
          <nav className="flex flex-wrap gap-4" aria-label="页脚导航">
            <Link href="/nodes">节点规则</Link>
            <Link href="/coins/rules">金币规则</Link>
            <Link href="/coins/economy">经济透明度</Link>
            <Link href="/seasons">共建季</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
