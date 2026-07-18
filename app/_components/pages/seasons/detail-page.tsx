import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSeason } from "@/app/_server/public-content";
import { Breadcrumbs, PageHeader, Panel, ProgressBar } from "../../shared/ui";
import { seasonStatusLabel } from "./season-status";

export async function SeasonDetailPage({ slug }: { slug: string }) {
  const detail = await getPublicSeason(slug);
  if (!detail) notFound();

  const { season, steps, availableQuestCount } = detail;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "社区共建季", href: "/seasons" },
          { label: season.title },
        ]}
      />
      <div className="mt-3">
        <PageHeader
          title={season.title}
          description={`${seasonStatusLabel[season.status]} · ${season.scope}`}
        />
      </div>
      <Panel
        title="公共目标"
        footer={<p className="text-sm opacity-65">{season.acceptanceRule}</p>}
      >
        <p className="leading-relaxed">{season.goal}</p>
        <div className="mt-5">
          <ProgressBar
            value={season.progress.accepted}
            max={Math.max(1, season.progress.target)}
            label="公共成果进度"
          />
        </div>
      </Panel>
      <Panel
        className="mt-5"
        title="如何参与"
        footer={
          season.status === "ACTIVE" && availableQuestCount > 0 ? (
            <Link className="btn btn-primary" href="/quests">
              查看 {availableQuestCount} 个可做任务
            </Link>
          ) : undefined
        }
      >
        {steps.length ? (
          <ul className="steps steps-vertical w-full sm:steps-horizontal">
            {steps.map((step) => (
              <li
                className={`step ${step.completed ? "step-primary" : ""}`}
                key={step.label}
              >
                {step.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="opacity-65">暂无参与步骤。</p>
        )}
      </Panel>
    </>
  );
}
