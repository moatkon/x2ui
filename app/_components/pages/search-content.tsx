import Link from "next/link";
import Form from "next/form";
import type { QueryParams } from "@/app/_lib/query";
import {
  getPublicNodes,
  searchPublicNodes,
  searchPublicPosts,
  searchPublicTags,
  searchPublicUsers,
  type ApiPublicUserSummary,
  type ApiTagSummary,
} from "@/app/_server/public-content";
import type { CommunityNode, PostSummary } from "@/lib/mock-data";
import { SearchNodeFilters } from "../client/search-node-filters";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { EmptyState, PageHeader, Pagination, Panel } from "../shared/ui";

type SearchType = "0" | "1" | "2" | "3";
const tabs: ReadonlyArray<[SearchType, string]> = [["0", "帖子"], ["1", "用户"], ["2", "节点"], ["3", "标签"]];

function SearchControls({ query, active, nodes }: { query: string; active: SearchType; nodes: readonly CommunityNode[] }) {
  return <Panel title="搜索 X2Post"><Form action="/search" className="join w-full"><input className="input join-item w-full" name="q" defaultValue={query} aria-label="搜索关键词" required maxLength={100} /><button className="btn btn-primary join-item" type="submit">搜索</button></Form><SearchNodeFilters nodes={nodes} /><nav className="tabs tabs-border mt-4">{tabs.map(([key, label]) => <Link key={key} className={`tab ${active === key ? "tab-active" : ""}`} href={`/search?q=${encodeURIComponent(query)}&type=${key}`}>{label}</Link>)}</nav></Panel>;
}

function PostResults({ posts }: { posts: PostSummary[] }) {
  return <Panel title={`帖子结果 · ${posts.length}`} action={<select className="select select-sm" aria-label="结果排序"><option>相关度优先</option><option>最新发布</option></select>} footer={<Pagination />}><div className="-m-5"><PostRows posts={posts} framed={false} /></div></Panel>;
}

function UserResults({ users }: { users: ApiPublicUserSummary[] }) {
  return <Panel title={`用户结果 · ${users.length}`}>{users.length === 0 ? <EmptyState title="没有找到用户" description="试试更短的用户名或显示名称。" /> : <ul className="list x2-list -m-5">{users.map((user) => <li className="list-row rounded-none" key={user.id}><Avatar name={user.displayName} image={`user-${user.userName}`} /><div className="list-col-grow"><Link className="font-bold" href={`/users/${user.userName}`}>{user.displayName}</Link><p className="text-sm opacity-65">@{user.userName}</p></div><Link className="btn btn-sm" href={`/users/${user.userName}`}>查看</Link></li>)}</ul>}</Panel>;
}

type NodeResult = { id: string; slug: string; name: string; description: string; postCount: number };
function NodeResults({ nodes }: { nodes: NodeResult[] }) {
  return <Panel title={`节点结果 · ${nodes.length}`}>{nodes.length === 0 ? <EmptyState title="没有找到节点" description="可以浏览节点目录查看全部稳定主题。" /> : <ul className="list x2-list -m-5">{nodes.map((node) => <li className="list-row rounded-none" key={node.id}><div className="list-col-grow"><Link className="font-bold" href={`/nodes/${node.slug}`}>{node.name}</Link><p className="text-sm opacity-65">{node.description}</p></div><span className="text-sm opacity-60">{node.postCount} 个主题</span></li>)}</ul>}</Panel>;
}

function TagResults({ tags }: { tags: ApiTagSummary[] }) {
  return <Panel title={`标签结果 · ${tags.length}`}>{tags.length === 0 ? <EmptyState title="没有找到标签" description="标签用于跨节点连接具体话题。" /> : <ul className="list x2-list -m-5">{tags.map((tag) => <li className="list-row rounded-none" key={tag.slug}><Link className="font-bold" href={`/tags/${encodeURIComponent(tag.slug)}`}># {tag.label}</Link><span className="text-sm opacity-60">{tag.publicPostCount} 篇</span></li>)}</ul>}</Panel>;
}

export async function SearchContent({ query }: { query: QueryParams }) {
  const keyword = typeof query.q === "string" ? query.q : "";
  const active: SearchType = query.type === "1" || query.type === "2" || query.type === "3" ? query.type : "0";
  const nodes = await getPublicNodes();
  let results: React.ReactNode;
  if (!keyword) results = <EmptyState title="输入关键词开始搜索" description="可以分别搜索公开帖子、用户、节点和标签。" />;
  else if (active === "1") results = <UserResults users={await searchPublicUsers(keyword)} />;
  else if (active === "2") results = <NodeResults nodes={await searchPublicNodes(keyword)} />;
  else if (active === "3") results = <TagResults tags={await searchPublicTags(keyword)} />;
  else results = <PostResults posts={await searchPublicPosts(keyword)} />;
  return <><PageHeader title="搜索" description="在公开帖子、用户、节点和标签中查找。" /><SearchControls query={keyword} active={active} nodes={nodes} /><div className="mt-5">{results}</div></>;
}
