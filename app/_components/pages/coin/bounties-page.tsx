import Link from "next/link";
import { Suspense } from "react";
import { getBounties } from "@/app/_server/coin-data";
import { BountyForm } from "../../client/bounty-form";
import { EmptyState, PageHeader, Pagination, Panel } from "../../shared/ui";
import { CoinTabs } from "./coin-tabs";

export async function CoinBountiesPage({ cursor }: { cursor?: string }) {
  const page = await getBounties(cursor);
  const bounties = page.items;
  return (
    <>
      <PageHeader title="问题悬赏" description="用已有金币为自己发布的真实问题设置悬赏。" />
      <CoinTabs active="bounties" />
      <Panel title="创建悬赏"><Suspense fallback={<span className="loading loading-spinner" />}><BountyForm /></Suspense></Panel>
      <div className="mt-5">
        {bounties.length ? (
          <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">
            {bounties.map((item) => (
              <li className="list-row rounded-none" key={item.id}>
                <div className="list-col-grow">
                  <Link className="font-bold" href={`/coins/bounties/${encodeURIComponent(item.id)}`}>{item.post.displayTitle || item.post.title}</Link>
                  <p className="text-sm opacity-65">{item.status} · 到期 {new Date(item.expiresAt).toLocaleString("zh-CN")}</p>
                </div>
                <span className="badge">{item.amount} {item.unit}</span>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="暂无悬赏" description="创建的悬赏会显示在这里。" />}
      </div>
      {bounties.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/coins/bounties" /></div> : null}
    </>
  );
}
