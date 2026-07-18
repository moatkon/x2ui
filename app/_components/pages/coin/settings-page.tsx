import { getCoinPreferences } from "@/app/_server/coin-data";
import { CoinPreferencesForm } from "../../client/coin-preferences-form";
import { PageHeader, Panel } from "../../shared/ui";

export async function CoinSettingsPage() {
  const { data, etag } = await getCoinPreferences();
  return <><PageHeader title="金币设置" description="管理金币通知与高风险保护。" /><Panel title="偏好"><CoinPreferencesForm value={data} etag={etag} /></Panel></>;
}
