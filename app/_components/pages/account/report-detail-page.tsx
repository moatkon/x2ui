import { getReport } from "@/app/_server/account-data";
import { Breadcrumbs, PageHeader, Panel } from "../../shared/ui";
import { localDate } from "./account-view-utils";

export async function ReportDetailPage({ id }: { id: string }) {
  const report = await getReport(id);
  return (
    <>
      <Breadcrumbs items={[{ label: "我的举报", href: "/me/reports" }, { label: report.id }]} />
      <div className="mt-3">
        <PageHeader title={`举报 ${report.id}`} description="仅显示你需要知道的进度，不公开内部审核信息。" />
      </div>
      <Panel title="目标摘要">
        <p className="font-bold">{report.target.label}</p>
        <p className="mt-1 text-sm opacity-65">{report.target.type} · 举报原因：{report.reason}</p>
        {report.details ? <p className="mt-3 whitespace-pre-wrap">{report.details}</p> : null}
      </Panel>
      <Panel className="mt-5" title="处理进度">
        <ol className="space-y-5">
          {report.timeline.map((item, index) => (
            <li className="flex gap-3" key={`${item.status}-${item.at}-${index}`}>
              <span className={`status mt-1 ${index === report.timeline.length - 1 ? "status-primary" : "status-success"}`} />
              <div>
                <p className="font-bold">{item.status}</p>
                <p className="text-sm opacity-65">{localDate(item.at)} · {item.publicMessage}</p>
              </div>
            </li>
          ))}
        </ol>
        {report.resolution ? <p className="alert alert-info mt-5">{report.resolution.message}</p> : null}
      </Panel>
    </>
  );
}
