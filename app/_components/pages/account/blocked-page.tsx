import { getBlockedUsers } from "@/app/_server/account-data";
import { ActionButton } from "../../client/action-button";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";
import { localDate } from "./account-view-utils";

export async function BlockedPage({ cursor }: { cursor?: string }) {
  const page = await getBlockedUsers(cursor);
  const people = page.items;
  return (
    <>
      <PageHeader title="屏蔽列表" description="屏蔽会减少双方在 Feed、搜索、提及和通知中的相互可见。" />
      {people.length === 0 ? (
        <EmptyState title="屏蔽列表为空" description="你屏蔽的用户会显示在这里。" />
      ) : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {people.map(({ user, blockedAt }) => (
            <li className="list-row rounded-none" key={user.id}>
              <div className="flex size-10 items-center justify-center rounded-full bg-base-300 font-bold" aria-hidden>
                {user.displayName.slice(0, 1)}
              </div>
              <div className="list-col-grow">
                <p className="font-bold">
                  {user.displayName} <span className="font-normal opacity-60">@{user.userName}</span>
                </p>
                <p className="text-sm opacity-65">屏蔽于 {localDate(blockedAt)}</p>
              </div>
              <ActionButton
                className="btn btn-sm"
                message="已解除屏蔽"
                api={{ method: "DELETE", path: `/users/me/blocked-users/${encodeURIComponent(user.userName)}` }}
              >
                解除屏蔽
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
      {people.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/settings/blocked" /></div> : null}
    </>
  );
}
