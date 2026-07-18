import { authenticatedGet } from "@/app/_server/authenticated-api";
import { StructuredApiForm } from "../../client/structured-api-form";
import {
  Breadcrumbs,
  PageHeader,
  Panel,
} from "../../shared/ui";
import type { ModerationCase } from "./types";

export async function ModerationCasePage({ id }: { id: string }) {
  const item = await authenticatedGet<ModerationCase>(
    `/moderation/cases/${encodeURIComponent(id)}`,
  );
  const value = item.case;
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "审核队列", href: "/moderation" },
          { label: value.id },
        ]}
      />
      <div className="mt-3">
        <PageHeader
          title={`案件 ${value.id}`}
          description={`${value.priority} · ${value.reason} · ${value.status}`}
        />
      </div>
      <Panel title="举报上下文">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="opacity-60">举报对象</dt>
            <dd>{value.target.label}</dd>
          </div>
          <div>
            <dt className="opacity-60">举报次数</dt>
            <dd>{value.reportCount}</dd>
          </div>
          <div>
            <dt className="opacity-60">进入队列</dt>
            <dd>{new Date(value.enteredAt).toLocaleString("zh-CN")}</dd>
          </div>
          <div>
            <dt className="opacity-60">SLA</dt>
            <dd>{new Date(value.slaDueAt).toLocaleString("zh-CN")}</dd>
          </div>
        </dl>
        <p className="mt-5">{item.riskSummary}</p>
      </Panel>
      <Panel className="mt-5" title="可执行治理动作">
        <div className="flex flex-wrap gap-2">
          {item.allowedCommands.visibility ? (
            <span className="badge">可见性决定</span>
          ) : null}
          {item.allowedCommands.commentLock ? (
            <span className="badge">评论锁定</span>
          ) : null}
          {item.allowedCommands.userSanction ? (
            <span className="badge">用户处置</span>
          ) : null}
        </div>
      </Panel>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="案件分派">
          <StructuredApiForm path={`/moderation/cases/${encodeURIComponent(value.id)}/assignments`} ifMatch={`"${value.version}"`} fields={[{ name: "assigneeId", label: "治理人员 ID", required: true }]} />
        </Panel>
        {item.allowedCommands.visibility && ["POST", "COMMENT"].includes(value.target.type) ? <Panel title="可见性决定">
          <StructuredApiForm path={`/moderation/cases/${encodeURIComponent(value.id)}/visibility-decisions`} ifMatch={`"${value.version}"`} fixedBody={{ targetType: value.target.type, targetId: value.target.id }} fields={[
            { name: "visibility", label: "可见性", kind: "select", required: true, options: [{ value: "VISIBLE", label: "公开" }, { value: "HIDDEN", label: "隐藏" }] },
            { name: "reason", label: "理由", kind: "textarea", required: true, minLength: 10, maxLength: 2000 },
          ]} confirmation="可见性决定会写入不可变审计，确认提交？" />
        </Panel> : null}
        {item.allowedCommands.commentLock && value.target.type === "POST" ? <Panel title="评论锁定决定">
          <StructuredApiForm path={`/moderation/cases/${encodeURIComponent(value.id)}/comment-lock-decisions`} ifMatch={`"${value.version}"`} fixedBody={{ postId: value.target.id }} fields={[
            { name: "locked", label: "决定", kind: "select", required: true, options: [{ value: "true", label: "锁定评论" }, { value: "false", label: "解除锁定" }] },
            { name: "reason", label: "理由", kind: "textarea", required: true, minLength: 10, maxLength: 2000 },
          ]} confirmation="评论锁定决定会写入不可变审计，确认提交？" />
        </Panel> : null}
        {item.allowedCommands.userSanction && value.target.author ? <Panel title="用户处置">
          <StructuredApiForm path={`/moderation/cases/${encodeURIComponent(value.id)}/user-sanctions`} ifMatch={`"${value.version}"`} fixedBody={{ userId: value.target.author.id }} fields={[
            { name: "kind", label: "处置类型", kind: "select", required: true, options: [{ value: "WARNING", label: "警告" }, { value: "RATE_LIMIT", label: "限流" }, { value: "MUTE", label: "禁言" }, { value: "BAN", label: "封禁" }, { value: "RESTORE", label: "恢复" }] },
            { name: "scope", label: "范围", kind: "select", required: true, options: [{ value: "POSTING", label: "发帖" }, { value: "COMMENTING", label: "评论" }, { value: "ALL_WRITES", label: "全部写入" }, { value: "ACCOUNT", label: "账户" }] },
            { name: "expiresAt", label: "到期时间（永久处置可留空）", kind: "datetime" },
            { name: "reason", label: "理由", kind: "textarea", required: true, minLength: 10, maxLength: 2000 },
          ]} confirmation="用户处置可能影响账户使用，确认提交？" />
        </Panel> : null}
      </div>
    </>
  );
}
