import Link from "next/link";
import { notFound } from "next/navigation";
import { nodes } from "@/lib/mock-data";
import { ActionButton } from "../client/demo-actions";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { Breadcrumbs, Notice, PageHeader, Pagination, Panel, StatGrid } from "../shared/ui";

export function NodesContent({ path }: { path: string }) {
  const [, , parentSlug, childSlug] = path.split("/");
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);
  if (parentSlug && !parent) notFound();
  if (childSlug && !child) notFound();
  if (!parent) return <NodeDirectory />;
  return child ? <ChildNodePage parent={parent} child={child} /> : <ParentNodePage parent={parent} />;
}

function NodeDirectory() {
  return <><PageHeader title="节点目录" description="一级节点划定社区边界，子节点细分稳定讨论主题。" /><Notice><p>子节点只属于一个一级节点；跨节点的具体概念继续使用标签。当前严格支持两层。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{nodes.map((node) => <li className="list-row rounded-none px-4 py-5" key={node.id}><Avatar name={node.name} image={`node-${node.slug}`} /><div className="list-col-grow min-w-0"><Link className="font-bold hover:underline" href={`/nodes/${node.slug}`}>{node.name}</Link><p className="mt-1 opacity-70">{node.description}</p><p className="mt-2 text-sm opacity-60">{node.postCount} 个主题 · {node.followerCount} 人关注 · {node.children.length} 个子节点</p><nav className="mt-3" aria-label={`${node.name}子节点`}><ul className="menu menu-horizontal flex flex-wrap gap-1 px-0">{node.children.map((child) => <li key={child.id}><Link className="min-h-11 content-center px-3" href={`/nodes/${node.slug}/${child.slug}`}>{child.name}</Link></li>)}</ul></nav><div className="mt-2 flex flex-wrap gap-3 text-sm"><Link className="link" href={`/feed?node=${node.slug}`}>浏览父节点聚合</Link><span>父级关注覆盖全部子节点</span></div></div><span className="hidden self-center sm:block" aria-hidden>›</span></li>)}</ul></>;
}

type ParentNode = (typeof nodes)[number];
type ChildNode = ParentNode["children"][number];

function NodeSiblingMenu({ parent, child }: { parent: ParentNode; child?: ChildNode }) {
  return <nav aria-label={`${parent.name}子节点`}><ul className="menu menu-horizontal flex flex-wrap gap-1 px-0"><li><Link className={`content-center ${!child ? "menu-active" : ""}`} href={`/nodes/${parent.slug}`}>全部{parent.name}</Link></li>{parent.children.map((item) => <li key={item.id}><Link className={`content-center ${child?.id === item.id ? "menu-active" : ""}`} href={`/nodes/${parent.slug}/${item.slug}`}>{item.name}</Link></li>)}</ul></nav>;
}

function ParentNodePage({ parent }: { parent: ParentNode }) {
  return <><Breadcrumbs items={[{ label: "节点", href: "/nodes" }, { label: parent.name }]} /><div className="mt-3"><PageHeader title={parent.name} description={parent.description} action={<ActionButton className="btn btn-primary" message={`已关注${parent.name}`}>关注父节点</ActionButton>} /></div><Notice><p>关注{parent.name}会覆盖全部现有及未来子节点；你仍可以单独静音不感兴趣的子节点。</p></Notice><Panel className="mt-5" title="节点简介" footer={<p className="text-sm"><strong>通用规则：</strong>{parent.rule}</p>}><p className="leading-relaxed">{parent.description}</p><p className="mt-3 text-sm opacity-65">{parent.followerCount} 人关注 · {parent.postCount} 个聚合主题</p></Panel><Panel className="mt-5" title={`${parent.children.length} 个子节点`}><ul className="list x2-list -m-5">{parent.children.map((item) => <li className="list-row rounded-none" key={item.id}><div className="list-col-grow"><Link className="font-bold hover:underline" href={`/nodes/${parent.slug}/${item.slug}`}>{item.name}</Link><p className="mt-1 text-sm opacity-65">{item.description}</p></div><span className="text-sm opacity-60">{item.postCount} 个主题</span></li>)}</ul></Panel><Panel className="mt-5" title="父节点聚合帖子" footer={<Pagination />}><div className="-m-5"><PostRows framed={false} filter={(post) => post.nodePath.parentSlug === parent.slug} /></div></Panel></>;
}

function ChildNodePage({ parent, child }: { parent: ParentNode; child: ChildNode }) {
  return <><Breadcrumbs items={[{ label: "节点", href: "/nodes" }, { label: parent.name, href: `/nodes/${parent.slug}` }, { label: child.name }]} /><div className="mt-3"><PageHeader title={`${parent.name} / ${child.name}`} description={child.description} action={<ActionButton className="btn btn-primary" message={`已直接关注${child.name}`}>直接关注子节点</ActionButton>} /></div><Notice><p>关注{parent.name}会自动覆盖当前及未来子节点；只关注{child.name}不会反向关注父节点。</p></Notice><Panel className="mt-5" title="切换同级主题"><NodeSiblingMenu parent={parent} child={child} /></Panel><Panel className="mt-5" title="适用规则" footer={<p className="text-sm opacity-65">{child.followerCount} 人直接关注 · {child.postCount} 个主题 · 可发布</p>}><div className="space-y-3"><p><strong>{parent.name}通用规则：</strong>{parent.rule}</p><p><strong>{child.name}补充规则：</strong>{child.rule}</p></div></Panel><Panel className="mt-5" title={`${child.name}最新帖子`} footer={<div className="flex flex-wrap items-center justify-between gap-3"><Link className="link text-sm" href={`/feed?node=${parent.slug}&subnode=${child.slug}`}>在 Feed 中浏览</Link><Pagination /></div>}><div className="-m-5"><PostRows framed={false} filter={(post) => post.nodePath.parentSlug === parent.slug && post.nodePath.childSlug === child.slug} /></div></Panel></>;
}

export function NodeProjectContent({ path }: { path: string }) {
  const node = nodes.find((item) => item.slug === path.split("/")[2]);
  if (!node) notFound();
  const tasks = [["first-reply", "产品设计", "给新人的第一条有效回应", "从 3 个尚未得到回复的新主题中选择一个，提供具体、友善且有信息量的回应。", 1, 3], ["source-trail", "前端开发", "补全无障碍资料路径", "为讨论补充一手标准或官方文档，并说明它解决了什么问题。", 0, 2]] as const;
  return <><Breadcrumbs items={[{ label: "节点", href: "/nodes" }, { label: node.name, href: `/nodes/${node.slug}` }, { label: "公开共建" }]} /><div className="mt-3"><PageHeader title={`${node.name} · 公开共建`} description="任务、验收规则、贡献者和最终成果都可追溯。" action={<ActionButton className="btn btn-primary" message="已提交加入申请">申请加入</ActionButton>} /></div><Notice><p>加入只订阅协作进度，不创建私聊、身份等级或永久义务；可随时退出。</p></Notice><div className="mt-5"><StatGrid items={[{ title: "公共目标", value: "24 条", description: "可信资料索引" }, { title: "已验收", value: "16 条", description: "由两类角色确认" }, { title: "开放任务", value: "5", description: "最多同时领取 1 个" }]} /></div><Panel className="mt-5" title="公开任务" footer={<Link className="link text-sm" href="/me/contributions">查看我的贡献记录</Link>}><ul className="list x2-list -m-5">{tasks.map(([id, scope, title, description, value, max]) => <li className="list-row rounded-none" key={id}><div className="list-col-grow"><span className="badge badge-outline">{scope}</span><Link className="mt-2 block font-bold" href={`/quests/${id}`}>{title}</Link><p className="mt-1 text-sm opacity-65">{description}</p><progress className="progress mt-3 w-full" value={value} max={max} /></div><span className="badge badge-success">贡献进度 +1</span></li>)}</ul></Panel></>;
}
