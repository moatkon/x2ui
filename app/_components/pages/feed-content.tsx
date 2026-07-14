import Link from "next/link";
import { nodes } from "@/lib/mock-data";
import type { QueryParams } from "@/app/_lib/page-routing";
import { PostRows } from "../shared/post-rows";

export function FeedContent({ query }: { query: QueryParams }) {
  const parentSlug = typeof query.node === "string" ? query.node : undefined;
  const childSlug = typeof query.subnode === "string" ? query.subnode : undefined;
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);

  return (
    <>
      <header className="mb-5"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">最新帖子</h1><p className="mt-1 opacity-70">先从节点缩小范围，再进入一段具体讨论。</p></header>
      <Link href={parent ? `/quick-compose?node=${parent.slug}${child ? `&subnode=${child.slug}` : ""}` : "/quick-compose"} className="flex min-h-14 items-center rounded-box border-2 border-base-content/20 px-4 font-semibold hover:bg-base-200">写点什么……</Link>
      <section className="mt-5 overflow-hidden rounded-box border-2 border-base-content/20">
        <header className="flex items-center justify-between border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">浏览帖子</h2><Link className="link text-sm" href="/nodes">全部节点</Link></header>
        <nav className="p-3" aria-label="按一级节点浏览"><ul className="menu menu-horizontal flex w-full flex-wrap gap-1 px-0"><li><Link className={!parent ? "menu-active" : ""} href="/feed">全部</Link></li>{nodes.map((node) => <li key={node.id}><Link className={parent?.id === node.id ? "menu-active" : ""} href={`/feed?node=${node.slug}`}>{node.name}</Link></li>)}</ul></nav>
        {parent ? <nav className="border-t-2 border-base-content/20 p-3" aria-label={`${parent.name}下的主题`}><ul className="menu menu-horizontal flex flex-wrap gap-1 px-0"><li><Link className={!child ? "menu-active" : ""} href={`/feed?node=${parent.slug}`}>全部{parent.name}</Link></li>{parent.children.map((item) => <li key={item.id}><Link className={child?.id === item.id ? "menu-active" : ""} href={`/feed?node=${parent.slug}&subnode=${item.slug}`}>{item.name}</Link></li>)}</ul></nav> : null}
      </section>
      <div className="mt-5"><PostRows filter={(post) => child ? post.nodePath.childSlug === child.slug && post.nodePath.parentSlug === parent?.slug : parent ? post.nodePath.parentSlug === parent.slug : true} /></div>
    </>
  );
}
