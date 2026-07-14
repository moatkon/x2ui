import Link from "next/link";
import type { QueryParams } from "@/app/_lib/page-routing";
import { posts } from "@/lib/mock-data";
import { NodesContent } from "./nodes-content";
import { TagsContent } from "./tags-content";
import { UserContent } from "./user-content";
import { PostRows } from "../shared/post-rows";

const tabs = [["0", "帖子"], ["1", "用户"], ["2", "节点"], ["3", "标签"]] as const;

export function SearchContent({ query }: { query: QueryParams }) {
  const q = typeof query.q === "string" ? query.q : "";
  const type = typeof query.type === "string" ? query.type : "0";
  const filtered = q ? posts.filter((post) => `${post.title}${post.excerpt}${post.tags.join("")}`.includes(q)) : posts;
  return <><h1 className="text-3xl font-black">搜索</h1><p className="mt-1 opacity-70">在公开帖子、用户、节点和标签中查找。</p><form className="join mt-5 w-full"><input className="input join-item w-full" name="q" defaultValue={q} aria-label="搜索关键词" /><button className="btn btn-primary join-item">搜索</button></form><nav className="tabs tabs-border mt-5">{tabs.map(([key, label]) => <Link key={key} className={`tab ${type === key ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(q)}&type=${key}`}>{label}</Link>)}</nav><div className="mt-5">{type === "0" ? <PostRows filter={(post) => filtered.includes(post)} /> : type === "1" ? <UserContent path="/users/linmo" /> : type === "2" ? <NodesContent path="/nodes" /> : <TagsContent path="/tags" />}</div></>;
}
