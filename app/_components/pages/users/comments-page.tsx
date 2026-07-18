import Link from "next/link";
import { getPublicUserComments } from "@/app/_server/public-content";
import { EmptyState, Pagination } from "../../shared/ui";
import {
  loadPublicUserProfile,
  UserProfileShell,
} from "./user-profile-shell";

export async function UserCommentsPage({ userName, cursor }: { userName: string; cursor?: string }) {
  const [profile, page] = await Promise.all([
    loadPublicUserProfile(userName),
    getPublicUserComments(userName, cursor),
  ]);
  const comments = page.items;

  return (
    <UserProfileShell profile={profile} active="comments">
      {comments.length === 0 ? (
        <EmptyState
          title="还没有公开评论"
          description="这位用户暂时没有可见的评论。"
        />
      ) : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {comments.map((comment) => (
            <li className="list-row rounded-none" key={comment.id}>
              <div>
                <Link
                  className="font-bold hover:underline"
                  href={`/posts/${comment.postId}#${comment.anchorKey}`}
                >
                  查看原讨论
                </Link>
                <p className="mt-2 whitespace-pre-wrap">
                  {comment.bodyMarkdown}
                </p>
                <time
                  className="mt-2 block text-sm opacity-60"
                  dateTime={comment.createdAt}
                >
                  {new Intl.DateTimeFormat("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Shanghai",
                  }).format(new Date(comment.createdAt))}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
      {comments.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href={`/users/${encodeURIComponent(userName)}/comments`} /></div> : null}
    </UserProfileShell>
  );
}
