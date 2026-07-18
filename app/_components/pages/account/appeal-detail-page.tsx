import { getAppeal } from "@/app/_server/account-data";
import { AppealSupplementForm } from "../../client/appeal-supplement-form";
import { Breadcrumbs, PageHeader, Panel } from "../../shared/ui";
import { localDate } from "./account-view-utils";

export async function AppealDetailPage({ id }: { id: string }) {
  const appeal = await getAppeal(id);
  return (
    <>
      <Breadcrumbs items={[{ label: "我的申诉", href: "/appeals" }, { label: appeal.id }]} />
      <div className="mt-3">
        <PageHeader title={`申诉 ${appeal.id}`} description="状态、决定与补充说明会保留在时间线上。" />
      </div>
      <Panel title="当前状态">
        <p><strong>{appeal.status}</strong> · 更新于 {localDate(appeal.updatedAt)}</p>
        <p className="mt-3 whitespace-pre-wrap">{appeal.statement}</p>
        {appeal.decision?.reason ? <p className="alert alert-info mt-5">{appeal.decision.reason}</p> : null}
      </Panel>
      <Panel className="mt-5" title="补充申诉说明">
        <AppealSupplementForm appealId={appeal.id} />
      </Panel>
    </>
  );
}
