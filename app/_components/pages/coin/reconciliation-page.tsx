import Link from "next/link";
import { authenticatedGet } from "@/app/_server/authenticated-api";
import { StructuredApiForm } from "../../client/structured-api-form";
import { DataTable, EmptyState, PageHeader, Panel } from "../../shared/ui";
import type { NumberPage, Reconciliation } from "./admin-types";

export async function CoinReconciliationPage() {
  const page = await authenticatedGet<NumberPage<Reconciliation>>("/admin/coin-reconciliation-runs?page=1&pageSize=100");
  return (
    <>
      <PageHeader title="金币对账与关账" description="后端生成的对账运行记录。" />
      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Panel title="创建对账运行">
          <StructuredApiForm path="/admin/coin-reconciliation-runs" fields={[
            { name: "period", label: "期间（YYYY-MM 或 YYYY-MM-DD）", required: true },
            { name: "scope", label: "范围", kind: "select", required: true, options: [{ value: "DAILY", label: "每日" }, { value: "MONTHLY", label: "每月" }] },
          ]} />
        </Panel>
        <Panel title="提交关账">
          <StructuredApiForm path="/admin/coin-period-close-requests" fields={[
            { name: "period", label: "期间（YYYY-MM）", required: true },
            { name: "reconciliationRunId", label: "已完成对账运行 ID", required: true },
          ]} />
        </Panel>
        <Panel title="独立批准关账">
          <StructuredApiForm
            path="/admin/coin-period-close-requests/:id/approvals"
            fields={[
              { name: "id", label: "关账申请 ID", required: true, transport: "path" },
              { name: "version", label: "当前版本", kind: "number", required: true, min: 1, transport: "etag" },
              { name: "comment", label: "审批意见", kind: "textarea", maxLength: 2000 },
            ]}
            submitLabel="批准关账"
            confirmation="确认完成独立关账批准？"
          />
        </Panel>
      </div>
      {page.items.length ? (
        <DataTable
          headers={["运行", "期间", "状态", "差异", "开始时间"]}
          rows={page.items.map((item) => [
            <Link className="link" href={`/admin/coins/reconciliation/${encodeURIComponent(item.id)}`} key={item.id}>{item.id}</Link>,
            item.period,
            item.status,
            item.differenceCount,
            new Date(item.startedAt).toLocaleString("zh-CN"),
          ])}
        />
      ) : <EmptyState title="暂无对账运行" description="创建对账运行后会显示在这里。" />}
    </>
  );
}
