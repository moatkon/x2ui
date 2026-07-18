import type { QueryParams } from "@/app/_lib/query";
import { getDraft } from "@/app/_server/account-data";
import { getPublicNodes } from "@/app/_server/public-content";
import { ComposeForm } from "../../client/compose-form";
import { PageHeader, Panel } from "../../shared/ui";

export async function ComposeContent({ query }: { query: QueryParams }) {
  const availableNodes = await getPublicNodes();
  const draft = typeof query.draft === "string" ? await getDraft(query.draft) : undefined;
  const draftParent = draft?.nodePath
    ? availableNodes.find((item) => item.id === draft.nodePath?.parentNodeId)
    : undefined;
  const draftChild = draftParent?.children.find((item) => item.id === draft?.nodePath?.childNodeId);
  const node = typeof query.node === "string" ? query.node : draftParent?.slug ?? availableNodes[0]?.slug ?? "";
  const child = typeof query.subnode === "string" ? query.subnode : draftChild?.slug ?? "";
  return (
    <>
      <PageHeader title="发布帖子" description={query.from === "quick" ? "轻发布内容已带入，请补充标题后继续完善。" : "先保存为草稿，确认无误后再发布。"} />
      <Panel title="内容草稿"><ComposeForm nodes={availableNodes} initialNode={node} initialChild={child} initialDraft={draft} /></Panel>
    </>
  );
}
