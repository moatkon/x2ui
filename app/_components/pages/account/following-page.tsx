import { getFollowingFeed } from "@/app/_server/authenticated-api";
import { PostRows } from "../../shared/post-rows";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";

export async function FollowingContent({ cursor }: { cursor?: string }) {
  const page = await getFollowingFeed(cursor);
  return <><PageHeader title="关注 Feed" description="来自你关注的用户和节点，按时间排序。" />{page.items.length ? <PostRows posts={page.items} /> : <EmptyState title="关注 Feed 暂无内容" description="关注用户或节点后，新内容会显示在这里。" />}{page.items.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/following" /></div> : null}</>;
}
