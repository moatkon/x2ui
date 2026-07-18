import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentNodeProject } from "@/app/_server/public-content";
import { ActionButton } from "../../client/action-button";
import { Breadcrumbs, Notice, PageHeader, Panel, StatGrid } from "../../shared/ui";

export async function NodeProjectPage({ slug }: { slug: string }) {
  const result = await getCurrentNodeProject(slug);
  if (!result) notFound();
  const { project, quests, acceptanceRule } = result;
  const joinAction = project.participant ? (
    <ActionButton api={{ method: "DELETE", path: `/node-projects/${project.id}/participants/me` }} message="已退出项目">退出项目</ActionButton>
  ) : (
    <ActionButton className="btn btn-primary" api={{ method: "PUT", path: `/node-projects/${project.id}/participants/me`, body: { displayNamePublic: false } }} message="已加入项目">申请加入</ActionButton>
  );
  return (
    <>
      <Breadcrumbs items={[{ label: "节点", href: "/nodes" }, { label: project.node.name, href: `/nodes/${project.node.slug}` }, { label: "公开共建" }]} />
      <div className="mt-3"><PageHeader title={project.title} description={project.goal} action={joinAction} /></div>
      <Notice><p>{acceptanceRule}</p></Notice>
      <div className="mt-5">
        <StatGrid items={[
          { title: "目标", value: project.progress.target, description: "计划验收贡献" },
          { title: "已验收", value: project.progress.accepted, description: "公开可追溯" },
          { title: "开放任务", value: project.openTaskCount, description: `${project.memberCount}/${project.memberLimit} 位参与者` },
        ]} />
      </div>
      <Panel className="mt-5" title="公开任务" footer={<Link className="link text-sm" href="/me/contributions">查看我的贡献记录</Link>}>
        {quests.length === 0 ? <p className="opacity-65">当前没有开放任务。</p> : (
          <ul className="list x2-list -m-5">
            {quests.map((quest) => (
              <li className="list-row rounded-none" key={quest.id}>
                <div className="list-col-grow">
                  <span className="badge badge-outline">{quest.status}</span>
                  <Link className="mt-2 block font-bold" href={`/quests/${quest.id}`}>{quest.title}</Link>
                  <p className="mt-1 text-sm opacity-65">{quest.description}</p>
                </div>
                <span className="badge badge-success">CXP {quest.cxpPotential}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
