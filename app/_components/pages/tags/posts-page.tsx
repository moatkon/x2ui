import { notFound } from "next/navigation";
import { getPublicTagPosts } from "@/app/_server/public-content";
import { PostRows } from "../../shared/post-rows";
import { Pagination } from "../../shared/ui";

export async function TagPostsPage({ slug, cursor }: { slug: string; cursor?: string }) {
  const result = await getPublicTagPosts(slug, cursor);
  if (!result) notFound();

  return (
    <>
      <h1 className="text-3xl font-black"># {result.tag.label}</h1>
      <p className="mt-1 opacity-70">包含此标签的公开帖子。</p>
      <div className="mt-5">
        <PostRows posts={result.page.items} />
      </div>
      {result.page.items.length ? <div className="mt-5"><Pagination nextCursor={result.page.nextCursor} href={`/tags/${encodeURIComponent(slug)}`} /></div> : null}
    </>
  );
}
