import { getPublicRelationshipUsers } from "@/app/_server/public-content";
import { PeopleList, type UserRelationship } from "./people-list";
import { Pagination } from "../../shared/ui";
import {
  loadPublicUserProfile,
  UserProfileShell,
} from "./user-profile-shell";

export async function UserRelationshipPage({
  userName,
  relationship,
  cursor,
}: {
  userName: string;
  relationship: UserRelationship;
  cursor?: string;
}) {
  const [profile, page] = await Promise.all([
    loadPublicUserProfile(userName),
    getPublicRelationshipUsers(userName, relationship, cursor),
  ]);

  return (
    <UserProfileShell profile={profile} active={relationship}>
      <PeopleList people={page.items} relationship={relationship} />
      {page.items.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href={`/users/${encodeURIComponent(userName)}/${relationship}`} /></div> : null}
    </UserProfileShell>
  );
}
