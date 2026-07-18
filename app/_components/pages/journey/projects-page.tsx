import { getNodeProjects } from "@/app/_server/journey-data";
import { ActionButton } from "../../client/action-button";
import { EmptyState, PageHeader, Pagination, ProgressBar } from "../../shared/ui";

export async function JourneyTeamsPage({ cursor }: { cursor?: string }) {
  const page = await getNodeProjects(cursor);
  const projects = page.items;
  return (
    <>
      <PageHeader title="节点协作" description="协作任务、验收规则和进度全部公开。" />
      {projects.length === 0 ? <EmptyState title="暂无开放协作" description="开放的节点项目会显示在这里。" /> : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {projects.map((project) => (
            <li className="list-row rounded-none" key={project.id}>
              <div className="list-col-grow">
                <p className="font-bold">{project.title}</p>
                <p className="text-sm opacity-65">{project.node.name} · {project.memberCount}/{project.memberLimit} 人 · {project.openTaskCount} 个开放任务</p>
                <div className="mt-3"><ProgressBar value={project.progress.accepted} max={Math.max(1, project.progress.target)} /></div>
              </div>
              <ActionButton
                className="btn btn-sm"
                message={project.participant ? "已退出协作" : "已加入协作"}
                api={{
                  method: project.participant ? "DELETE" : "PUT",
                  path: `/node-projects/${encodeURIComponent(project.id)}/participants/me`,
                  body: project.participant ? undefined : {},
                }}
              >
                {project.participant ? "退出" : "加入"}
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
      {projects.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/play/teams" /></div> : null}
    </>
  );
}
