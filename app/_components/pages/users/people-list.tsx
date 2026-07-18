import Link from "next/link";
import type { ApiPublicUserSummary } from "@/app/_server/public-content";
import { Avatar } from "../../shared/avatar";
import { EmptyState } from "../../shared/ui";

export type UserRelationship = "following" | "followers";

export function PeopleList({
  people,
  relationship,
}: {
  people: ApiPublicUserSummary[];
  relationship: UserRelationship;
}) {
  if (people.length === 0) {
    return (
      <EmptyState
        title={
          relationship === "following" ? "还没有公开关注" : "还没有公开粉丝"
        }
        description="此分区当前没有可公开展示的用户。"
      />
    );
  }

  return (
    <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
      {people.map((person) => (
        <li className="list-row rounded-none" key={person.id}>
          <Avatar name={person.displayName} src={person.avatarUrl} />
          <div className="list-col-grow">
            <Link
              className="font-bold hover:underline"
              href={`/users/${person.userName}`}
            >
              {person.displayName}
            </Link>
            <p className="text-sm opacity-65">@{person.userName}</p>
          </div>
          <Link
            className="btn btn-soft btn-sm"
            href={`/users/${person.userName}`}
          >
            {relationship === "following" ? "已关注" : "查看"}
          </Link>
        </li>
      ))}
    </ul>
  );
}
