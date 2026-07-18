import Link from "next/link";
import { getPublicFeed, getPublicNodes } from "@/app/_server/public-content";
import type { QueryParams } from "@/app/_lib/query";
import { PostRows } from "../shared/post-rows";
import { Notice, PageHeader, Pagination, Panel } from "../shared/ui";

export async function FeedContent({ query }: { query: QueryParams }) {
  const nodes = await getPublicNodes();
  const parentSlug = typeof query.node === "string" ? query.node : undefined;
  const childSlug = typeof query.subnode === "string" ? query.subnode : undefined;
  const cursor = typeof query.cursor === "string" ? query.cursor : undefined;
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);
  const invalidParent = Boolean(parentSlug && !parent);
  const invalidChild = Boolean(childSlug && parent && !child);
  const pathName = child ? `${parent?.name} / ${child.name}` : parent?.name;
  const feed = await getPublicFeed(parent?.slug, child?.slug, cursor);
  const pageParams = new URLSearchParams();
  if (parent) pageParams.set("node", parent.slug);
  if (child) pageParams.set("subnode", child.slug);
  const pageHref = pageParams.size ? `/?${pageParams}` : "/";
  const visibleCount = feed.items.length;

  return (
    <>
      <PageHeader title="最新帖子" description="先从节点缩小范围，再进入一段具体讨论。" />
      <Link href={parent ? `/quick-compose?node=${parent.slug}${child ? `&subnode=${child.slug}` : ""}` : "/quick-compose"} className="flex min-h-14 items-center rounded-box border-2 border-base-content/20 px-4 font-semibold hover:bg-base-200">写点什么……</Link>
      <section className="mt-5 overflow-hidden rounded-box border-2 border-base-content/20">
        <header className="flex items-center justify-between border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">浏览帖子</h2><Link className="link text-sm" href="/nodes">全部节点</Link></header>
        <nav className="p-3" aria-label="按一级节点浏览"><ul className="menu menu-horizontal flex w-full flex-wrap gap-1 px-0"><li><Link className={`content-center ${!parent ? "menu-active" : ""}`} href="/">全部</Link></li>{nodes.map((node) => <li key={node.id}><Link className={`content-center ${parent?.id === node.id ? "menu-active" : ""}`} href={`/?node=${node.slug}`}>{node.name}</Link></li>)}</ul></nav>
        {parent ? <nav className="border-t-2 border-base-content/20 p-3" aria-label={`${parent.name}下的主题`}><ul className="menu menu-horizontal flex flex-wrap gap-1 px-0"><li><Link className={`content-center ${!child ? "menu-active" : ""}`} href={`/?node=${parent.slug}`}>全部{parent.name}</Link></li>{parent.children.map((item) => <li key={item.id}><Link className={`content-center ${child?.id === item.id ? "menu-active" : ""}`} href={`/?node=${parent.slug}&subnode=${item.slug}`}>{item.name}</Link></li>)}</ul></nav> : null}
      </section>
      {invalidParent || feed.recovery === "INVALID_PARENT" ? <div className="mt-5"><Notice kind="warning"><p>指定的一级节点不存在，已显示全部帖子。</p></Notice></div> : null}
      {invalidChild || feed.recovery === "INVALID_CHILD" ? <div className="mt-5"><Notice kind="warning"><p>指定的子节点不属于{parent?.name}，已显示父节点聚合内容。</p></Notice></div> : null}
      <Panel className="mt-5" title={pathName ? `${pathName} · 最新帖子` : "社区 Feed"} action={parent ? <Link className="link text-sm" href={child ? `/?node=${parent.slug}` : "/"}>{child ? `返回全部${parent.name}` : "清除筛选"}</Link> : null} footer={<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm opacity-65">{pathName ? `已显示 ${pathName} · ${visibleCount} 篇帖子` : `全部节点 · ${visibleCount} 篇帖子`}</p><Pagination href={pageHref} nextCursor={feed.nextCursor} /></div>}><div className="-m-5"><PostRows posts={feed.items} framed={false} /></div></Panel>
    </>
  );
}
