import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicFeed, getPublicNode } from "@/app/_server/public-content";
import { ActionButton } from "../../client/action-button";
import { PostRows } from "../../shared/post-rows";
import { Breadcrumbs, Notice, PageHeader, Pagination, Panel } from "../../shared/ui";
import { NodeSiblingMenu } from "./node-sibling-menu";

export async function ChildNodePage({ parentSlug, childSlug, cursor }: { parentSlug: string; childSlug: string; cursor?: string }) {
  const result = await getPublicNode(parentSlug, childSlug);
  if (!result?.child) notFound();
  const { parent, child } = result;
  const feed = await getPublicFeed(parent.slug, child.slug, cursor);
  return (
    <>
      <Breadcrumbs items={[{ label: "节点", href: "/nodes" }, { label: parent.name, href: `/nodes/${parent.slug}` }, { label: child.name }]} />
      <div className="mt-3">
        <PageHeader
          title={`${parent.name} / ${child.name}`}
          description={child.description}
          action={<ActionButton className="btn btn-primary" message={`已直接关注${child.name}`} api={{ method: "PUT", path: `/users/me/followed-nodes/${encodeURIComponent(child.id)}`, body: {} }}>直接关注子节点</ActionButton>}
        />
      </div>
      <Notice><p>关注{parent.name}会自动覆盖当前及未来子节点；只关注{child.name}不会反向关注父节点。</p></Notice>
      <Panel className="mt-5" title="切换同级主题"><NodeSiblingMenu parent={parent} child={child} /></Panel>
      <Panel className="mt-5" title="适用规则" footer={<p className="text-sm opacity-65">{child.followerCount} 人直接关注 · {child.postCount} 个主题 · 可发布</p>}>
        <div className="space-y-3">
          <p><strong>{parent.name}通用规则：</strong>{parent.rule}</p>
          <p><strong>{child.name}补充规则：</strong>{child.rule}</p>
        </div>
      </Panel>
      <Panel
        className="mt-5"
        title={`${child.name}最新帖子`}
        footer={<div className="flex flex-wrap items-center justify-between gap-3"><Link className="link text-sm" href={`/?node=${parent.slug}&subnode=${child.slug}`}>在 Feed 中浏览</Link><Pagination href={`/nodes/${parent.slug}/${child.slug}`} nextCursor={feed.nextCursor} /></div>}
      >
        <div className="-m-5"><PostRows posts={feed.items} framed={false} /></div>
      </Panel>
    </>
  );
}
