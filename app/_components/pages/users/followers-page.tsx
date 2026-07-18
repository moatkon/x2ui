import { UserRelationshipPage } from "./relationship-page";

export function UserFollowersPage({ userName, cursor }: { userName: string; cursor?: string }) {
  return (
    <UserRelationshipPage userName={userName} relationship="followers" cursor={cursor} />
  );
}
