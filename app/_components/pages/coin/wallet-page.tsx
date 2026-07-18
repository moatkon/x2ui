import { getCoinWallet } from "@/app/_server/coin-data";
import { PageHeader, Panel, ProgressBar, StatGrid } from "../../shared/ui";
import { CoinTabs } from "./coin-tabs";

export async function CoinWalletPage() {
  const wallet = await getCoinWallet();
  return (
    <>
      <PageHeader title="金币中心" description="余额与奖励状态全部来自不可变金币子账。" />
      <CoinTabs active="wallet" />
      <StatGrid items={[
        { title: "可用", value: wallet.balances.available },
        { title: "待结算", value: wallet.balances.pending },
        { title: "托管", value: wallet.balances.escrow },
        { title: "风控保留", value: wallet.balances.held },
      ]} />
      <Panel className="mt-5" title="本周个人系统奖励">
        <ProgressBar value={wallet.weeklyReward.earned} max={Math.max(1, wallet.weeklyReward.cap)} label="已使用额度" />
        <p className="mt-3 text-sm opacity-65">规则版本 {wallet.ruleVersion} · 更新时间 {new Date(wallet.updatedAt).toLocaleString("zh-CN")}</p>
      </Panel>
    </>
  );
}
