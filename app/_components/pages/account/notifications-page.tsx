import Link from "next/link";
import { getNotifications } from "@/app/_server/account-data";
import { ActionButton } from "../../client/action-button";
import { EmptyState, PageHeader, Pagination, Panel } from "../../shared/ui";
import { localDate } from "./account-view-utils";

export async function NotificationsContent({ cursor }: { cursor?: string }) {
  const page = await getNotifications(cursor);
  const items = page.items;
  const newest = items[0]?.createdAt;
  return (
    <>
      <PageHeader title="通知中心" description="回复、提及、关注、治理与账户安全消息。" action={newest ? <ActionButton message="已将通知标为已读" api={{ method: "PUT", path: "/notifications/read-cursor", body: { readThrough: newest } }}>全部标为已读</ActionButton> : undefined} />
      {items.length === 0 ? <EmptyState title="暂无通知" description="新的互动、治理进展和安全提醒会显示在这里。" /> : (
        <Panel title="通知">
          <ul className="list x2-list -m-5 sm:-m-5">
            {items.map((item) => (
              <li className="list-row rounded-none" key={item.id}>
                <span className={`status ${item.readAt ? "" : "status-primary"}`} aria-label={item.readAt ? "已读" : "未读"} />
                <div className="list-col-grow min-w-0"><Link className="font-bold hover:underline" href={`${item.deepLink.route}${item.deepLink.anchorKey ? `#${encodeURIComponent(item.deepLink.anchorKey)}` : ""}`}>{item.title}</Link><p className="mt-1 opacity-70">{item.summary}</p><p className="mt-2 text-sm opacity-55">{localDate(item.createdAt)}</p></div>
                {!item.readAt ? <ActionButton className="btn btn-ghost btn-sm" message="已标为已读" api={{ method: "PUT", path: `/notifications/${encodeURIComponent(item.id)}/read-state`, body: { read: true } }}>标为已读</ActionButton> : <span className="badge badge-outline">已读</span>}
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {items.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/notifications" /></div> : null}
    </>
  );
}
