import Link from "next/link";
import { notFound } from "next/navigation";
import type { PostSummary } from "@/lib/models";
import {
  getPublicComments,
  getPublicCommentReplies,
  getPublicPost,
  type ApiComment,
} from "@/app/_server/public-content";
import { ActionButton } from "../client/action-button";
import { CommentComposer } from "../client/comment-composer";
import { CoinThankButton, ReplyButton } from "../client/content-actions";
import { Avatar } from "../shared/avatar";
import { Pagination } from "../shared/ui";

function PostBreadcrumbs({ post }: { post: PostSummary }) {
  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <Link href="/">首页</Link>
        </li>
        <li>
          <Link href={`/nodes/${post.nodePath.parentSlug}`}>
            {post.nodePath.parentName}
          </Link>
        </li>
        {post.nodePath.childSlug ? (
          <li>
            <Link
              href={`/nodes/${post.nodePath.parentSlug}/${post.nodePath.childSlug}`}
            >
              {post.nodePath.childName}
            </Link>
          </li>
        ) : null}
        <li>帖子</li>
      </ul>
    </div>
  );
}

function PostBody({ bodyMarkdown }: { bodyMarkdown: string }) {
  return (
    <div className="markdown-body whitespace-pre-wrap px-4 py-5 sm:px-6">
      {bodyMarkdown}
    </div>
  );
}

function PostActions({ post }: { post: PostSummary }) {
  return (
    <footer className="flex flex-wrap gap-2 border-t-2 border-base-content/20 px-4 py-4">
      <ActionButton
        message="已表达认同"
        api={{ method: "PUT", path: `/posts/${post.id}/reactions/AGREE` }}
      >
        认同 {post.reactionCount}
      </ActionButton>
      <ActionButton
        message="已加入收藏"
        api={{ method: "PUT", path: `/users/me/bookmarks/${post.id}` }}
      >
        收藏
      </ActionButton>
      <CoinThankButton targetType="POST" targetId={post.id} />
      <ActionButton
        href={`/coins/bounties?postId=${encodeURIComponent(post.id)}`}
        message="正在打开悬赏"
      >
        设置悬赏
      </ActionButton>
      <ActionButton
        className="btn btn-ghost"
        message="正在打开举报流程"
        href={`/report/new?targetType=POST&targetId=${encodeURIComponent(post.id)}`}
      >
        举报
      </ActionButton>
    </footer>
  );
}

function PostArticle({
  post,
  bodyMarkdown,
}: {
  post: PostSummary;
  bodyMarkdown: string;
}) {
  return (
    <article className="mt-3 overflow-hidden rounded-box border-2 border-base-content/20">
      <header className="border-b-2 border-base-content/20 px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-black leading-tight sm:text-3xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm opacity-70">
          {post.author.displayName} · {post.nodePath.parentName}
          {post.nodePath.childName
            ? ` / ${post.nodePath.childName}`
            : ""} · {post.createdLabel}
        </p>
      </header>
      <PostBody bodyMarkdown={bodyMarkdown} />
      <PostActions post={post} />
    </article>
  );
}

function CommentActions({ comment }: { comment: ApiComment }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <ReplyButton
        commentId={comment.id}
        replyCount={comment.replyCount}
        authorName={comment.author.displayName}
      />
      <ActionButton
        className="btn btn-ghost btn-sm"
        message="已表达认同"
        api={{
          method: "PUT",
          path: `/comments/${encodeURIComponent(comment.id)}/reactions/AGREE`,
          body: {},
        }}
      >
        认同
      </ActionButton>
      <CoinThankButton
        className="btn btn-ghost btn-sm"
        targetType="COMMENT"
        targetId={comment.id}
      />
      <ActionButton
        className="btn btn-ghost btn-sm"
        href={`/report/new?targetType=COMMENT&targetId=${encodeURIComponent(comment.id)}`}
        message="正在打开举报流程"
      >
        举报
      </ActionButton>
    </div>
  );
}

type ReplyPage = {
  commentId: string;
  items: ApiComment[];
  nextCursor?: string;
};

function CommentRow({
  comment,
  replies,
  postHref,
}: {
  comment: ApiComment;
  replies?: ReplyPage;
  postHref: string;
}) {
  return (
    <li className="list-row rounded-none px-4 py-4" id={comment.anchorKey}>
      <Avatar
        name={comment.author.displayName}
        src={comment.author.avatarUrl}
      />
      <div className="list-col-grow">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="font-bold"
            href={`/users/${comment.author.userName}`}
          >
            {comment.author.displayName}
          </Link>
          <time className="text-sm opacity-60" dateTime={comment.createdAt}>
            {new Intl.DateTimeFormat("zh-CN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Shanghai",
            }).format(new Date(comment.createdAt))}
          </time>
        </div>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">
          {comment.bodyMarkdown}
        </p>
        <CommentActions comment={comment} />
        {comment.replyCount > 0 ? (
          <div className="mt-3">
            <Link
              className="link text-sm"
              href={`${postHref}${postHref.includes("?") ? "&" : "?"}replyTo=${encodeURIComponent(comment.id)}#${encodeURIComponent(comment.anchorKey)}`}
            >
              {replies ? "已展开回应" : `查看 ${comment.replyCount} 条回应`}
            </Link>
          </div>
        ) : null}
        {replies ? (
          <div className="mt-4 border-l-2 border-base-content/20 pl-4">
            <ul className="space-y-4">
              {replies.items.map((reply) => (
                <li key={reply.id}>
                  <p className="font-semibold">{reply.author.displayName}</p>
                  <p className="mt-1 whitespace-pre-wrap">{reply.bodyMarkdown}</p>
                  <time className="text-xs opacity-60" dateTime={reply.createdAt}>
                    {new Intl.DateTimeFormat("zh-CN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Shanghai",
                    }).format(new Date(reply.createdAt))}
                  </time>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Pagination
                nextCursor={replies.nextCursor}
                href={`${postHref}${postHref.includes("?") ? "&" : "?"}replyTo=${encodeURIComponent(comment.id)}`}
                cursorParam="replyCursor"
              />
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function CommentList({
  count,
  comments,
  replies,
  postHref,
}: {
  count: number;
  comments: ApiComment[];
  replies?: ReplyPage;
  postHref: string;
}) {
  return (
    <section className="mt-5">
      <header className="mb-4">
        <h2 className="text-2xl font-black">评论</h2>
        <p className="opacity-70">共 {count} 条，按时间排序。</p>
      </header>
      <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
        {comments.map((comment) => (
          <CommentRow
            comment={comment}
            replies={replies?.commentId === comment.id ? replies : undefined}
            postHref={postHref}
            key={comment.id}
          />
        ))}
      </ul>
    </section>
  );
}

export async function PostContent({
  postId,
  cursor,
  replyTo,
  replyCursor,
}: {
  postId: string;
  cursor?: string;
  replyTo?: string;
  replyCursor?: string;
}) {
  const detail = await getPublicPost(postId);
  if (!detail) notFound();
  const [comments, replyPage] = await Promise.all([
    getPublicComments(detail.post.id, cursor),
    replyTo ? getPublicCommentReplies(replyTo, replyCursor) : Promise.resolve(null),
  ]);
  const postHref = `/posts/${encodeURIComponent(postId)}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
  const replies = replyPage && replyTo
    ? { commentId: replyTo, items: replyPage.items, nextCursor: replyPage.nextCursor }
    : undefined;
  return (
    <>
      <PostBreadcrumbs post={detail.post} />
      <PostArticle post={detail.post} bodyMarkdown={detail.bodyMarkdown} />
      <CommentComposer postId={detail.post.id} />
      <CommentList count={detail.post.commentCount} comments={comments.items} replies={replies} postHref={postHref} />
      {comments.items.length ? <div className="mt-5"><Pagination nextCursor={comments.nextCursor} href={`/posts/${encodeURIComponent(postId)}`} /></div> : null}
    </>
  );
}
