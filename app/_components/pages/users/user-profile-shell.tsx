import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicUser, type ApiPublicUser } from "@/app/_server/public-content";
import { ActionButton } from "../../client/action-button";
import { Avatar } from "../../shared/avatar";
import { PageTabs } from "../../shared/ui";

export type UserSection =
  | "profile"
  | "posts"
  | "comments"
  | "following"
  | "followers";

const sections: ReadonlyArray<[UserSection, string]> = [
  ["profile", "公开资料"],
  ["posts", "帖子"],
  ["comments", "评论"],
  ["following", "关注"],
  ["followers", "粉丝"],
];

export function UserProfileShell({
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
            <Avatar
              name={user.displayName}
              src={user.avatarUrl}
              sizeClass="size-20"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black">
                {user.displayName}{" "}
                <span className="text-base font-normal opacity-60">
                  @{user.userName}
                </span>
              </h1>
              <p className="mt-1 opacity-70">
                {profile.location || "未公开所在地"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                message={`已关注${user.displayName}`}
                api={{
                  method: "PUT",
                  path: `/users/me/followed-users/${encodeURIComponent(user.userName)}`,
                }}
              >
                关注
              </ActionButton>
              <ActionButton
                message={`已屏蔽 @${user.userName}`}
                api={{
                  method: "PUT",
                  path: `/users/me/blocked-users/${encodeURIComponent(user.userName)}`,
                }}
              >
                屏蔽
              </ActionButton>
              <Link
                className="btn btn-ghost"
                href={`/report/new?targetType=USER&targetId=${encodeURIComponent(user.id)}`}
              >
                举报
              </Link>
            </div>
          </div>
        </header>
        <div className="border-t-2 border-base-content/20 px-3">
          <PageTabs
            items={sections.map(([key, label]) => ({
              label,
              href: `/users/${user.userName}${key === "profile" ? "" : `/${key}`}`,
              active: active === key,
            }))}
            label="用户公开分区"
          />
        </div>
      </section>
      <div className="mt-5">{children}</div>
    </>
  );
}

export async function loadPublicUserProfile(userName: string) {
  const profile = await getPublicUser(userName);
  if (!profile) notFound();
  return profile;
}
