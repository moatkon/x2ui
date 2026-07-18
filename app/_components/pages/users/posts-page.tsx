import { getPublicUserPosts } from "@/app/_server/public-content";
import { PostRows } from "../../shared/post-rows";
import { Pagination } from "../../shared/ui";
import {
  loadPublicUserProfile,
  UserProfileShell,
} from "./user-profile-shell";

export async function UserPostsPage({ userName, cursor }: { userName: string; cursor?: string }) {
  const [profile, page] = await Promise.all([
    loadPublicUserProfile(userName),
    getPublicUserPosts(userName, cursor),
  ]);

  return (
    <UserProfileShell profile={profile} active="posts">
      <PostRows posts={page.items} />
      {page.items.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href={`/users/${encodeURIComponent(userName)}/posts`} /></div> : null}
    </UserProfileShell>
  );
}
