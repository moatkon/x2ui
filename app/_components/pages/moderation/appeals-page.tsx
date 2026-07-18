import { authenticatedGet } from "@/app/_server/authenticated-api";
import type { Appeal } from "@/app/_server/account-data";
import { StructuredApiForm } from "../../client/structured-api-form";
import { EmptyState, PageHeader, Panel } from "../../shared/ui";
import type { NumberPage } from "./types";

export async function ModerationAppealsPage() {
  const page = await authenticatedGet<NumberPage<Appeal>>(
    "/moderation/appeals?page=1&pageSize=100",
  );
  return (
    <>
      <PageHeader title="申诉复核" description="独立复核队列，服务端排除原处置人。" />
      {page.items.length ? (
        <div className="space-y-5">
          {page.items.map((item) => (
            <Panel title={`${item.id} · ${item.status}`} key={item.id}>
              <p>{item.enforcement.kind} · {item.reason} · {new Date(item.submittedAt).toLocaleString("zh-CN")}</p>
              <div className="mt-4">
                <StructuredApiForm
                  path={`/moderation/appeals/${encodeURIComponent(item.id)}/decisions`}
                  ifMatch={`"${item.version}"`}
                  fields={[
                    { name: "outcome", label: "复核结果", kind: "select", required: true, options: [{ value: "UPHOLD", label: "维持" }, { value: "REVOKE", label: "撤销" }, { value: "REPLACE", label: "替换处置" }] },
                    { name: "reason", label: "独立复核理由", kind: "textarea", required: true, minLength: 20, maxLength: 4000 },
                    { name: "replacement", label: "替换处置 JSON（仅 REPLACE）", kind: "json", help: "格式：{\"kind\":\"MUTE\",\"scope\":\"COMMENTING\",\"expiresAt\":\"...Z\"}" },
                  ]}
                  submitLabel="记录复核决定"
                  confirmation="确认已满足独立复核要求并提交不可变决定？"
                />
              </div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState title="暂无待复核申诉" description="当前授权范围内没有申诉。" />}
    </>
  );
}
