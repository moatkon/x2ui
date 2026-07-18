import { authenticatedGet } from "@/app/_server/authenticated-api";
import { DataTable, EmptyState, PageHeader } from "../../shared/ui";
import type { AuditEntry, NumberPage } from "./types";

export async function ModerationAuditPage() {
  const page = await authenticatedGet<NumberPage<AuditEntry>>(
    "/moderation/audit-logs?page=1&pageSize=100",
  );
  return (
    <>
      <PageHeader title="审计日志" description="不可变治理审计记录。" />
      {page.items.length ? (
        <DataTable
          headers={["时间", "操作", "主体", "执行人", "理由", "Request ID"]}
          rows={page.items.map((item) => [
            new Date(item.createdAt).toLocaleString("zh-CN"),
            item.operation,
            `${item.subjectType}:${item.subjectId}`,
            `${item.actor.displayName} · ${item.actor.capability}`,
            item.reason,
            item.requestId,
          ])}
        />
      ) : <EmptyState title="暂无审计记录" description="授权范围内没有可显示记录。" />}
    </>
  );
}
