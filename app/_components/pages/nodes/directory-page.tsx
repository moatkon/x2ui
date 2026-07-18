import Link from "next/link";
import { getPublicNodes } from "@/app/_server/public-content";
import { Avatar } from "../../shared/avatar";
import { Notice, PageHeader } from "../../shared/ui";

export async function NodeDirectoryPage() {
  const nodes = await getPublicNodes();
  return (
    <>
      <PageHeader title="节点目录" description="一级节点划定社区边界，子节点细分稳定讨论主题。" />
      <Notice><p>子节点只属于一个一级节点；跨节点的具体概念继续使用标签。当前严格支持两层。</p></Notice>
      <ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">
        {nodes.map((node) => (
          <li className="list-row rounded-none px-4 py-5" key={node.id}>
            <Avatar name={node.name} image={`node-${node.slug}`} />
            <div className="list-col-grow min-w-0">
              <Link className="font-bold hover:underline" href={`/nodes/${node.slug}`}>{node.name}</Link>
              <p className="mt-1 opacity-70">{node.description}</p>
              <p className="mt-2 text-sm opacity-60">{node.postCount} 个主题 · {node.followerCount} 人关注 · {node.children.length} 个子节点</p>
              <nav className="mt-3" aria-label={`${node.name}子节点`}>
                <ul className="menu menu-horizontal flex flex-wrap gap-1 px-0">
                  {node.children.map((child) => <li key={child.id}><Link className="min-h-11 content-center px-3" href={`/nodes/${node.slug}/${child.slug}`}>{child.name}</Link></li>)}
                </ul>
              </nav>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <Link className="link" href={`/?node=${node.slug}`}>浏览父节点聚合</Link>
                <span>父级关注覆盖全部子节点</span>
              </div>
            </div>
            <span className="hidden self-center sm:block" aria-hidden>›</span>
          </li>
        ))}
      </ul>
    </>
  );
}
