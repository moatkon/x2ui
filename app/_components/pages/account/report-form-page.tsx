import { Suspense } from "react";
import { ReportForm } from "../../client/report-form";
import { PageHeader, Panel } from "../../shared/ui";

export function ReportFormPage() {
  return (
    <>
      <PageHeader title="提交举报" description="举报用于处理具体风险，不用于表达观点不同。" />
      <Panel title="举报详情">
        <Suspense fallback={<span className="loading loading-spinner" />}>
          <ReportForm />
        </Suspense>
      </Panel>
    </>
  );
}
