import { getCoinJournal } from "@/app/_server/coin-data";
import { StructuredApiForm } from "../../client/structured-api-form";
import { Breadcrumbs, DataTable, PageHeader, Panel } from "../../shared/ui";

export async function CoinJournalDetail({ id }: { id: string }) {
  const journal = await getCoinJournal(id);
  return (
    <>
      <Breadcrumbs items={[{ label: "透明账本", href: "/coins/ledger" }, { label: journal.id }]} />
      <div className="mt-3"><PageHeader title={`流水 ${journal.id}`} description={`${journal.type} · ${journal.status}`} /></div>
      <Panel title="分录"><DataTable headers={["科目", "方向", "金额", "单位"]} rows={journal.entries.map((entry) => [entry.accountCode, entry.direction, entry.amount, entry.unit])} /></Panel>
      {journal.disputable ? (
        <Panel className="mt-5" title="申请复核">
          <StructuredApiForm
            path="/coin-disputes"
            fixedBody={{ journalId: journal.id }}
            fields={[
              { name: "reasonCategory", label: "原因", kind: "select", required: true, options: [
                { value: "WRONG_RECIPIENT", label: "收款方错误" },
                { value: "ACCOUNT_TAKEOVER", label: "账户被接管" },
                { value: "RULE_MISAPPLIED", label: "规则适用错误" },
                { value: "OTHER", label: "其他" },
              ] },
              { name: "statement", label: "说明", kind: "textarea", required: true, maxLength: 2000 },
            ]}
            submitLabel="提交争议"
          />
        </Panel>
      ) : null}
    </>
  );
}
