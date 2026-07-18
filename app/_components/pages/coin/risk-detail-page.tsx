import { authenticatedGet } from "@/app/_server/authenticated-api";
import { StructuredApiForm } from "../../client/structured-api-form";
import { Breadcrumbs, PageHeader, Panel } from "../../shared/ui";
import type { CoinRiskCase } from "./admin-types";

export async function CoinModerationDetail({ id }: { id: string }) {
  const item = await authenticatedGet<CoinRiskCase>(`/moderation/coin-cases/${encodeURIComponent(id)}`);
  return (
    <>
      <Breadcrumbs items={[{ label: "金币风险案件", href: "/moderation/coins" }, { label: item.id }]} />
      <div className="mt-3"><PageHeader title={`案件 ${item.id}`} description={`${item.type} · ${item.status} · ${item.amount}`} /></div>
      <Panel title="证据摘要">{item.evidence.length ? <ul className="list-disc pl-5">{item.evidence.map((evidence) => <li key={evidence.sourceRef}>{evidence.summary}</li>)}</ul> : <p className="opacity-65">暂无可展示证据。</p>}</Panel>
      <Panel className="mt-5" title="相关流水"><p>{item.journalIds.join("、") || "暂无关联流水"}</p></Panel>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="建议释放"><StructuredApiForm path={`/moderation/coin-cases/${encodeURIComponent(item.id)}/release-recommendations`} ifMatch={`"${item.version}"`} fields={[{ name: "reason", label: "理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 }]} submitLabel="提交释放建议" /></Panel>
        <Panel title="建议追回"><StructuredApiForm path={`/moderation/coin-cases/${encodeURIComponent(item.id)}/recovery-recommendations`} ifMatch={`"${item.version}"`} fields={[{ name: "reason", label: "理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 }]} submitLabel="提交追回建议" /></Panel>
      </div>
    </>
  );
}
