import Link from "next/link";
import { ThemeToggle } from "./client/theme-toggle";
import { DesktopNavigation, MobileNavigation } from "./client/active-navigation";
import { RouteFrame } from "./client/route-frame";
import { UserMenu } from "./client/user-menu";
import { AccountRail, CoinRail, ComposeRail, JourneyRail, NodeRail } from "./site-rails";
import { getOptionalMeSummary } from "@/app/_server/account-data";
import { shellAccountModel } from "@/lib/shell-account.mjs";

export async function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const account = shellAccountModel(await getOptionalMeSummary());
  return (
    <div id="app" className="min-h-screen">
      <header className="sticky top-0 z-30 border-b-2 border-base-content/20 bg-base-100">
        <div className="navbar mx-auto max-w-7xl px-3 sm:px-5">
          <div className="navbar-start">
            <MobileNavigation authenticated={account.authenticated} />
            <Link className="text-2xl font-black" href="/" aria-label="X2Post 首页">X2Post</Link>
          </div>
          <nav className="navbar-center hidden lg:block" aria-label="主导航">
            <DesktopNavigation authenticated={account.authenticated} />
          </nav>
          <div className="navbar-end gap-1">
            {account.authenticated ? <Link className="btn btn-ghost" href="/notifications" aria-label={`通知，${account.unreadNotifications} 条未读`}>通知{account.unreadNotifications ? <span className="badge badge-sm">{account.unreadNotifications}</span> : null}</Link> : null}
            <ThemeToggle />
            {account.authenticated
              ? <UserMenu displayName={account.displayName} avatarUrl={account.avatarUrl} />
              : <div className="flex gap-1"><Link className="btn btn-ghost btn-sm" href="/login">登录</Link><Link className="btn btn-primary btn-sm" href="/register">注册</Link></div>}
          </div>
        </div>
      </header>
      <RouteFrame rails={{ account: <AccountRail account={account.authenticated && account.displayName ? { displayName: account.displayName, avatarUrl: account.avatarUrl } : undefined} />, compose: <ComposeRail />, coins: <CoinRail />, journey: <JourneyRail />, nodes: <NodeRail /> }}>{children}</RouteFrame>
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
