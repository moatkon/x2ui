import Link from "next/link";
import { notFound } from "next/navigation";
import type { PostSummary } from "@/lib/mock-data";
import { getPublicComments, getPublicPost, type ApiComment } from "@/app/_server/public-content";
import { ActionButton } from "../client/action-button";
import { CommentComposer } from "../client/comment-composer";
import { Avatar } from "../shared/avatar";

function PostBreadcrumbs({ post }: { post: PostSummary }) {
  return <div className="breadcrumbs text-sm"><ul><li><Link href="/">首页</Link></li><li><Link href={`/nodes/${post.nodePath.parentSlug}`}>{post.nodePath.parentName}</Link></li>{post.nodePath.childSlug ? <li><Link href={`/nodes/${post.nodePath.parentSlug}/${post.nodePath.childSlug}`}>{post.nodePath.childName}</Link></li> : null}<li>帖子</li></ul></div>;
}

function PostBody({ bodyMarkdown }: { bodyMarkdown: string }) {
  return <div className="markdown-body whitespace-pre-wrap px-4 py-5 sm:px-6">{bodyMarkdown}</div>;
}

function PostActions({ post }: { post: PostSummary }) {
  return <footer className="flex flex-wrap gap-2 border-t-2 border-base-content/20 px-4 py-4"><ActionButton message="已表达认同" api={{ method: "PUT", path: `/posts/${post.id}/reactions/AGREE` }}>认同 {post.reactionCount}</ActionButton><ActionButton message="已加入收藏" api={{ method: "PUT", path: `/users/me/bookmarks/${post.id}` }}>收藏</ActionButton><ActionButton dialogTitle="用金币感谢这份贡献？" dialogBody={<p>固定成本 2：作者获得 1，另外 1 永久销毁。感谢不会影响排序或治理权。</p>}>金币感谢</ActionButton><ActionButton dialogTitle="为问题设置悬赏" dialogBody={<div><p>固定档位 20 / 50 / 100；发布满 24 小时后可采纳。</p><div className="join mt-4"><button className="btn join-item" type="button">20</button><button className="btn join-item" type="button">50</button><button className="btn join-item" type="button">100</button></div></div>}>设置悬赏</ActionButton><ActionButton className="btn btn-ghost" message="正在打开举报流程" href="/report/new">举报</ActionButton></footer>;
}

function PostArticle({ post, bodyMarkdown }: { post: PostSummary; bodyMarkdown: string }) {
  return <article className="mt-3 overflow-hidden rounded-box border-2 border-base-content/20"><header className="border-b-2 border-base-content/20 px-4 py-5 sm:px-6"><h1 className="text-2xl font-black leading-tight sm:text-3xl">{post.title}</h1><p className="mt-3 text-sm opacity-70">{post.author.displayName} · {post.nodePath.parentName}{post.nodePath.childName ? ` / ${post.nodePath.childName}` : ""} · {post.createdLabel}</p></header><PostBody bodyMarkdown={bodyMarkdown} /><PostActions post={post} /></article>;
}

function CommentActions({ comment }: { comment: ApiComment }) {
  return <div className="mt-3 flex flex-wrap gap-2"><ActionButton className="btn btn-ghost btn-sm" dialogTitle={`回应 ${comment.author.displayName}`} dialogBody={<textarea className="textarea min-h-28 w-full" placeholder="回复提交后不能编辑或删除" />}>回应 {comment.replyCount}</ActionButton><ActionButton className="btn btn-ghost btn-sm" message="已表达认同">认同</ActionButton><ActionButton className="btn btn-ghost btn-sm" dialogTitle="用金币感谢这条回应？" dialogBody={<p>固定成本 2：作者获得 1，系统销毁 1。</p>}>金币感谢</ActionButton><ActionButton className="btn btn-ghost btn-sm" href="/report/new" message="正在打开举报流程">举报</ActionButton></div>;
}

function CommentRow({ comment }: { comment: ApiComment }) {
  return <li className="list-row rounded-none px-4 py-4" id={comment.anchorKey}><Avatar name={comment.author.displayName} image={`user-${comment.author.userName}`} /><div className="list-col-grow"><div className="flex flex-wrap items-center gap-2"><Link className="font-bold" href={`/users/${comment.author.userName}`}>{comment.author.displayName}</Link><time className="text-sm opacity-60" dateTime={comment.createdAt}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(new Date(comment.createdAt))}</time></div><p className="mt-2 whitespace-pre-wrap leading-relaxed">{comment.bodyMarkdown}</p><CommentActions comment={comment} /></div></li>;
}

function CommentList({ count, comments }: { count: number; comments: ApiComment[] }) {
  return <section className="mt-5"><header className="mb-4"><h2 className="text-2xl font-black">评论</h2><p className="opacity-70">共 {count} 条，按时间排序。</p></header><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{comments.map((comment) => <CommentRow comment={comment} key={comment.id} />)}</ul></section>;
}

export async function PostContent({ postId }: { postId: string }) {
  const detail = await getPublicPost(postId);
  if (!detail) notFound();
  const comments = await getPublicComments(detail.post.id);
  return <><PostBreadcrumbs post={detail.post} /><PostArticle post={detail.post} bodyMarkdown={detail.bodyMarkdown} /><CommentComposer postId={detail.post.id} /><CommentList count={detail.post.commentCount} comments={comments} /></>;
}
