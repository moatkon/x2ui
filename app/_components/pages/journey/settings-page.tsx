import { getJourneyPreferences } from "@/app/_server/journey-data";
import { ActionButton } from "../../client/action-button";
import { JourneySettingsForm } from "../../client/journey-preferences-form";
import { StructuredApiForm } from "../../client/structured-api-form";
import { PageHeader, Panel } from "../../shared/ui";

export async function JourneySettingsPage() {
  const { data, etag } = await getJourneyPreferences();
  return (
    <>
      <PageHeader title="旅程设置" description="管理总结、推荐、路径展示与全局休息状态。" />
      <Panel title="偏好"><JourneySettingsForm value={data} etag={etag} /></Panel>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="暂停旅程"><StructuredApiForm path="/users/me/journey-pauses" fields={[{ name: "until", label: "暂停至（可选）", kind: "datetime" }]} submitLabel="确认暂停" confirmation="暂停期间不会推荐新任务，确认继续？" /></Panel>
        <Panel title="恢复旅程"><p className="mb-4 opacity-70">恢复后重新启用任务推荐和周进度。</p><ActionButton className="btn btn-primary" message="旅程已恢复" api={{ method: "DELETE", path: "/users/me/journey-pauses/current" }}>恢复旅程</ActionButton></Panel>
      </div>
    </>
  );
}
