import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicRelationshipUsers,
  getPublicUser,
  getPublicUserComments,
  getPublicUserPosts,
  type ApiPublicUser,
  type ApiPublicUserSummary,
} from "@/app/_server/public-content";
import { ActionButton } from "../client/action-button";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { EmptyState, PageTabs, Panel } from "../shared/ui";

type UserSection = "profile" | "posts" | "comments" | "following" | "followers";
const sections: ReadonlyArray<[UserSection, string]> = [
  ["profile", "公开资料"],
  ["posts", "帖子"],
  ["comments", "评论"],
  ["following", "关注"],
  ["followers", "粉丝"],
];

function UserProfileShell({
  profile,
  active,
  children,
}: {
  profile: ApiPublicUser;
  active: UserSection;
  children: React.ReactNode;
}) {
  const { user } = profile;
  return (
    <>
      <section className="overflow-hidden rounded-box border-2 border-base-content/20">
        <header className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={user.displayName} image={`user-${user.userName}`} sizeClass="size-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black">{user.displayName} <span className="text-base font-normal opacity-60">@{user.userName}</span></h1>
              <p className="mt-1 opacity-70">{profile.location || "未公开所在地"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton message={`已关注${user.displayName}`} api={{ method: "PUT", path: `/users/me/followed-users/${encodeURIComponent(user.userName)}` }}>关注</ActionButton>
              <ActionButton message={`已屏蔽 @${user.userName}`} api={{ method: "PUT", path: `/users/me/blocked-users/${encodeURIComponent(user.userName)}` }}>屏蔽</ActionButton>
              <Link className="btn btn-ghost" href={`/report/new?targetType=USER&targetId=${encodeURIComponent(user.id)}`}>举报</Link>
            </div>
          </div>
        </header>
        <div className="border-t-2 border-base-content/20 px-3">
          <PageTabs items={sections.map(([key, label]) => ({
            label,
            href: `/users/${user.userName}${key === "profile" ? "" : `/${key}`}`,
            active: active === key,
          }))} label="用户公开分区" />
        </div>
      </section>
      <div className="mt-5">{children}</div>
    </>
  );
}

async function loadProfile(userName: string) {
  const profile = await getPublicUser(userName);
  if (!profile) notFound();
  return profile;
}

export async function UserProfilePage({ userName }: { userName: string }) {
  const profile = await loadProfile(userName);
  const joined = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", timeZone: "Asia/Shanghai" }).format(new Date(profile.joinedAt));
  return (
    <UserProfileShell profile={profile} active="profile">
      <Panel title="关于">
        <p className="leading-relaxed">{profile.bio || "这位用户还没有填写公开简介。"}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[["加入时间", joined], ["帖子", profile.stats.postCount], ["关注", profile.stats.followingCount], ["粉丝", profile.stats.followerCount]].map(([label, value]) => (
            <div key={label}><dt className="opacity-60">{label}</dt><dd className="font-semibold">{value}</dd></div>
          ))}
        </dl>
      </Panel>
    </UserProfileShell>
  );
}

export async function UserPostsPage({ userName }: { userName: string }) {
  const [profile, posts] = await Promise.all([loadProfile(userName), getPublicUserPosts(userName)]);
  return <UserProfileShell profile={profile} active="posts"><PostRows posts={posts} /></UserProfileShell>;
}

export async function UserCommentsPage({ userName }: { userName: string }) {
  const [profile, comments] = await Promise.all([loadProfile(userName), getPublicUserComments(userName)]);
  return (
    <UserProfileShell profile={profile} active="comments">
      {comments.length === 0 ? <EmptyState title="还没有公开评论" description="这位用户暂时没有可见的评论。" /> : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {comments.map((comment) => (
            <li className="list-row rounded-none" key={comment.id}>
              <div>
                <Link className="font-bold hover:underline" href={`/posts/${comment.postId}#${comment.anchorKey}`}>查看原讨论</Link>
                <p className="mt-2 whitespace-pre-wrap">{comment.bodyMarkdown}</p>
                <time className="mt-2 block text-sm opacity-60" dateTime={comment.createdAt}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(new Date(comment.createdAt))}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </UserProfileShell>
  );
}

function PeopleList({ people, relationship }: { people: ApiPublicUserSummary[]; relationship: "following" | "followers" }) {
  if (people.length === 0) return <EmptyState title={relationship === "following" ? "还没有公开关注" : "还没有公开粉丝"} description="此分区当前没有可公开展示的用户。" />;
  return (
    <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
      {people.map((person) => (
        <li className="list-row rounded-none" key={person.id}>
          <Avatar name={person.displayName} image={`user-${person.userName}`} />
          <div className="list-col-grow"><Link className="font-bold hover:underline" href={`/users/${person.userName}`}>{person.displayName}</Link><p className="text-sm opacity-65">@{person.userName}</p></div>
          <Link className="btn btn-soft btn-sm" href={`/users/${person.userName}`}>{relationship === "following" ? "已关注" : "查看"}</Link>
        </li>
      ))}
    </ul>
  );
}

async function UserRelationshipPage({ userName, relationship }: { userName: string; relationship: "following" | "followers" }) {
  const [profile, people] = await Promise.all([loadProfile(userName), getPublicRelationshipUsers(userName, relationship)]);
  return <UserProfileShell profile={profile} active={relationship}><PeopleList people={people} relationship={relationship} /></UserProfileShell>;
}

export function UserFollowingPage({ userName }: { userName: string }) {
  return <UserRelationshipPage userName={userName} relationship="following" />;
}

export function UserFollowersPage({ userName }: { userName: string }) {
  return <UserRelationshipPage userName={userName} relationship="followers" />;
}
