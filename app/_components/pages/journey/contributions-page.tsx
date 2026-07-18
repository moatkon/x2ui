import { getContributions } from "@/app/_server/journey-data";
import { DataTable, EmptyState, PageHeader, Pagination } from "../../shared/ui";

export async function JourneyContributionsPage({ cursor }: { cursor?: string }) {
  const page = await getContributions(cursor);
  const rows = page.items;
  return (
    <>
      <PageHeader title="贡献记录" description="只展示由后端确认的贡献与结算状态。" />
      {rows.length ? <DataTable headers={["时间", "节点", "影响", "质量", "CXP", "金币候选"]} rows={rows.map((item) => [
        new Date(item.occurredAt).toLocaleDateString("zh-CN"),
        item.node.name,
        item.impact,
        item.qualityState,
        item.cxpState,
        item.coinCandidateState,
      ])} /> : <EmptyState title="暂无贡献" description="已确认的贡献会显示在这里。" />}
      {rows.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/me/contributions" /></div> : null}
    </>
  );
}
