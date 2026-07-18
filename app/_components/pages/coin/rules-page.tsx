import { getCoinRules } from "@/app/_server/coin-data";
import { EmptyState, PageHeader, Pagination, Panel } from "../../shared/ui";
import { CoinTabs } from "./coin-tabs";

export async function CoinRulesPage({ cursor }: { cursor?: string }) {
  const page = await getCoinRules(cursor);
  const rules = page.items;
  return (
    <>
      <PageHeader title="金币经济规则" description="服务端生效规则及版本历史。" />
      <CoinTabs active="rules" />
      {rules.length ? (
        <div className="space-y-5">
          {rules.map((rule) => (
            <Panel title={`规则 ${rule.version}`} key={rule.version}>
              <p>{rule.nonMonetaryNotice}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="opacity-60">每周奖励上限</dt><dd className="font-bold">{rule.weeklyUserRewardCap}</dd></div>
                <div><dt className="opacity-60">观察期</dt><dd className="font-bold">{rule.pendingObservationSeconds} 秒</dd></div>
              </dl>
            </Panel>
          ))}
        </div>
      ) : <EmptyState title="暂无规则版本" description="已发布的金币规则会显示在这里。" />}
      {rules.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/coins/rules" /></div> : null}
    </>
  );
}
