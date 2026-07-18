import { notFound } from "next/navigation";
import { getQuest } from "@/app/_server/journey-data";
import {
  Breadcrumbs,
  PageHeader,
  Panel,
} from "../../shared/ui";
import { QuestEnrollmentActions } from "./quest-enrollment-actions";

export async function QuestDetailPage({ id }: { id: string }) {
  const detail = await getQuest(id).catch(() => null);
  if (!detail) notFound();
  const { quest, enrollment } = detail;
  return (
    <>
      <Breadcrumbs
        items={[{ label: "任务板", href: "/quests" }, { label: quest.title }]}
      />
      <div className="mt-4">
        <PageHeader
          title={quest.title}
          description={`${quest.node.name} · ${quest.estimatedMinutes} 分钟 · ${quest.rewardExplanation}`}
        />
      </div>
      <Panel title="为什么做">
        <p>{quest.description}</p>
      </Panel>
      <Panel className="mt-5" title="任务步骤">
        <ol className="space-y-3">
          {quest.steps.map((step, index) => (
            <li className="flex gap-3" key={step.label}>
              <span className="badge">{index + 1}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <QuestEnrollmentActions quest={quest} enrollment={enrollment} />
    </>
  );
}
