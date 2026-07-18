import Link from "next/link";
import { getReports } from "@/app/_server/account-data";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";
import { localDate, statusClass } from "./account-view-utils";

export async function ReportsPage({ cursor }: { cursor?: string }) {
  const page = await getReports(cursor);
  const reports = page.items;
  return (
    <>
      <PageHeader title="我的举报" description="查看已提交举报的安全进度，不公开审核人员信息。" />
      {reports.length === 0 ? (
        <EmptyState title="暂无举报" description="从具体帖子、评论或用户页面可以发起举报。" />
      ) : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {reports.map((report) => (
            <li className="list-row rounded-none" key={report.id}>
              <div className="list-col-grow">
                <Link className="font-bold hover:underline" href={`/me/reports/${encodeURIComponent(report.id)}`}>
                  {report.id}
                </Link>
                <p className="mt-1 text-sm opacity-65">
                  {report.target.type} · {report.reason} · {localDate(report.submittedAt)}
                </p>
              </div>
              <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
              <span aria-hidden>›</span>
            </li>
          ))}
        </ul>
      )}
      {reports.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/reports" /></div> : null}
    </>
  );
}
