import type { Enrollment, Quest } from "@/app/_server/journey-data";
import { ActionButton } from "../../client/action-button";
import { StructuredApiForm } from "../../client/structured-api-form";
import { Panel } from "../../shared/ui";

export function QuestEnrollmentActions({ quest, enrollment }: { quest: Quest; enrollment?: Enrollment }) {
  const source = quest.sourceOptions[0];
  return (
    <>
      <div className="mt-5 flex justify-end">
        {enrollment ? <span className="badge badge-success">已加入 · {enrollment.status}</span> : source && quest.status === "AVAILABLE" ? (
          <ActionButton
            className="btn btn-primary"
            message="任务已加入"
            api={{ method: "POST", path: `/quests/${encodeURIComponent(quest.id)}/enrollments`, body: { sourceId: source.id, focusBudget: "LIGHT" }, idempotent: true }}
          >
            开始任务
          </ActionButton>
        ) : <span className="opacity-65">{quest.unavailableReason ?? "当前不可加入"}</span>}
      </div>
      {enrollment ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Panel title="暂停任务">
            <StructuredApiForm
              path={`/quest-enrollments/${encodeURIComponent(enrollment.id)}/pauses`}
              ifMatch={`"${enrollment.version}"`}
              fields={[{ name: "reason", label: "原因", kind: "select", required: true, options: [
                { value: "REST", label: "休息" },
                { value: "SOURCE_UNAVAILABLE", label: "来源不可用" },
                { value: "OTHER", label: "其他" },
              ] }]}
              submitLabel="暂停"
              confirmation="确认暂停当前任务？"
            />
          </Panel>
          <Panel title="退出任务">
            <StructuredApiForm
              path={`/quest-enrollments/${encodeURIComponent(enrollment.id)}/exits`}
              ifMatch={`"${enrollment.version}"`}
              fields={[{ name: "reason", label: "原因", kind: "select", required: true, options: [
                { value: "REST", label: "需要休息" },
                { value: "NOT_RELEVANT", label: "不再相关" },
                { value: "SOURCE_UNAVAILABLE", label: "来源不可用" },
                { value: "OTHER", label: "其他" },
              ] }]}
              submitLabel="退出"
              confirmation="确认退出当前任务？已完成贡献不会被删除。"
            />
          </Panel>
          <Panel title="替换任务">
            <StructuredApiForm
              path={`/quest-enrollments/${encodeURIComponent(enrollment.id)}/replacement-requests`}
              ifMatch={`"${enrollment.version}"`}
              fields={[
                { name: "preferredQuestId", label: "优先任务 ID" },
                { name: "reason", label: "原因", kind: "select", required: true, options: [
                  { value: "SOURCE_HIDDEN", label: "来源已隐藏" },
                  { value: "SOURCE_LOCKED", label: "来源已锁定" },
                  { value: "NOT_RELEVANT", label: "不再相关" },
                  { value: "OTHER", label: "其他" },
                ] },
              ]}
              submitLabel="请求替换"
            />
          </Panel>
        </div>
      ) : null}
    </>
  );
}
