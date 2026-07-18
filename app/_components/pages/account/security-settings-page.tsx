import Link from "next/link";
import { getMeSummary } from "@/app/_server/account-data";
import { Notice } from "../../shared/ui";
import { SettingsScaffold } from "./settings-scaffold";

function SettingLink({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm opacity-65">{description}</p>
      </div>
      <Link className="btn" href={href}>{label}</Link>
    </div>
  );
}

export async function SecuritySettingsPage() {
  const me = await getMeSummary();
  const passwordDescription = me.security.passwordChangedAt
    ? `上次修改于 ${new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "long",
        timeZone: "Asia/Shanghai",
      }).format(new Date(me.security.passwordChangedAt))}`
    : "暂无密码修改记录";

  return (
    <SettingsScaffold active="security" title="账户安全">
      <Notice>
        <p>账号邮箱：{me.emailMasked}（{me.emailVerified ? "已验证" : "未验证"}）</p>
      </Notice>
      <div className="mt-5 divide-y-2 divide-base-content/20">
        <SettingLink
          title="登录密码"
          description={passwordDescription}
          href="/settings/security/password"
          label="修改密码"
        />
        <SettingLink
          title="设备会话"
          description={`当前有 ${me.security.activeSessions} 个有效会话`}
          href="/settings/sessions"
          label="管理设备"
        />
      </div>
    </SettingsScaffold>
  );
}
