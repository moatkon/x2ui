import { PageHeader, PageTabs, Panel } from "../../shared/ui";

const settingsTabs = [
  ["profile", "资料"],
  ["privacy", "隐私"],
  ["notifications", "通知"],
  ["security", "安全"],
  ["sessions", "设备会话"],
] as const;

export function SettingsScaffold({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader title="设置" description="管理公开资料、隐私、通知与账户安全。" />
      <PageTabs
        items={settingsTabs.map(([key, label]) => ({
          label,
          href: `/settings/${key}`,
          active: key === active,
        }))}
      />
      <Panel title={title}>{children}</Panel>
    </>
  );
}
