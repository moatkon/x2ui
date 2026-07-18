import Link from "next/link";
import { getPublicTags } from "@/app/_server/public-content";
import { Pagination } from "../../shared/ui";

export async function TagsDirectoryPage({ cursor }: { cursor?: string }) {
  const page = await getPublicTags(cursor);
  const tags = page.items;

  return (
    <>
      <h1 className="text-3xl font-black">标签</h1>
      <p className="mt-1 opacity-70">从具体话题进入跨节点讨论。</p>
      <ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">
        {tags.map((tag) => (
          <li className="list-row rounded-none" key={tag.slug}>
            <div className="list-col-grow">
              <Link
                className="font-bold"
                href={`/tags/${encodeURIComponent(tag.slug)}`}
              >
                # {tag.label}
              </Link>
              <p className="mt-1 text-sm opacity-65">
                {tag.publicPostCount} 个公开帖子
              </p>
            </div>
            <span aria-hidden>›</span>
          </li>
        ))}
      </ul>
      {tags.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/tags" /></div> : null}
    </>
  );
}
