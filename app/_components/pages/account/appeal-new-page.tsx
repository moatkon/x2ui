import { getAppealableEnforcements } from "@/app/_server/account-data";
import { AppealForm } from "../../client/appeal-form";
import { PageHeader, Pagination, Panel } from "../../shared/ui";

export async function AppealNewPage({ cursor }: { cursor?: string }) {
  const page = await getAppealableEnforcements(cursor);
  return (
    <>
      <PageHeader title="发起申诉" description="说明需要复核的事实，不会改写原始处置记录。" />
      <Panel title="申诉说明"><AppealForm enforcements={page.items} /></Panel>
      {page.items.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/appeals/new" /></div> : null}
    </>
  );
}
