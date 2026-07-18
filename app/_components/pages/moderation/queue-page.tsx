import Link from "next/link";
import { authenticatedGet } from "@/app/_server/authenticated-api";
import { DataTable, EmptyState, PageHeader } from "../../shared/ui";
import type { CaseSummary, NumberPage } from "./types";

export async function ModerationQueuePage() {
  const page = await authenticatedGet<NumberPage<CaseSummary>>(
    "/moderation/cases?page=1&pageSize=100",
  );
  return (
    <>
      <PageHeader title="治理工作台" description="只展示当前 capability 可读取的真实案件。" />
      {page.items.length ? (
        <DataTable
          headers={["案件", "目标", "原因", "优先级", "举报数", "状态"]}
          rows={page.items.map((item) => [
            <Link className="link" href={`/moderation/cases/${encodeURIComponent(item.id)}`} key={item.id}>{item.id}</Link>,
            item.target.label,
            item.reason,
            item.priority,
            item.reportCount,
            item.status,
          ])}
        />
      ) : <EmptyState title="暂无待处理案件" description="当前授权范围内没有案件。" />}
    </>
  );
}
