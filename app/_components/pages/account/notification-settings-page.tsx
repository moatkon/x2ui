import { getNotificationPreferences } from "@/app/_server/account-data";
import { NotificationSettingsForm } from "../../client/notification-settings-form";
import { SettingsScaffold } from "./settings-scaffold";

export async function NotificationSettingsPage() {
  const { data, etag } = await getNotificationPreferences();
  return (
    <SettingsScaffold active="notifications" title="通知设置">
      <NotificationSettingsForm preferences={data} etag={etag} />
    </SettingsScaffold>
  );
}
