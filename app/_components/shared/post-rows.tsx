import Link from "next/link";
import { posts as mockPosts, type PostSummary } from "@/lib/mock-data";
import { Avatar } from "./avatar";
import { EmptyState } from "./ui";

export function PostRows({ posts = mockPosts, filter, framed = true }: { posts?: PostSummary[]; filter?: (post: PostSummary) => boolean; framed?: boolean }) {
  const list = filter ? posts.filter(filter) : posts;
  if (list.length === 0) return <EmptyState title="暂时没有公开帖子" description="这个范围内还没有可见内容，可以稍后再来看看。" />;
  return (
    <ul className={`list x2-list overflow-hidden ${framed ? "rounded-box border-2 border-base-content/20" : ""}`}>
      {list.map((post) => (
        <li className="list-row rounded-none px-4 py-4 sm:px-5" key={post.id}>
          <Avatar name={post.author.displayName} image={`user-${post.author.userName}`} />
          <div className="list-col-grow min-w-0">
            <Link className="text-base font-bold leading-snug hover:underline" href={`/posts/${post.id}`}>{post.title}</Link>
            <p className="mt-1 line-clamp-2 opacity-75">{post.excerpt}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm opacity-70">
              <Link className="link link-hover" href={`/users/${post.author.userName}`}>{post.author.displayName}</Link>
              <span>·</span>
              <Link className="link link-hover" href={`/nodes/${post.nodePath.parentSlug}`}>{post.nodePath.parentName}</Link>
              {post.nodePath.childSlug ? <><span>/</span><Link className="link link-hover" href={`/nodes/${post.nodePath.parentSlug}/${post.nodePath.childSlug}`}>{post.nodePath.childName}</Link></> : null}
              <span>·</span><span>{post.createdLabel}</span>
            </div>
          </div>
          <div className="hidden shrink-0 text-right text-sm sm:block"><p>💬 {post.commentCount}</p><p className="mt-2">♡ {post.reactionCount}</p></div>
        </li>
      ))}
    </ul>
  );
}
