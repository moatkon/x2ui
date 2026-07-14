import Link from "next/link";
import { ThemeToggle } from "./client/demo-actions";
import { Avatar } from "./shared/avatar";

const navigation = [
  ["首页", "/feed"], ["节点", "/nodes"], ["关注", "/following"],
  ["金币", "/coins"], ["共建", "/journey"], ["搜索", "/search"],
] as const;

function isActive(path: string, href: string) {
  return href === "/feed" ? path === href : path === href || path.startsWith(`${href}/`);
}

export function SiteShell({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <div id="app" aria-live="polite">
      <div className="drawer">
        <div className="drawer-content min-h-screen">
          <header className="sticky top-0 z-30 border-b-2 border-base-content/20 bg-base-100">
            <div className="navbar mx-auto max-w-7xl px-3 sm:px-5">
              <div className="navbar-start">
                <details className="dropdown lg:hidden">
                  <summary className="btn btn-ghost btn-square" aria-label="打开导航">☰</summary>
                  <ul className="menu dropdown-content z-30 mt-2 w-56 border-2 border-base-content/20 bg-base-100 p-2">
                    {navigation.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}
                  </ul>
                </details>
                <Link className="text-2xl font-black" href="/feed">X2Post</Link>
              </div>
              <nav className="navbar-center hidden lg:block" aria-label="主导航">
                <ul className="menu menu-horizontal gap-1">
                  {navigation.map(([label, href]) => <li key={href}><Link className={isActive(path, href) ? "menu-active" : ""} href={href}>{label}</Link></li>)}
                </ul>
              </nav>
              <div className="navbar-end gap-2">
                <Link className="btn btn-primary hidden sm:inline-flex" href="/quick-compose">轻发布</Link>
                <ThemeToggle />
                <Link className="btn btn-ghost" href="/me">林默</Link>
              </div>
            </div>
          </header>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
            <main id="main-content" className="min-w-0">{children}</main>
            <aside className="min-w-0" aria-label="页面辅助信息">
              <section className="overflow-hidden rounded-box border-2 border-base-content/20">
                <header className="border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">我的 X2Post</h2></header>
                <div className="p-5"><div className="flex items-center gap-3"><Avatar name="林默" image="user-linmo" /><div><Link className="font-bold" href="/me">林默</Link><p className="text-sm opacity-65">产品设计 · 上海</p></div></div></div>
              </section>
            </aside>
          </div>
          <footer className="mt-10 border-t-2 border-base-content/20"><div className="mx-auto max-w-7xl px-5 py-6 text-sm opacity-70">© 2026 X2Post · 认真表达，友善回应</div></footer>
        </div>
      </div>
    </div>
  );
}
