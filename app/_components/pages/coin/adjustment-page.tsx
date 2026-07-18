import { authenticatedGet } from "@/app/_server/authenticated-api";
import { StructuredApiForm } from "../../client/structured-api-form";
import { Breadcrumbs, DataTable, PageHeader, Panel } from "../../shared/ui";
import type { Adjustment } from "./admin-types";

export async function CoinAdjustmentPage({ id }: { id: string }) {
  const item = await authenticatedGet<Adjustment>(`/admin/coin-adjustments/${encodeURIComponent(id)}`);
  return (
    <>
      <Breadcrumbs items={[{ label: "金币控制台", href: "/admin/coins/control" }, { label: item.id }]} />
      <div className="mt-3"><PageHeader title={`人工调整 ${item.id}`} description={item.status} /></div>
      <Panel title="调整摘要">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="opacity-60">期间</dt><dd>{item.period}</dd></div>
          <div><dt className="opacity-60">事故 ID</dt><dd>{item.incidentId}</dd></div>
          <div className="sm:col-span-2"><dt className="opacity-60">理由</dt><dd>{item.reason}</dd></div>
        </dl>
        <DataTable headers={["科目", "方向", "金额"]} rows={item.proposedEntries.map((entry) => [entry.accountCode, entry.direction, entry.amount])} />
      </Panel>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="独立批准">
          <StructuredApiForm path={`/admin/coin-adjustments/${encodeURIComponent(item.id)}/approvals`} ifMatch={`"${item.version}"`} fields={[{ name: "comment", label: "审批意见", kind: "textarea", maxLength: 2000 }]} submitLabel="批准并执行" confirmation="确认作为独立审批人批准这笔双重分录？" />
        </Panel>
        <Panel title="退回补充">
          <StructuredApiForm path={`/admin/coin-adjustments/${encodeURIComponent(item.id)}/return-requests`} ifMatch={`"${item.version}"`} fields={[{ name: "reason", label: "退回原因", kind: "textarea", required: true, minLength: 10, maxLength: 2000 }]} submitLabel="退回" />
        </Panel>
      </div>
    </>
  );
}
