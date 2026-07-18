import Link from "next/link";
import { getDrafts } from "@/app/_server/account-data";
import { ActionButton } from "../../client/action-button";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";
import { localDate } from "./account-view-utils";

export async function DraftsContent({ cursor }: { cursor?: string }) {
  const page = await getDrafts(cursor);
  const drafts = page.items;
  return (
    <>
      <PageHeader title="我的草稿" description="草稿可在发布前修改或放弃。" action={<Link className="btn btn-primary" href="/compose">新建草稿</Link>} />
      {drafts.length === 0 ? <EmptyState title="还没有草稿" description="新建内容后，可先保存为草稿再发布。" action={<Link className="btn btn-primary" href="/compose">新建草稿</Link>} /> : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {drafts.map((draft) => (
            <li className="list-row rounded-none" key={draft.id}>
              <div className="list-col-grow min-w-0"><Link className="font-bold hover:underline" href={`/compose?draft=${encodeURIComponent(draft.id)}`}>{draft.title || "未命名草稿"}</Link><p className="mt-1 text-sm opacity-65">保存于 {localDate(draft.updatedAt)}</p></div>
              <span className="badge badge-outline">{draft.completionPercent}%</span>
              <ActionButton className="btn btn-ghost btn-sm" message="草稿已放弃" api={{ method: "DELETE", path: `/drafts/${encodeURIComponent(draft.id)}`, ifMatch: `"${draft.version}"` }}>放弃</ActionButton>
            </li>
          ))}
        </ul>
      )}
      {drafts.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/drafts" /></div> : null}
    </>
  );
}
