import Link from "next/link";
import { getJourneySummary } from "@/app/_server/journey-data";
import { EmptyState, PageHeader, Panel, ProgressBar, StatGrid } from "../../shared/ui";

export async function JourneyHubPage() {
  const summary = await getJourneySummary();
  return (
    <>
      <PageHeader title="社区旅程" description={`${summary.weekStart} 至 ${summary.weekEnd} 的真实参与进度。`} />
      <StatGrid items={[
        { title: "本周贡献", value: summary.completedContributions, description: `目标 ${summary.targetContributions}` },
        { title: "覆盖节点", value: summary.coveredNodes },
        { title: "已确认 CXP", value: summary.cxp.confirmed, description: `${summary.cxp.pending} 待确认` },
        { title: "当前角色", value: summary.role.current, description: summary.role.next ? `下一阶段：${summary.role.next}` : undefined },
      ]} />
      <Panel className="mt-5" title="本周进度">
        <ProgressBar value={summary.completedContributions} max={Math.max(1, summary.targetContributions)} label="贡献进度" />
      </Panel>
      <Panel className="mt-5" title="推荐任务">
        {summary.recommendedQuests.length ? (
          <ul className="list x2-list -m-5">
            {summary.recommendedQuests.map((quest) => (
              <li className="list-row rounded-none" key={quest.id}>
                <div className="list-col-grow">
                  <Link className="font-bold" href={`/quests/${encodeURIComponent(quest.id)}`}>{quest.title}</Link>
                  <p className="text-sm opacity-65">{quest.node.name} · {quest.estimatedMinutes} 分钟</p>
                </div>
                <span className="badge">{quest.cxpPotential} CXP</span>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="暂无推荐任务" description="系统产生适合你的公开任务后会显示在这里。" />}
      </Panel>
    </>
  );
}
