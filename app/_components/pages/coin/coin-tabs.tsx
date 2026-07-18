import { PageTabs } from "../../shared/ui";

const tabs = [
  ["wallet", "我的金币", "/coins"],
  ["ledger", "透明账本", "/coins/ledger"],
  ["bounties", "问题悬赏", "/coins/bounties"],
  ["rules", "经济规则", "/coins/rules"],
] as const;

export function CoinTabs({ active }: { active: string }) {
  return <PageTabs items={tabs.map(([key, label, href]) => ({ label, href, active: key === active }))} label="金币页面" />;
}
