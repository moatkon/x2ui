import { authenticatedGet } from "@/app/_server/authenticated-api";
import { Breadcrumbs, DataTable, EmptyState, PageHeader, Panel } from "../../shared/ui";
import type { Reconciliation } from "./admin-types";

export async function CoinReconciliationDetail({ id }: { id: string }) {
  const item = await authenticatedGet<Reconciliation>(`/admin/coin-reconciliation-runs/${encodeURIComponent(id)}`);
  return (
    <>
      <Breadcrumbs items={[{ label: "对账与关账", href: "/admin/coins/reconciliation" }, { label: item.id }]} />
      <div className="mt-3"><PageHeader title={`对账运行 ${item.id}`} description={`${item.period} · ${item.status}`} /></div>
      <Panel title="核对项">{item.checks.length ? <DataTable headers={["项目", "账本值", "业务值", "差异", "状态"]} rows={item.checks.map((check) => [check.name, check.ledgerValue, check.businessValue, check.difference, check.status])} /> : <EmptyState title="暂无核对项" description="运行完成后显示服务端核对结果。" />}</Panel>
    </>
  );
}
