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
import type { CommunityNode, PostSummary } from "@/lib/models";
import { SearchNodeFilters } from "../client/search-node-filters";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { EmptyState, PageHeader, Pagination, Panel } from "../shared/ui";

type SearchType = "0" | "1" | "2" | "3";
type SearchSort = "RELEVANCE" | "NEWEST";
const tabs: ReadonlyArray<[SearchType, string]> = [["0", "帖子"], ["1", "用户"], ["2", "节点"], ["3", "标签"]];

type SearchState = {
  query: string;
  active: SearchType;
  sort: SearchSort;
  parentNode: string;
  childNode: string;
};

function buildSearchHref(state: SearchState) {
  const params = new URLSearchParams({ q: state.query, type: state.active, sort: state.sort });
  if (state.parentNode) params.set("parentNode", state.parentNode);
  if (state.childNode) params.set("childNode", state.childNode);
  return `/search?${params.toString()}`;
}

function SearchControls({ state, nodes }: { state: SearchState; nodes: readonly CommunityNode[] }) {
  return (
    <Panel title="搜索 X2Post">
      <Form action="/search" className="join w-full">
        <input type="hidden" name="type" value={state.active} />
        <input className="input join-item w-full" name="q" defaultValue={state.query} aria-label="搜索关键词" required maxLength={100} />
        <button className="btn btn-primary join-item" type="submit">搜索</button>
      </Form>
      {state.active === "0" ? (
        <SearchNodeFilters
          nodes={nodes}
          query={state.query}
          type={state.active}
          sort={state.sort}
          initialParent={state.parentNode}
          initialChild={state.childNode}
        />
      ) : null}
      <nav className="tabs tabs-border mt-4">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            className={`tab ${state.active === key ? "tab-active" : ""}`}
            href={buildSearchHref({ ...state, active: key })}
          >
            {label}
          </Link>
        ))}
      </nav>
    </Panel>
  );
}

function PostResults({
  posts,
  nextCursor,
  state,
}: {
  posts: PostSummary[];
  nextCursor?: string;
  state: SearchState;
}) {
  const baseHref = buildSearchHref(state);
  return (
    <Panel
      title={`帖子结果 · 本页 ${posts.length} 条`}
      action={(
        <div className="join" aria-label="结果排序">
          <Link
            className={`btn btn-sm join-item ${state.sort === "RELEVANCE" ? "btn-active" : ""}`}
            href={buildSearchHref({ ...state, sort: "RELEVANCE" })}
          >
            相关度
          </Link>
          <Link
            className={`btn btn-sm join-item ${state.sort === "NEWEST" ? "btn-active" : ""}`}
            href={buildSearchHref({ ...state, sort: "NEWEST" })}
          >
            最新
          </Link>
        </div>
      )}
      footer={<Pagination href={baseHref} nextCursor={nextCursor} />}
    >
      {posts.length === 0
        ? <EmptyState title="没有找到帖子" description="试试其他关键词或清除节点范围。" />
        : <div className="-m-5"><PostRows posts={posts} framed={false} /></div>}
    </Panel>
  );
}

function UserResults({ users, nextCursor, state }: { users: ApiPublicUserSummary[]; nextCursor?: string; state: SearchState }) {
  const baseHref = `/search?${new URLSearchParams({ q: state.query, type: "1" })}`;
  return <Panel title={`用户结果 · ${users.length}`} footer={<Pagination href={baseHref} nextCursor={nextCursor} />}>{users.length === 0 ? <EmptyState title="没有找到用户" description="试试更短的用户名或显示名称。" /> : <ul className="list x2-list -m-5">{users.map((user) => <li className="list-row rounded-none" key={user.id}><Avatar name={user.displayName} src={user.avatarUrl} /><div className="list-col-grow"><Link className="font-bold" href={`/users/${user.userName}`}>{user.displayName}</Link><p className="text-sm opacity-65">@{user.userName}</p></div><Link className="btn btn-sm" href={`/users/${user.userName}`}>查看</Link></li>)}</ul>}</Panel>;
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
  const sort: SearchSort = query.sort === "NEWEST" ? "NEWEST" : "RELEVANCE";
  const cursor = typeof query.cursor === "string" ? query.cursor : undefined;
  const parentNode = typeof query.parentNode === "string" ? query.parentNode : "";
  const childNode = typeof query.childNode === "string" ? query.childNode : "";
  const state: SearchState = { query: keyword, active, sort, parentNode, childNode };
  const nodes = await getPublicNodes();
  let results: React.ReactNode;
  if (!keyword) results = <EmptyState title="输入关键词开始搜索" description="可以分别搜索公开帖子、用户、节点和标签。" />;
  else if (active === "1") {
    const page = await searchPublicUsers(keyword, cursor);
    results = <UserResults users={page.items} nextCursor={page.nextCursor} state={state} />;
  }
  else if (active === "2") results = <NodeResults nodes={await searchPublicNodes(keyword)} />;
  else if (active === "3") results = <TagResults tags={await searchPublicTags(keyword)} />;
  else {
    const page = await searchPublicPosts(keyword, sort, cursor, parentNode || undefined, childNode || undefined);
    results = <PostResults posts={page.items} nextCursor={page.nextCursor} state={state} />;
  }
  return <><PageHeader title="搜索" description="在公开帖子、用户、节点和标签中查找。" /><SearchControls state={state} nodes={nodes} /><div className="mt-5">{results}</div></>;
}
