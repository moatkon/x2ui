import { Notice, PageHeader } from "../../shared/ui";

export function JourneyStatesPage() {
  return <><PageHeader title="旅程状态说明" description="状态由服务端任务状态机决定。" /><Notice><p>任务不可用、暂停、退出或替换时，页面会展示 X2API 返回的实际状态与原因。</p></Notice></>;
}
