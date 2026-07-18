"use client";

import type { CommunityNode } from "@/lib/models";

export function ComposeNodePicker({
  nodes,
  parent,
  childSlug,
  onParentChange,
  onChildChange,
}: {
  nodes: readonly CommunityNode[];
  parent: CommunityNode;
  childSlug: string;
  onParentChange: (slug: string) => void;
  onChildChange: (slug: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-control">
          <span className="label-text mb-2 font-semibold">一级节点（必选）</span>
          <select className="select w-full" value={parent.slug} onChange={(event) => onParentChange(event.target.value)}>
            {nodes.map((node) => <option value={node.slug} key={node.id}>{node.name}</option>)}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text mb-2 font-semibold">子节点（推荐）</span>
          <select className="select w-full" value={childSlug} onChange={(event) => onChildChange(event.target.value)}>
            <option value="">{parent.name}（综合）</option>
            {parent.children.map((child) => <option value={child.slug} key={child.id}>{child.name}</option>)}
          </select>
        </label>
      </div>
      <div className="alert"><p><strong>发布路径：</strong>{parent.name}{childSlug ? ` / ${parent.children.find((item) => item.slug === childSlug)?.name}` : "（综合）"}</p></div>
    </>
  );
}
