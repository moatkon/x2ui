import Link from "next/link";
import { notFound } from "next/navigation";
import { nodes } from "@/lib/mock-data";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";

export function NodesContent({ path }: { path: string }) {
  const [, , parentSlug, childSlug] = path.split("/");
  const parent = nodes.find((node) => node.slug === parentSlug);
  const selectedChild = parent?.children.find((item) => item.slug === childSlug);
  if (parent) {
    return <><div className="breadcrumbs text-sm"><ul><li><Link href="/nodes">节点</Link></li>{selectedChild ? <li><Link href={`/nodes/${parent.slug}`}>{parent.name}</Link></li> : null}<li>{selectedChild?.name ?? parent.name}</li></ul></div><header className="my-4"><h1 className="text-3xl font-black">{selectedChild ? `${parent.name} / ${selectedChild.name}` : parent.name}</h1><p className="mt-1 opacity-70">{selectedChild?.description ?? parent.description}</p></header><div className="alert alert-info alert-soft"><p>{selectedChild ? selectedChild.rule : parent.rule}</p></div><section className="mt-5 rounded-box border-2 border-base-content/20 p-5"><h2 className="text-lg font-bold">{selectedChild ? "同级主题" : `${parent.children.length} 个子节点`}</h2><ul className="menu menu-horizontal mt-3 flex flex-wrap px-0">{parent.children.map((item) => <li key={item.id}><Link className={selectedChild?.id === item.id ? "menu-active" : ""} href={`/nodes/${parent.slug}/${item.slug}`}>{item.name}</Link></li>)}</ul></section><div className="mt-5"><PostRows filter={(post) => selectedChild ? post.nodePath.parentSlug === parent.slug && post.nodePath.childSlug === selectedChild.slug : post.nodePath.parentSlug === parent.slug} /></div></>;
  }
  return <><header className="mb-5"><h1 className="text-3xl font-black">节点目录</h1><p className="mt-1 opacity-70">一级节点划定社区边界，子节点细分稳定讨论主题。</p></header><div className="alert alert-info alert-soft mb-5"><p>子节点只属于一个一级节点；跨节点的具体概念继续使用标签。当前严格支持两层。</p></div><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{nodes.map((node) => <li className="list-row rounded-none px-4 py-5" key={node.id}><Avatar name={node.name} image={`node-${node.slug}`} /><div className="list-col-grow"><Link className="font-bold hover:underline" href={`/nodes/${node.slug}`}>{node.name}</Link><p className="mt-1 opacity-70">{node.description}</p><p className="mt-2 text-sm opacity-60">{node.postCount} 个主题 · {node.followerCount} 人关注 · {node.children.length} 个子节点</p></div></li>)}</ul></>;
}

export function NodeProjectContent({ path }: { path: string }) {
  const node = nodes.find((item) => item.slug === path.split("/")[2]);
  if (!node) notFound();
  return <><div className="breadcrumbs text-sm"><ul><li><Link href="/nodes">节点</Link></li><li><Link href={`/nodes/${node.slug}`}>{node.name}</Link></li><li>公开共建</li></ul></div><header className="my-4"><h1 className="text-3xl font-black">{node.name} · 公开共建</h1><p className="mt-1 opacity-70">任务、验收规则、贡献者和最终成果都可追溯。</p></header><div className="alert alert-info alert-soft"><p>加入只订阅协作进度，不创建私聊、身份等级或永久义务；可随时退出。</p></div><dl className="mt-5 grid overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-3">{[["公共目标","24 条","可信资料索引"],["已验收","16 条","由两类角色确认"],["开放任务","5","最多同时领取 1 个"]].map(([title,value,desc]) => <div className="p-5" key={title}><dt className="opacity-60">{title}</dt><dd className="mt-1 text-2xl font-black">{value}</dd><dd className="text-sm opacity-60">{desc}</dd></div>)}</dl><section className="mt-5 rounded-box border-2 border-base-content/20 p-5"><h2 className="text-xl font-bold">公开任务</h2><p className="mt-3 leading-relaxed">补全无障碍资料路径，并为仍未得到回应的新主题提供一条有上下文、有下一步的首响。</p></section></>;
}
