import Link from "next/link";
import { notFound } from "next/navigation";
import { comments, posts, type PostSummary } from "@/lib/mock-data";
import { ActionButton } from "../client/action-button";
import { CommentComposer } from "../client/comment-composer";
import { Avatar } from "../shared/avatar";

function PostBreadcrumbs({ post }: { post: PostSummary }) {
  return <div className="breadcrumbs text-sm"><ul><li><Link href="/">首页</Link></li><li><Link href={`/nodes/${post.nodePath.parentSlug}`}>{post.nodePath.parentName}</Link></li>{post.nodePath.childSlug ? <li><Link href={`/nodes/${post.nodePath.parentSlug}/${post.nodePath.childSlug}`}>{post.nodePath.childName}</Link></li> : null}<li>帖子</li></ul></div>;
}

function PostBody() {
  return <div className="markdown-body px-4 py-5 sm:px-6"><p>社区里的表达一旦进入公共讨论，就会成为其他回应的上下文。允许作者随时改写，会让后续回复失去依据，也可能伤害讨论记录的可信度。</p><h2>不可变，不等于不治理</h2><p>原始内容保持不变，同时通过可见性状态处理风险：违规内容可以被隐藏，帖子可以被锁定，用户可以申诉，治理动作则进入不可变审计记录。</p><ul><li>发布前提供草稿、预览和明确确认；</li><li>发布后不提供编辑、删除或撤回入口；</li><li>举报和处置都保留上下文与进度。</li></ul><p>这种边界让创作者在提交前更谨慎，也让参与者知道自己回应的是一份稳定记录。</p></div>;
}

function PostActions({ post }: { post: PostSummary }) {
  return <footer className="flex flex-wrap gap-2 border-t-2 border-base-content/20 px-4 py-4"><ActionButton message="已表达认同" api={{ method: "PUT", path: `/posts/${post.id}/reactions/AGREE` }}>认同 {post.reactionCount}</ActionButton><ActionButton message="已加入收藏" api={{ method: "PUT", path: `/users/me/bookmarks/${post.id}` }}>收藏</ActionButton><ActionButton dialogTitle="用金币感谢这份贡献？" dialogBody={<p>固定成本 2：作者获得 1，另外 1 永久销毁。感谢不会影响排序或治理权。</p>}>金币感谢</ActionButton><ActionButton dialogTitle="为问题设置悬赏" dialogBody={<div><p>固定档位 20 / 50 / 100；发布满 24 小时后可采纳。</p><div className="join mt-4"><button className="btn join-item" type="button">20</button><button className="btn join-item" type="button">50</button><button className="btn join-item" type="button">100</button></div></div>}>设置悬赏</ActionButton><ActionButton className="btn btn-ghost" message="正在打开举报流程" href="/report/new">举报</ActionButton></footer>;
}

function PostArticle({ post }: { post: PostSummary }) {
  return <article className="mt-3 overflow-hidden rounded-box border-2 border-base-content/20"><header className="border-b-2 border-base-content/20 px-4 py-5 sm:px-6"><h1 className="text-2xl font-black leading-tight sm:text-3xl">{post.title}</h1><p className="mt-3 text-sm opacity-70">{post.author.displayName} · {post.nodePath.parentName} / {post.nodePath.childName} · {post.createdLabel}</p></header><PostBody /><PostActions post={post} /></article>;
}

function CommentActions({ comment }: { comment: (typeof comments)[number] }) {
  return <div className="mt-3 flex flex-wrap gap-2"><ActionButton className="btn btn-ghost btn-sm" dialogTitle={`回应 ${comment.author.displayName}`} dialogBody={<textarea className="textarea min-h-28 w-full" placeholder="回复提交后不能编辑或删除" />}>回应 {comment.replyCount}</ActionButton><ActionButton className="btn btn-ghost btn-sm" message="已表达认同">认同</ActionButton><ActionButton className="btn btn-ghost btn-sm" dialogTitle="用金币感谢这条回应？" dialogBody={<p>固定成本 2：作者获得 1，系统销毁 1。</p>}>金币感谢</ActionButton><ActionButton className="btn btn-ghost btn-sm" href="/report/new" message="正在打开举报流程">举报</ActionButton></div>;
}

function CommentRow({ comment }: { comment: (typeof comments)[number] }) {
  return <li className="list-row rounded-none px-4 py-4"><Avatar name={comment.author.displayName} image={`user-${comment.author.userName}`} /><div className="list-col-grow"><div className="flex flex-wrap items-center gap-2"><Link className="font-bold" href={`/users/${comment.author.userName}`}>{comment.author.displayName}</Link><span className="text-sm opacity-60">{comment.id === "comment-1" ? "8 分钟前" : "2 分钟前"}</span></div><p className="mt-2 leading-relaxed">{comment.bodyMarkdown}</p><CommentActions comment={comment} /></div></li>;
}

function CommentList({ count }: { count: number }) {
  return <section className="mt-5"><header className="mb-4"><h2 className="text-2xl font-black">评论</h2><p className="opacity-70">共 {count} 条，按时间排序。</p></header><ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{comments.map((comment) => <CommentRow comment={comment} key={comment.id} />)}</ul></section>;
}

export function PostContent({ postId }: { postId: string }) {
  const post = posts.find((item) => item.id === postId);
  if (!post) notFound();
  return <><PostBreadcrumbs post={post} /><PostArticle post={post} /><CommentComposer postId={post.id} /><CommentList count={post.commentCount} /></>;
}
