import { getCollections } from "@/app/_server/journey-data";
import { ActionButton } from "../../client/action-button";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";

export async function JourneyCollectionPage({ cursor }: { cursor?: string }) {
  const page = await getCollections(cursor);
  const rows = page.items;
  return (
    <>
      <PageHeader title="贡献收藏" description="收藏只纪念真实贡献，不提供功能优势。" />
      {rows.length ? (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {rows.map((item) => (
            <li className="list-row rounded-none" key={item.id}>
              <div className="list-col-grow"><p className="font-bold">{item.name}</p><p className="text-sm opacity-65">{item.description}</p></div>
              <ActionButton className="btn btn-sm" message={item.displayed ? "已隐藏收藏" : "已展示收藏"} api={{ method: item.displayed ? "DELETE" : "PUT", path: `/users/me/collection-displays/${encodeURIComponent(item.id)}`, body: item.displayed ? undefined : {} }}>{item.displayed ? "隐藏" : "展示"}</ActionButton>
            </li>
          ))}
        </ul>
      ) : <EmptyState title="暂无收藏" description="符合条件的贡献收藏会显示在这里。" />}
      {rows.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/me/collection" /></div> : null}
    </>
  );
}
