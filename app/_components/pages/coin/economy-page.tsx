import { getEconomySummary } from "@/app/_server/coin-data";
import { DataTable, EmptyState, PageHeader, Panel, StatGrid } from "../../shared/ui";

export async function CoinEconomyPage() {
  const period = new Date().toISOString().slice(0, 7);
  const value = await getEconomySummary(period);
  if (!value) return <><PageHeader title="金币经济透明度" description="只展示已经关账并公开发布的期间。" /><EmptyState title="尚无已发布期间" description="首个期间完成关账并发布后，公共经济汇总会显示在这里。" /></>;
  return (
    <>
      <PageHeader title="金币经济透明度" description={`${value.period} 公开汇总，不包含个人余额。`} />
      <StatGrid items={[
        { title: "期初供给", value: value.openingSupply },
        { title: "系统发行", value: value.issued },
        { title: "系统沉淀", value: value.sunk },
        { title: "期末供给", value: value.closingSupply },
      ]} />
      <Panel className="mt-5" title="健康指标">
        <DataTable headers={["活跃钱包", "沉寂率", "冲正", "规则版本"]} rows={[[value.activeWallets, value.dormancyRate, value.reversals, value.ruleVersion]]} />
        <div className="mt-4 flex justify-end"><a className="btn" href={`/api/v1/coin-economy/summaries/${encodeURIComponent(value.period)}.csv`} download>下载 CSV</a></div>
      </Panel>
    </>
  );
}
