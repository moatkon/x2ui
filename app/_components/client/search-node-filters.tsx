"use client";

import { useState } from "react";
import type { CommunityNode } from "@/lib/models";

type SearchNodeFiltersProps = {
  nodes: readonly CommunityNode[];
  query: string;
  type: string;
  sort: string;
  initialParent: string;
  initialChild: string;
};

export function SearchNodeFilters({
  nodes,
  query,
  type,
  sort,
  initialParent,
  initialChild,
}: SearchNodeFiltersProps) {
  const [parentSlug, setParentSlug] = useState(initialParent);
  const [childSlug, setChildSlug] = useState(initialChild);
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);
  return (
    <form action="/search" className="mt-4">
      <input type="hidden" name="q" value={query} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="sort" value={sort} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="form-control">
          <span className="label-text mb-2 font-semibold">一级节点</span>
          <select
            className="select w-full"
            name="parentNode"
            value={parentSlug}
            onChange={(event) => {
              setParentSlug(event.target.value);
              setChildSlug("");
            }}
          >
            <option value="">全部一级节点</option>
            {nodes.map((node) => <option value={node.slug} key={node.id}>{node.name}</option>)}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text mb-2 font-semibold">子节点</span>
          <select
            className="select w-full"
            name="childNode"
            value={childSlug}
            disabled={!parent}
            onChange={(event) => setChildSlug(event.target.value)}
          >
            <option value="">{parent ? `全部${parent.name}` : "先选择一级节点"}</option>
            {parent?.children.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        <button className="btn" type="submit">应用范围</button>
      </div>
      <p className="mt-2 text-sm opacity-65">
        当前搜索范围：{parent?.name ?? "全部公开节点"}{child ? ` / ${child.name}` : ""}
      </p>
    </form>
  );
}
