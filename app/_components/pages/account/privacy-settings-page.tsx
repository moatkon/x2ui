import { getPrivacyPreferences } from "@/app/_server/account-data";
import { PrivacySettingsForm } from "../../client/privacy-settings-form";
import { SettingsScaffold } from "./settings-scaffold";

export async function PrivacySettingsPage() {
  const { data, etag } = await getPrivacyPreferences();
  return (
    <SettingsScaffold active="privacy" title="隐私设置">
      <PrivacySettingsForm preferences={data} etag={etag} />
    </SettingsScaffold>
  );
}
