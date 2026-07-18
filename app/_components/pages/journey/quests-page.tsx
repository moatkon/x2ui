import Link from "next/link";
import { getQuests } from "@/app/_server/journey-data";
import { EmptyState, PageHeader, Pagination } from "../../shared/ui";

const tabs = [
  { label: "旅程", href: "/journey" },
  { label: "任务", href: "/quests" },
  { label: "节点协作", href: "/play/teams" },
];

export async function QuestsPageContent({ cursor }: { cursor?: string }) {
  const page = await getQuests(cursor);
  const quests = page.items;
  return (
    <>
      <PageHeader title="任务板" description="任务来自真实社区需求，不制造占位劳动。" />
      <nav className="tabs tabs-border mb-5">
        {tabs.map((item) => <Link className={`tab ${item.href === "/quests" ? "tab-active" : ""}`} href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      {quests.length === 0 ? <EmptyState title="暂无任务" description="可参与任务发布后会显示在这里。" /> : (
        <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
          {quests.map((quest) => (
            <li className="list-row rounded-none" key={quest.id}>
              <div className="list-col-grow">
                <Link className="font-bold" href={`/quests/${encodeURIComponent(quest.id)}`}>{quest.title}</Link>
                <p className="mt-1 text-sm opacity-65">{quest.node.name} · {quest.estimatedMinutes} 分钟 · {quest.status}</p>
              </div>
              <span className="badge">{quest.cxpPotential} CXP</span>
            </li>
          ))}
        </ul>
      )}
      {quests.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/quests" /></div> : null}
    </>
  );
}
