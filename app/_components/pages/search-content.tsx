import Link from "next/link";
import Form from "next/form";
import type { QueryParams } from "@/app/_lib/query";
import { currentUser, nodes, posts } from "@/lib/mock-data";
import { SearchNodeFilters } from "../client/search-node-filters";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { PageHeader, Pagination, Panel } from "../shared/ui";

type SearchType = "0" | "1" | "2" | "3";
const tabs: ReadonlyArray<[SearchType, string]> = [["0", "帖子"], ["1", "用户"], ["2", "节点"], ["3", "标签"]];

function SearchControls({ query, active }: { query: string; active: SearchType }) {
  return <Panel title="搜索 X2Post"><Form action="/search" className="join w-full"><input className="input join-item w-full" name="q" defaultValue={query || "社区治理"} aria-label="搜索关键词" /><button className="btn btn-primary join-item" type="submit">搜索</button></Form><SearchNodeFilters nodes={nodes} /><nav className="tabs tabs-border mt-4">{tabs.map(([key, label]) => <Link key={key} className={`tab ${active === key ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(query)}&type=${key}`}>{label}</Link>)}</nav></Panel>;
}

function PostResults({ query }: { query: string }) {
  const filtered = query ? posts.filter((post) => `${post.title}${post.excerpt}${post.tags.join("")}`.includes(query)) : posts;
  return <Panel title={`帖子结果 · ${filtered.length}`} action={<select className="select select-sm" aria-label="结果排序"><option>相关度优先</option><option>最新发布</option></select>} footer={<Pagination />}><div className="-m-5"><PostRows framed={false} filter={(post) => filtered.includes(post)} /></div></Panel>;
}

function UserResults() {
  return <Panel title="用户结果 · 1"><ul className="list x2-list -m-5"><li className="list-row rounded-none"><Avatar name={currentUser.displayName} image="user-linmo" /><div className="list-col-grow"><Link className="font-bold" href={`/users/${currentUser.userName}`}>{currentUser.displayName}</Link><p className="text-sm opacity-65">@{currentUser.userName} · 产品设计</p></div><Link className="btn btn-sm" href={`/users/${currentUser.userName}`}>查看</Link></li></ul></Panel>;
}

function NodeResults() {
  return <Panel title={`节点结果 · ${nodes.length}`}><ul className="list x2-list -m-5">{nodes.map((node) => <li className="list-row rounded-none" key={node.id}><div className="list-col-grow"><Link className="font-bold" href={`/nodes/${node.slug}`}>{node.name}</Link><p className="text-sm opacity-65">{node.description}</p></div><span className="text-sm opacity-60">{node.postCount} 个主题</span></li>)}</ul></Panel>;
}

function TagResults() {
  const tags = [...new Set(posts.flatMap((post) => post.tags))];
  return <Panel title={`标签结果 · ${tags.length}`}><ul className="list x2-list -m-5">{tags.map((tag) => <li className="list-row rounded-none" key={tag}><Link className="font-bold" href={`/tags/${encodeURIComponent(tag)}`}># {tag}</Link></li>)}</ul></Panel>;
}

function SearchResults({ type, query }: { type: SearchType; query: string }) {
  if (type === "1") return <UserResults />;
  if (type === "2") return <NodeResults />;
  if (type === "3") return <TagResults />;
  return <PostResults query={query} />;
}

export function SearchContent({ query }: { query: QueryParams }) {
  const keyword = typeof query.q === "string" ? query.q : "";
  const active: SearchType = query.type === "1" || query.type === "2" || query.type === "3" ? query.type : "0";
  return <><PageHeader title="搜索" description="在公开帖子、用户、节点和标签中查找。" /><SearchControls query={keyword} active={active} /><div className="mt-5"><SearchResults type={active} query={keyword} /></div></>;
}
