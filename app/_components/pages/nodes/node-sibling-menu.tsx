import Link from "next/link";
import type { CommunityNode } from "@/lib/models";

type ParentNode = CommunityNode;
type ChildNode = ParentNode["children"][number];

export function NodeSiblingMenu({ parent, child }: { parent: ParentNode; child?: ChildNode }) {
  return (
    <nav aria-label={`${parent.name}子节点`}>
      <ul className="menu menu-horizontal flex flex-wrap gap-1 px-0">
        <li><Link className={`content-center ${!child ? "menu-active" : ""}`} href={`/nodes/${parent.slug}`}>全部{parent.name}</Link></li>
        {parent.children.map((item) => (
          <li key={item.id}>
            <Link className={`content-center ${child?.id === item.id ? "menu-active" : ""}`} href={`/nodes/${parent.slug}/${item.slug}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
