import Link from "next/link";
import { getAppeals } from "@/app/_server/account-data";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";
import { localDate, statusClass } from "./account-view-utils";

export async function AppealsPage({ cursor }: { cursor?: string }) {
  const page = await getAppeals(cursor);
  const appeals = page.items;
  return (
    <>
      <PageHeader
        title="申诉"
        description="对内容或账户处置提出复核，并持续查看进度。"
        action={<Link className="btn btn-primary" href="/appeals/new">发起申诉</Link>}
      />
      {appeals.length === 0 ? (
        <EmptyState title="暂无申诉" description="存在可申诉的处置时，可在这里发起复核。" />
      ) : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {appeals.map((appeal) => (
            <li className="list-row rounded-none" key={appeal.id}>
              <div className="list-col-grow">
                <Link className="font-bold" href={`/appeals/${encodeURIComponent(appeal.id)}`}>
                  {appeal.id} · {appeal.enforcement.kind}
                </Link>
                <p className="mt-1 text-sm opacity-65">提交于 {localDate(appeal.submittedAt)}</p>
              </div>
              <span className={`badge ${statusClass(appeal.status)}`}>{appeal.status}</span>
            </li>
          ))}
        </ul>
      )}
      {appeals.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/appeals" /></div> : null}
    </>
  );
}
