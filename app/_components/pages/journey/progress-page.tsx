import { getJourneyProgress } from "@/app/_server/journey-data";
import { EmptyState, PageHeader, Panel } from "../../shared/ui";

export async function JourneyProgressPage() {
  const progress = await getJourneyProgress();
  return (
    <>
      <PageHeader title="成长进度" description="成长路径来自已确认的真实贡献。" />
      {progress.path.length ? (
        <Panel title="路径">
          <ul className="steps steps-vertical w-full">
            {progress.path.map((item) => (
              <li className={`step ${item.completed ? "step-primary" : ""}`} key={item.role}>
                <span>{item.role}</span>
                <span className="ml-2 text-sm opacity-60">{item.description}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : <EmptyState title="暂无成长记录" description="完成并确认贡献后会生成成长路径。" />}
    </>
  );
}
