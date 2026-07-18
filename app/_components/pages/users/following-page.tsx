import { UserRelationshipPage } from "./relationship-page";

export function UserFollowingPage({ userName, cursor }: { userName: string; cursor?: string }) {
  return (
    <UserRelationshipPage userName={userName} relationship="following" cursor={cursor} />
  );
}
