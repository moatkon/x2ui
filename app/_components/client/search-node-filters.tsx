"use client";

import { useState } from "react";
import type { CommunityNode } from "@/lib/mock-data";

export function SearchNodeFilters({ nodes }: { nodes: readonly CommunityNode[] }) {
  const [parentSlug, setParentSlug] = useState("");
  const [childSlug, setChildSlug] = useState("");
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);
  return <div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="form-control"><span className="label-text mb-2 font-semibold">一级节点</span><select className="select w-full" value={parentSlug} onChange={(event) => { setParentSlug(event.target.value); setChildSlug(""); }}><option value="">全部一级节点</option>{nodes.map((node) => <option value={node.slug} key={node.id}>{node.name}</option>)}</select></label><label className="form-control"><span className="label-text mb-2 font-semibold">子节点</span><select className="select w-full" value={childSlug} disabled={!parent} onChange={(event) => setChildSlug(event.target.value)}><option value="">{parent ? `全部${parent.name}` : "先选择一级节点"}</option>{parent?.children.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label></div><p className="mt-2 text-sm opacity-65">当前搜索范围：{parent?.name ?? "全部公开节点"}{child ? ` / ${child.name}` : ""}</p></div>;
}
