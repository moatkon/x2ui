import Link from "next/link";
import { authenticatedGet } from "@/app/_server/authenticated-api";
import { DataTable, EmptyState, PageHeader } from "../../shared/ui";
import type { CoinRiskCase, NumberPage } from "./admin-types";

export async function CoinModerationPage() {
  const page = await authenticatedGet<NumberPage<CoinRiskCase>>("/moderation/coin-cases?page=1&pageSize=100");
  return (
    <>
      <PageHeader title="金币风险案件" description="只展示后端授权的风险调查案件。" />
      {page.items.length ? (
        <DataTable
          headers={["案件", "类型", "金额", "SLA", "状态"]}
          rows={page.items.map((item) => [
            <Link className="link" href={`/moderation/coins/cases/${encodeURIComponent(item.id)}`} key={item.id}>{item.id}</Link>,
            item.type,
            item.amount,
            new Date(item.slaDueAt).toLocaleString("zh-CN"),
            item.status,
          ])}
        />
      ) : <EmptyState title="暂无风险案件" description="授权范围内没有待处理案件。" />}
    </>
  );
}
