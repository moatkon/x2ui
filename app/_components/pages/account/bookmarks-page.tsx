import { getMyBookmarks } from "@/app/_server/authenticated-api";
import { PostRows } from "../../shared/post-rows";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";

export async function BookmarksContent({ cursor }: { cursor?: string }) {
  const page = await getMyBookmarks(cursor);
  return <><PageHeader title="我的收藏" description="保存下来，稍后继续阅读。" />{page.items.length ? <PostRows posts={page.items} /> : <EmptyState title="还没有收藏" description="收藏的帖子会显示在这里。" />}{page.items.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/bookmarks" /></div> : null}</>;
}
