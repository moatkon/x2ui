import { Panel } from "../../shared/ui";
import {
  loadPublicUserProfile,
  UserProfileShell,
} from "./user-profile-shell";

export async function UserProfilePage({ userName }: { userName: string }) {
  const profile = await loadPublicUserProfile(userName);
  const joined = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    timeZone: "Asia/Shanghai",
  }).format(new Date(profile.joinedAt));

  return (
    <UserProfileShell profile={profile} active="profile">
      <Panel title="关于">
        <p className="leading-relaxed">
          {profile.bio || "这位用户还没有填写公开简介。"}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["加入时间", joined],
            ["帖子", profile.stats.postCount],
            ["关注", profile.stats.followingCount],
            ["粉丝", profile.stats.followerCount],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="opacity-60">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </UserProfileShell>
  );
}
