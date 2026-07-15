import Link from "next/link";
import Form from "next/form";
import type { QueryParams } from "@/app/_lib/query";
import { posts } from "@/lib/mock-data";
import { NodesContent } from "./nodes-content";
import { TagsContent } from "./tags-content";
import { UserContent } from "./user-content";
import { PostRows } from "../shared/post-rows";
import { SearchNodeFilters } from "../client/demo-actions";
import { PageHeader, Pagination, Panel } from "../shared/ui";

const tabs = [["0", "帖子"], ["1", "用户"], ["2", "节点"], ["3", "标签"]] as const;

export function SearchContent({ query }: { query: QueryParams }) {
  const q = typeof query.q === "string" ? query.q : "";
  const type = typeof query.type === "string" ? query.type : "0";
  const filtered = q ? posts.filter((post) => `${post.title}${post.excerpt}${post.tags.join("")}`.includes(q)) : posts;
  return <><PageHeader title="搜索" description="在公开帖子、用户、节点和标签中查找。" /><Panel title="搜索 X2Post"><Form action="/search" className="join w-full"><input className="input join-item w-full" name="q" defaultValue={q || "社区治理"} aria-label="搜索关键词" /><button className="btn btn-primary join-item" type="submit">搜索</button></Form><SearchNodeFilters /><nav className="tabs tabs-border mt-4">{tabs.map(([key, label]) => <Link key={key} className={`tab ${type === key ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(q)}&type=${key}`}>{label}</Link>)}</nav></Panel><div className="mt-5">{type === "0" ? <Panel title={`帖子结果 · ${filtered.length || 12}`} action={<select className="select select-sm" aria-label="结果排序"><option>相关度优先</option><option>最新发布</option></select>} footer={<Pagination />}><div className="-m-5"><PostRows framed={false} filter={(post) => filtered.includes(post)} /></div></Panel> : type === "1" ? <UserContent path="/users/linmo" /> : type === "2" ? <NodesContent path="/nodes" /> : <TagsContent path="/tags" />}</div></>;
}
