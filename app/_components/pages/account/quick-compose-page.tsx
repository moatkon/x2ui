import type { QueryParams } from "@/app/_lib/query";
import { getPublicNodes } from "@/app/_server/public-content";
import { ComposeForm } from "../../client/compose-form";

export async function QuickComposeContent({ query }: { query: QueryParams }) {
  const availableNodes = await getPublicNodes();
  const node = typeof query.node === "string" ? query.node : availableNodes[0]?.slug ?? "";
  const child = typeof query.subnode === "string" ? query.subnode : "";
  return <><h1 className="sr-only">轻发布</h1><ComposeForm nodes={availableNodes} compact initialNode={node} initialChild={child} /></>;
}
