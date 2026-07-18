import { authenticatedGet } from "@/app/_server/authenticated-api";
import type { CoinRuleSet } from "@/app/_server/coin-data";
import { StructuredApiForm } from "../../client/structured-api-form";
import { PageHeader, Panel, StatGrid } from "../../shared/ui";
import type { Adjustment, CurrentBudget, NumberPage, Proposal } from "./admin-types";

function ProposalApprovals({ title, items, pathSegment }: { title: string; items: Proposal[]; pathSegment: string }) {
  return (
    <Panel title={title}>
      {items.length ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div className="flex flex-col gap-3 rounded-box border border-base-content/20 p-4 md:flex-row md:items-end md:justify-between" key={item.id}>
              <div><p className="font-bold">{item.id}</p><p className="text-sm opacity-65">{item.status} · {item.rationale}</p></div>
              <div className="w-full md:max-w-sm">
                <StructuredApiForm
                  path={`/admin/${pathSegment}/${encodeURIComponent(item.id)}/approvals`}
                  ifMatch={`"${item.version}"`}
                  fields={[{ name: "comment", label: "审批意见", kind: "textarea", maxLength: 2000 }]}
                  submitLabel="独立批准"
                  confirmation="确认以独立审批人身份批准？"
                />
              </div>
            </div>
          ))}
        </div>
      ) : <p className="opacity-65">暂无待审批提案。</p>}
    </Panel>
  );
}

export async function CoinControlPage() {
  const [budget, budgetProposals, ruleVersions, ruleProposals, adjustments, freezes] = await Promise.all([
    authenticatedGet<CurrentBudget>("/admin/coin-budgets/current"),
    authenticatedGet<NumberPage<Proposal>>("/admin/coin-budget-change-proposals?page=1&pageSize=100"),
    authenticatedGet<NumberPage<CoinRuleSet>>("/admin/coin-rule-versions?page=1&pageSize=100"),
    authenticatedGet<NumberPage<Proposal>>("/admin/coin-rule-change-proposals?page=1&pageSize=100"),
    authenticatedGet<NumberPage<Adjustment>>("/admin/coin-adjustments?page=1&pageSize=100"),
    authenticatedGet<NumberPage<Proposal>>("/admin/coin-write-freeze-proposals?page=1&pageSize=100"),
  ]);
  return (
    <>
      <PageHeader title="金币控制台" description="Controller 的预算、规则与审批状态全部来自服务端。" />
      <StatGrid items={[
        { title: "期间", value: budget.period },
        { title: "预算上限", value: budget.cap },
        { title: "已使用", value: budget.used },
        { title: "剩余", value: budget.remaining },
      ]} />
      <Panel className="mt-5" title="规则版本">
        {ruleVersions.items.length ? <ul className="space-y-2">{ruleVersions.items.map((rule) => <li key={rule.version}><strong>{rule.version}</strong> · {new Date(rule.effectiveAt).toLocaleString("zh-CN")}</li>)}</ul> : <p className="opacity-65">暂无规则版本。</p>}
      </Panel>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="预算变更提案">
          <StructuredApiForm path="/admin/coin-budget-change-proposals" fields={[
            { name: "period", label: "期间", required: true, defaultValue: budget.period },
            { name: "newCap", label: "新预算上限", kind: "number", required: true, min: 0 },
            { name: "rationale", label: "理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
            { name: "impactForecast", label: "影响预测", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
            { name: "effectiveAt", label: "生效时间", kind: "datetime", required: true },
            { name: "stopConditions", label: "停止条件", kind: "textarea", required: true, minLength: 20, maxLength: 2000 },
          ]} />
        </Panel>
        <Panel title="规则变更提案">
          <StructuredApiForm path="/admin/coin-rule-change-proposals" fields={[
            { name: "proposedRule", label: "完整规则 JSON", kind: "json", required: true },
            { name: "rationale", label: "理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
            { name: "impactForecast", label: "影响预测", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
            { name: "stopConditions", label: "停止条件", kind: "textarea", required: true, minLength: 20, maxLength: 2000 },
          ]} />
        </Panel>
        <Panel title="人工调整申请">
          <StructuredApiForm path="/admin/coin-adjustments" fields={[
            { name: "incidentId", label: "事故 ID", required: true, maxLength: 80 },
            { name: "period", label: "期间", required: true },
            { name: "reason", label: "理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
            { name: "proposedEntries", label: "拟议分录 JSON 数组", kind: "json", required: true },
          ]} />
        </Panel>
        <Panel title="写入冻结提案">
          <StructuredApiForm path="/admin/coin-write-freeze-proposals" fields={[
            { name: "scope", label: "范围", kind: "select", required: true, options: [{ value: "ALL_COIN_WRITES", label: "全部金币写入" }, { value: "ISSUANCE_ONLY", label: "仅系统发行" }, { value: "SPENDING_ONLY", label: "仅用户消费" }] },
            { name: "rationale", label: "理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
            { name: "reviewDueAt", label: "复核时间", kind: "datetime", required: true },
          ]} />
        </Panel>
      </div>
      <div className="mt-5 space-y-5">
        <ProposalApprovals title="预算提案审批" items={budgetProposals.items} pathSegment="coin-budget-change-proposals" />
        <ProposalApprovals title="规则提案审批" items={ruleProposals.items} pathSegment="coin-rule-change-proposals" />
        <ProposalApprovals title="写入冻结审批" items={freezes.items} pathSegment="coin-write-freeze-proposals" />
        <Panel title="人工调整审批">
          {adjustments.items.length ? (
            <div className="space-y-5">
              {adjustments.items.map((item) => (
                <div className="rounded-box border border-base-content/20 p-4" key={item.id}>
                  <p className="font-bold">{item.id} · {item.status}</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <StructuredApiForm path={`/admin/coin-adjustments/${encodeURIComponent(item.id)}/approvals`} ifMatch={`"${item.version}"`} fields={[{ name: "comment", label: "审批意见", kind: "textarea", maxLength: 2000 }]} submitLabel="独立批准" confirmation="确认批准并执行这笔双重分录？" />
                    <StructuredApiForm path={`/admin/coin-adjustments/${encodeURIComponent(item.id)}/return-requests`} ifMatch={`"${item.version}"`} fields={[{ name: "reason", label: "退回原因", kind: "textarea", required: true, minLength: 10, maxLength: 2000 }]} submitLabel="退回补充" />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="opacity-65">暂无待审批调整。</p>}
        </Panel>
      </div>
    </>
  );
}
