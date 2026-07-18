import Link from "next/link";
import { getCoinJournals } from "@/app/_server/coin-data";
import { DataTable, EmptyState, PageHeader, Pagination } from "../../shared/ui";
import { CoinTabs } from "./coin-tabs";

export async function CoinLedgerPage({ cursor }: { cursor?: string }) {
  const page = await getCoinJournals(cursor);
  const journals = page.items;
  return (
    <>
      <PageHeader title="透明账本" description="本人可见的金币变动，不改写历史分录。" />
      <CoinTabs active="ledger" />
      {journals.length ? (
        <DataTable
          headers={["时间", "流水号", "类型", "说明", "金额", "状态"]}
          rows={journals.map((item) => [
            new Date(item.occurredAt).toLocaleString("zh-CN"),
            <Link className="link" href={`/coins/ledger/${encodeURIComponent(item.id)}`} key={item.id}>{item.id}</Link>,
            item.type,
            item.description,
            item.amount,
            item.status,
          ])}
        />
      ) : <EmptyState title="暂无金币流水" description="真实金币变动发生后会显示在这里。" />}
      {journals.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/coins/ledger" /></div> : null}
    </>
  );
}
