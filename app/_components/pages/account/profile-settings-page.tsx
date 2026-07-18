import { getEditableProfile } from "@/app/_server/account-data";
import { ProfileSettingsForm } from "../../client/profile-settings-form";
import { SettingsScaffold } from "./settings-scaffold";

export async function ProfileSettingsPage() {
  const { data, etag } = await getEditableProfile();
  return (
    <SettingsScaffold active="profile" title="编辑资料">
      <ProfileSettingsForm profile={data} etag={etag} />
    </SettingsScaffold>
  );
}
